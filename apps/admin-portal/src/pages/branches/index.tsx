import { FormSheet } from "@root/src/components/ui/form-sheet";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import BranchCard from "@/branch/branch.card";
import { BranchForm } from "@/branch/branch.form";
import {
  useBranches,
  useBulkDeleteBranches,
  useDuplicateBranch,
  useUpdateBranch,
} from "@/branch/branch.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/branch/branch.options";
import useBranchStore from "@/branch/branch.store";
import BranchesTable from "@/branch/branch.table";
import { Branch, BranchUpdateData } from "@/branch/branch.type";

import useUserStore from "@/stores/use-user-store";

export default function BranchesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadBranches = useUserStore((state) => state.hasPermission("branches.read"));
  const canCreateBranches = useUserStore((state) => state.hasPermission("branches.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableBranch, setActionableBranch] = useState<BranchUpdateData | null>(null);

  const loadingSaveBranch = useBranchStore((state) => state.isLoading);
  const setLoadingSaveBranch = useBranchStore((state) => state.setIsLoading);
  const viewMode = useBranchStore((state) => state.viewMode);
  const isDeleteDialogOpen = useBranchStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useBranchStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useBranchStore((state) => state.selectedRows);
  const setSelectedRows = useBranchStore((state) => state.setSelectedRows);
  const clearSelection = useBranchStore((state) => state.clearSelection);
  const sortRules = useBranchStore((state) => state.sortRules);
  const sortCaseSensitive = useBranchStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useBranchStore((state) => state.sortNullsFirst);
  const searchQuery = useBranchStore((state) => state.searchQuery);
  const filterConditions = useBranchStore((state) => state.filterConditions);
  const filterCaseSensitive = useBranchStore((state) => state.filterCaseSensitive);
  const getFilteredBranches = useBranchStore((state) => state.getFilteredData);
  const getSortedBranches = useBranchStore((state) => state.getSortedData);

  const { data: branches, isLoading: loadingFetchBranches, error } = useBranches();
  const { mutate: duplicateBranch } = useDuplicateBranch();
  const { mutateAsync: deleteBranches, isPending: isDeleting } = useBulkDeleteBranches();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: branches,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableBranch,
    duplicateMutation: duplicateBranch,
    moduleName: "Branches",
  });

  const handleConfirmDelete = createDeleteHandler(deleteBranches, {
    loading: "Branches.loading.delete",
    success: "Branches.success.delete",
    error: "Branches.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredBranches = useMemo(() => {
    return getFilteredBranches(branches || []);
  }, [branches, getFilteredBranches, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedBranches = useMemo(() => {
    return getSortedBranches(filteredBranches);
  }, [filteredBranches, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadBranches) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Branches.title")}
        description={t("Pages.Branches.description")}
      />
      <DataPageLayout>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useBranchStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Branches.title")}
            onAddClick={canCreateBranches ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Branches.add")}
            searchPlaceholder={t("Pages.Branches.search")}
            count={branches?.length}
            hideOptions={branches?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <BranchesTable
              data={sortedBranches}
              isLoading={loadingFetchBranches}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <DataModelList
                data={sortedBranches}
                isLoading={loadingFetchBranches}
                error={error as Error | null}
                emptyMessage={t("Pages.Branches.no_branches_found")}
                renderItem={(branch) => <BranchCard key={branch.id} branch={branch} />}
                gridCols="3"
              />
            </div>
          ) : null}
        </div>

        <FormSheet
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Pages.Branches.edit")}
          formId="branch-form"
          loadingSave={loadingSaveBranch}
        >
          <BranchForm
            formHtmlId={"branch-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableBranch(null);
              setLoadingSaveBranch(false);
            }}
            defaultValues={actionableBranch as Branch}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Branches.confirm_delete")}
          description={t("Branches.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

BranchesPage.messages = ["Pages", "Branches", "Forms", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        BranchesPage.messages,
      ),
    },
  };
};

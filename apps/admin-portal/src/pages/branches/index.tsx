import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import BranchCard from "@/modules/branch/branch.card";
import { BranchForm } from "@/modules/branch/branch.form";
import {
  useBranches,
  useBulkDeleteBranches,
  useDuplicateBranch,
} from "@/modules/branch/branch.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/branch/branch.options";
import useBranchStore from "@/modules/branch/branch.store";
import BranchesTable from "@/modules/branch/branch.table";
import { BranchUpdateData } from "@/modules/branch/branch.type";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

export default function BranchesPage() {
  const t = useTranslations();
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

  const handleConfirmDelete = createDeleteHandler(deleteBranches, {
    loading: "Branches.loading.deleting",
    success: "Branches.success.deleted",
    error: "Branches.error.deleting",
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
 
  const onActionClicked = async (action: string, rowId: string) => {
    console.log(action, rowId);
    if (action === "edit") {
      setIsFormDialogOpen(true);
      setActionableBranch(branches?.find((branch) => branch.id === rowId) || null);
    }

    if (action === "delete") {
      setSelectedRows([rowId]);
      setIsDeleteDialogOpen(true);
    }

    if (action === "duplicate") {
      const toastId = toast.loading(t("General.loading_operation"), {
        description: t("Branches.loading.duplicating"),
      });

      await duplicateBranch(rowId, {
        onSuccess: () => {
          toast.success(t("General.successful_operation"), {
            description: t("Branches.success.duplicated"),
          });
          toast.dismiss(toastId);
        },
        onError: () => {
          toast.error(t("General.error_operation"), {
            description: t("Branches.error.duplicating"),
          });
          toast.dismiss(toastId);
        },
      });
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Branches.title")} description={t("Branches.description")} />
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
            title={t("Branches.title")}
            createHref="/branches/add"
            createLabel={t("Branches.create_branch")}
            searchPlaceholder={t("Branches.search_branches")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <BranchesTable
              data={sortedBranches}
              isLoading={loadingFetchBranches}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedBranches}
                isLoading={loadingFetchBranches}
                error={error as Error | null}
                emptyMessage={t("Branches.no_branches_found")}
                renderItem={(branch) => <BranchCard key={branch.id} branch={branch} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Branches.add_new")}
          formId="branch-form"
          loadingSave={loadingSaveBranch}
        >
          <BranchForm
            id={"branch-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableBranch(null);
              setLoadingSaveBranch(false);
              toast.success(t("General.successful_operation"), {
                description: t("Branches.success.updated"),
              });
            }}
            defaultValues={actionableBranch}
            editMode={true}
          />
        </FormDialog>

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

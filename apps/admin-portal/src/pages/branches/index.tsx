import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

import { FilterCondition } from "@/types/common.type";
import { ViewMode } from "@/types/generic-store-types";

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

import BranchDatasheet from "@/modules/branch/branch.datasheet";
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
  const setViewMode = useBranchStore((state) => state.setViewMode);

  const { data: branches, isLoading: loadingFetchBranches, error } = useBranches();
  const { mutate: duplicateBranch } = useDuplicateBranch();
  const { mutateAsync: deleteBranches, isPending: isDeleting } = useBulkDeleteBranches();
  const { mutate: updateBranch } = useUpdateBranch();
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

  const handleDatasheetChange = (updatedData: Branch[], operations: any[]) => {
    console.log("handleDatasheetChange called:", { updatedData, operations });

    operations.forEach((op) => {
      console.log("Processing operation:", op);
      if (op.type?.toUpperCase() === "UPDATE") {
        const changedRowIndex = op.fromRowIndex;
        const changedRow = updatedData[changedRowIndex];
        console.log("Update operation - changedRow:", changedRow);

        if (changedRow && changedRow.id) {
          const originalRow = branches?.find((b) => b.id === changedRow.id);
          console.log("Update operation - originalRow:", originalRow);

          if (originalRow) {
            type BranchPayload = Partial<Omit<Branch, "id" | "created_at" | "enterprise_id">>;
            const updatePayload: BranchPayload = {};
            let fieldChanged: keyof BranchPayload | null = null;

            const updateableKeys = Object.keys(originalRow).filter(
              (k) => k !== "id" && k !== "created_at" && k !== "enterprise_id",
            ) as (keyof BranchPayload)[];
            console.log("Updateable keys:", updateableKeys);

            for (const K of updateableKeys) {
              if (changedRow[K] !== originalRow[K]) {
                fieldChanged = K;
                updatePayload[fieldChanged] = changedRow[K] as any;
                console.log(`Field ${K} changed to:`, changedRow[K]);
                break;
              }
            }

            if (fieldChanged && Object.keys(updatePayload).length > 0) {
              console.log(`Calling updateBranch for ID ${changedRow.id} with payload:`, updatePayload);
              updateBranch({ id: changedRow.id, data: updatePayload });
            } else {
              console.log("No changes detected or no field identified.");
            }
          } else {
            console.log("Original row not found for ID:", changedRow.id);
          }
        } else {
          console.log("Changed row or row ID is missing.");
        }
      }
    });
  };

  if (!canReadBranches) {
    return <NoPermission />;
  }
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
            onAddClick={canCreateBranches ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Branches.create_new")}
            searchPlaceholder={t("Branches.search_branches")}
            count={branches?.length}
            hideOptions={branches?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <BranchDatasheet data={sortedBranches} onChange={handleDatasheetChange} />
          ) : viewMode === "cards" ? (
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
          ) : null}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Branches.add_new")}
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

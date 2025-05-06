import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
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
  const [displayData, setDisplayData] = useState<Branch[]>([]);

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

  useEffect(() => {
    if (branches) {
      setDisplayData(branches);
    } else {
      setDisplayData([]);
    }
  }, [branches]);

  const { handleAction: onActionClicked } = useDataTableActions({
    data: displayData,
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
      setDisplayData((current) => current.filter((row) => !selectedRows.includes(row.id)));
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredBranches = useMemo(() => {
    return getFilteredBranches(displayData);
  }, [displayData, getFilteredBranches, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedBranches = useMemo(() => {
    return getSortedBranches(filteredBranches);
  }, [filteredBranches, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleDatasheetChange = (updatedData: Branch[], operations: any[]) => {
    console.log("handleDatasheetChange called:", { updatedData, operations });

    let shouldUpdateDisplayData = false; // Flag to update state once after processing all ops

    operations.forEach((op) => {
      console.log("Processing operation:", op);
      const operationType = op.type?.toUpperCase();

      if (operationType === "UPDATE") {
        const changedRowIndex = op.fromRowIndex;
        // Ensure index is valid before proceeding
        if (
          changedRowIndex === undefined ||
          changedRowIndex < 0 ||
          changedRowIndex >= updatedData.length
        ) {
          console.error("Invalid changedRowIndex received in UPDATE operation:", changedRowIndex);
          return; // Skip this operation
        }
        const changedRow = updatedData[changedRowIndex];
        console.log("Update operation - changedRow:", changedRow);

        if (changedRow && changedRow.id) {
          const originalRow = branches?.find((b) => b.id === changedRow.id);
          console.log("Update operation - originalRow:", originalRow);

          if (originalRow) {
            type BranchPayload = Partial<Omit<Branch, "created_at" | "enterprise_id">>;
            const updatePayload: BranchPayload = {};
            let fieldChanged: keyof BranchPayload | null = null;

            // Ensure originalRow properties are checked correctly
            const updateableKeys = Object.keys(originalRow).filter(
              (k): k is keyof BranchPayload =>
                k !== "id" && k !== "created_at" && k !== "enterprise_id" && k in changedRow,
            );
            console.log("Updateable keys:", updateableKeys);

            for (const K of updateableKeys) {
              // Explicitly compare values, handling potential type differences if necessary
              // For simplicity, using !=, but consider stricter checks if types might mismatch (e.g., null vs "")
              if (changedRow[K] !== originalRow[K]) {
                fieldChanged = K;
                // Ensure the type assertion is safe or handle potential mismatches
                updatePayload[fieldChanged] = changedRow[K] as any;
                console.log(`Field ${K} changed from`, originalRow[K], `to:`, changedRow[K]);
                // We only handle one change per operation from datasheet for now
                break;
              }
            }

            if (fieldChanged && Object.keys(updatePayload).length > 0) {
              console.log(
                `Calling updateBranch for ID ${changedRow.id} with payload:`,
                updatePayload,
              );
              // Assuming updateBranch handles potential errors/optimistic updates
              updateBranch({ id: changedRow.id, data: updatePayload as BranchUpdateData });
              shouldUpdateDisplayData = true; // Mark state update needed for optimistic UI
            } else {
              console.log("No changes detected or no field identified for backend update.");
            }
          } else {
            // This might happen if the row was newly created and not yet in the 'branches' data from the initial fetch
            console.log(
              "Original row not found in fetched data for ID:",
              changedRow.id,
              "- likely a new row being edited.",
            );
            // Decide if we should still call update or handle differently
            // For now, assume the update logic primarily targets existing, fetched rows.
            // If editing newly created rows before saving is intended, this needs refinement.
          }
        } else {
          console.log(
            "Changed row, row ID, or required properties are missing in updatedData for UPDATE op.",
          );
        }
      } else if (operationType === "CREATE") {
        console.log("CREATE operation detected. Marking display state for update.");
        // When a row is created by the datasheet, the updatedData array already includes it.
        // We just need to ensure the parent component's state reflects this.
        shouldUpdateDisplayData = true;
      } else if (operationType === "DELETE") {
        console.log("DELETE operation detected. Marking display state for update.");
        // Similar to CREATE, updatedData reflects the deletion.
        shouldUpdateDisplayData = true;
        // Note: Backend deletion should be handled separately, likely via the selection mode delete button
      }
    });

    // Update the displayData state *once* if any relevant operation occurred
    if (shouldUpdateDisplayData) {
      console.log("Updating displayData state with the latest data from datasheet operations.");
      setDisplayData(updatedData);
    }
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
            count={displayData?.length}
            hideOptions={displayData?.length === 0}
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

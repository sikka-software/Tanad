import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import BranchCard from "@/modules/branch/branch.card";
import BranchesTable from "@/modules/branch/branch.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Branch } from "@/modules/branch/branch.type";

import { useBranches, useBulkDeleteBranches } from "@/hooks/models/useBranches";
import { useBranchesStore } from "@/modules/branch/branch.store";

export default function BranchesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: branches, isLoading, error } = useBranches();

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useBranchesStore();
  const { mutate: deleteBranches, isPending: isDeleting } = useBulkDeleteBranches();

  const filteredBranches = branches?.filter(
    (branch: Branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRowSelectionChange = (rows: Branch[]) => {
    const newSelectedIds = rows.map((row) => row.id);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBranches(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete branches:", error);
          toast.error(t("Branches.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete branches:", error);
      setIsDeleteDialogOpen(false);
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
            title={t("Branches.title")}
            createHref="/branches/add"
            createLabel={t("Branches.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Branches.search_branches")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <BranchesTable
              data={filteredBranches || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onSelectedRowsChange={handleRowSelectionChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredBranches || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Branches.no_branches_found")}
                renderItem={(branch: Branch) => <BranchCard branch={branch} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Branches.confirm_delete_title")}
          description={t("Branches.confirm_delete", { count: selectedRows.length })}
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

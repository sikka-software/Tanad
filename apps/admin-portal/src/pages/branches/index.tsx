import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import BranchCard from "@/components/app/branch/branch.card";
import BranchesTable from "@/components/app/branch/branch.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";
import ConfirmDelete from "@/components/ui/confirm-delete";

import { Branch } from "@/types/branch.type";

import { useBranches } from "@/hooks/useBranches";
import { useBranchesStore } from "@/stores/branches.store";
import { useBulkDeleteBranches } from "@/hooks/useBranches";

export default function BranchesPage() {
  const t = useTranslations("Branches");
  const { data: branches, isLoading, error } = useBranches();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { selectedRows, setSelectedRows, clearSelection } = useBranchesStore();
  const { mutate: deleteBranches, isPending: isDeleting } = useBulkDeleteBranches();

  const filteredBranches = branches?.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (branch.manager?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const handleRowSelectionChange = (rows: Branch[]) => {
    setSelectedRows(rows.map((row) => row.id));
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteBranches(selectedRows, {
      onSuccess: () => {
        clearSelection();
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const renderBranch = (branch: Branch) => <BranchCard branch={branch} />;

  return (
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
          title={t("title")}
          createHref="/branches/add"
          createLabel={t("add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("search_branches")}
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
              emptyMessage={t("no_branches_found")}
              renderItem={renderBranch}
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
        title={t("confirm_delete")}
        description={t("delete_description", { count: selectedRows.length })}
      />
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

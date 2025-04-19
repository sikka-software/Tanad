import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import BranchCard from "@/modules/branch/branch.card";
import { useBranches, useBulkDeleteBranches } from "@/modules/branch/branch.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/branch/branch.options";
import { useBranchesStore } from "@/modules/branch/branch.store";
import BranchesTable from "@/modules/branch/branch.table";

export default function BranchesPage() {
  const t = useTranslations();

  const viewMode = useBranchesStore((state) => state.viewMode);
  const isDeleteDialogOpen = useBranchesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useBranchesStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useBranchesStore((state) => state.selectedRows);
  const clearSelection = useBranchesStore((state) => state.clearSelection);
  const sortRules = useBranchesStore((state) => state.sortRules);
  const sortCaseSensitive = useBranchesStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useBranchesStore((state) => state.sortNullsFirst);
  const searchQuery = useBranchesStore((state) => state.searchQuery);
  const filterConditions = useBranchesStore((state) => state.filterConditions);
  const filterCaseSensitive = useBranchesStore((state) => state.filterCaseSensitive);
  const getFilteredBranches = useBranchesStore((state) => state.getFilteredBranches);
  const getSortedBranches = useBranchesStore((state) => state.getSortedBranches);

  const { data: branches, isLoading, error } = useBranches();
  const { mutate: deleteBranches, isPending: isDeleting } = useBulkDeleteBranches();

  const filteredBranches = useMemo(() => {
    return getFilteredBranches(branches || []);
  }, [branches, getFilteredBranches, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedBranches = useMemo(() => {
    return getSortedBranches(filteredBranches);
  }, [filteredBranches, sortRules, sortCaseSensitive, sortNullsFirst]);

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
            store={useBranchesStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Branches.title")}
            createHref="/branches/add"
            createLabel={t("Branches.add_new")}
            searchPlaceholder={t("Branches.search_branches")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <BranchesTable
              data={sortedBranches}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedBranches}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Branches.no_branches_found")}
                renderItem={(branch) => <BranchCard branch={branch} />}
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

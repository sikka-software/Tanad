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

import SalaryCard from "@/modules/salary/salary.card";
import { useSalaries, useBulkDeleteSalaries } from "@/modules/salary/salary.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/salary/salary.options";
import useSalaryStore from "@/modules/salary/salary.store";
import SalariesTable from "@/modules/salary/salary.table";

export default function SalariesPage() {
  const t = useTranslations();

  const viewMode = useSalaryStore((state) => state.viewMode);
  const isDeleteDialogOpen = useSalaryStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useSalaryStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useSalaryStore((state) => state.selectedRows);
  const clearSelection = useSalaryStore((state) => state.clearSelection);
  const sortRules = useSalaryStore((state) => state.sortRules);
  const sortCaseSensitive = useSalaryStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useSalaryStore((state) => state.sortNullsFirst);
  const searchQuery = useSalaryStore((state) => state.searchQuery);
  const filterConditions = useSalaryStore((state) => state.filterConditions);
  const filterCaseSensitive = useSalaryStore((state) => state.filterCaseSensitive);
  const getFilteredSalaries = useSalaryStore((state) => state.getFilteredData);
  const getSortedSalaries = useSalaryStore((state) => state.getSortedData);

  const { data: salaries, isLoading, error } = useSalaries();
  const { mutate: deleteSalaries, isPending: isDeleting } = useBulkDeleteSalaries();

  const filteredSalaries = useMemo(() => {
    return getFilteredSalaries(salaries || []);
  }, [salaries, getFilteredSalaries, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedSalaries = useMemo(() => {
    return getSortedSalaries(filteredSalaries);
  }, [filteredSalaries, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    try {
      await deleteSalaries(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
          toast.success(t("General.successful_operation"), {
            description: t("Salaries.messages.success_deleted"),
          });
        },
        onError: () => {
          toast.error(t("General.error_operation"), {
            description: t("Salaries.messages.error_delete"),
          });
        },
      });
    } catch (error) {
      console.error("Failed to delete salaries:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Salaries.title")} description={t("Salaries.description")} />
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
            store={useSalaryStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Salaries.title")}
            createHref="/salaries/add"
            createLabel={t("Salaries.create_salary")}
            searchPlaceholder={t("Salaries.search_salaries")}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <SalariesTable
              data={sortedSalaries}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedSalaries}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Salaries.no_salaries_found")}
                renderItem={(salary) => <SalaryCard key={salary.id} salary={salary} />}
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
          title={t("Salaries.delete_salary")}
          description={t("Salaries.confirm_delete")}
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

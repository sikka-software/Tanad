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

import ExpenseCard from "@/modules/expense/expense.card";
import { useExpenses, useBulkDeleteExpenses } from "@/modules/expense/expense.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/expense/expense.options";
import { useExpenseStore } from "@/modules/expense/expense.store";
import ExpensesTable from "@/modules/expense/expense.table";

export default function ExpensesPage() {
  const t = useTranslations();

  const viewMode = useExpenseStore((state) => state.viewMode);
  const isDeleteDialogOpen = useExpenseStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useExpenseStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useExpenseStore((state) => state.selectedRows);
  const clearSelection = useExpenseStore((state) => state.clearSelection);
  const sortRules = useExpenseStore((state) => state.sortRules);
  const sortCaseSensitive = useExpenseStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useExpenseStore((state) => state.sortNullsFirst);
  const searchQuery = useExpenseStore((state) => state.searchQuery);
  const filterConditions = useExpenseStore((state) => state.filterConditions);
  const filterCaseSensitive = useExpenseStore((state) => state.filterCaseSensitive);
  const getFilteredExpenses = useExpenseStore((state) => state.getFilteredExpenses);
  const getSortedExpenses = useExpenseStore((state) => state.getSortedExpenses);

  const { data: expenses, isLoading, error } = useExpenses();
  const { mutate: deleteExpenses, isPending: isDeleting } = useBulkDeleteExpenses();

  const filteredExpenses = useMemo(() => {
    return getFilteredExpenses(expenses || []);
  }, [expenses, getFilteredExpenses, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedExpenses = useMemo(() => {
    return getSortedExpenses(filteredExpenses);
  }, [filteredExpenses, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    try {
      await deleteExpenses(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete expenses:", error);
          toast.error(t("Expenses.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete expenses:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Expenses.title")} description={t("Expenses.description")} />
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
            store={useExpenseStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Expenses.title")}
            createHref="/expenses/add"
            createLabel={t("Expenses.add_new")}
            searchPlaceholder={t("Expenses.search_expenses")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ExpensesTable
              data={sortedExpenses}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedExpenses}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Expenses.no_expenses_found")}
                renderItem={(expense) => <ExpenseCard expense={expense} />}
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
          title={t("Expenses.confirm_delete_title")}
          description={t("Expenses.confirm_delete", { count: selectedRows.length })}
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

import { pick } from "lodash";
import { GetServerSideProps } from "next";
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

import ExpenseCard from "@/expense/expense.card";
import { ExpenseForm } from "@/expense/expense.form";
import { useExpenses, useBulkDeleteExpenses, useDuplicateExpense } from "@/expense/expense.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/expense/expense.options";
import useExpenseStore from "@/expense/expense.store";
import ExpensesTable from "@/expense/expense.table";
import { ExpenseUpdateData } from "@/expense/expense.type";

import useUserStore from "@/stores/use-user-store";

export default function ExpensesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadExpenses = useUserStore((state) => state.hasPermission("expenses.read"));
  const canCreateExpenses = useUserStore((state) => state.hasPermission("expenses.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableExpense, setActionableExpense] = useState<ExpenseUpdateData | null>(null);

  const loadingSaveExpense = useExpenseStore((state) => state.isLoading);
  const setLoadingSaveExpense = useExpenseStore((state) => state.setIsLoading);
  const viewMode = useExpenseStore((state) => state.viewMode);
  const isDeleteDialogOpen = useExpenseStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useExpenseStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useExpenseStore((state) => state.selectedRows);
  const setSelectedRows = useExpenseStore((state) => state.setSelectedRows);
  const clearSelection = useExpenseStore((state) => state.clearSelection);
  const sortRules = useExpenseStore((state) => state.sortRules);
  const sortCaseSensitive = useExpenseStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useExpenseStore((state) => state.sortNullsFirst);
  const searchQuery = useExpenseStore((state) => state.searchQuery);
  const filterConditions = useExpenseStore((state) => state.filterConditions);
  const filterCaseSensitive = useExpenseStore((state) => state.filterCaseSensitive);
  const getFilteredExpenses = useExpenseStore((state) => state.getFilteredData);
  const getSortedExpenses = useExpenseStore((state) => state.getSortedData);

  const { data: expenses, isLoading: loadingFetchExpenses, error } = useExpenses();
  const { mutateAsync: deleteExpenses, isPending: isDeleting } = useBulkDeleteExpenses();
  const { mutate: duplicateExpense } = useDuplicateExpense();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: expenses,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableExpense,
    duplicateMutation: duplicateExpense,
    moduleName: "Expenses",
  });

  const handleConfirmDelete = createDeleteHandler(deleteExpenses, {
    loading: "Expenses.loading.delete",
    success: "Expenses.success.delete",
    error: "Expenses.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredExpenses = useMemo(() => {
    return getFilteredExpenses(expenses || []);
  }, [expenses, getFilteredExpenses, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedExpenses = useMemo(() => {
    return getSortedExpenses(filteredExpenses);
  }, [filteredExpenses, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadExpenses) {
    return <NoPermission />;
  }

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
            title={t("Pages.Expenses.title")}
            onAddClick={canCreateExpenses ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Expenses.add")}
            searchPlaceholder={t("Pages.Expenses.search")}
            count={expenses?.length}
            hideOptions={expenses?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ExpensesTable
              data={sortedExpenses}
              isLoading={loadingFetchExpenses}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedExpenses}
                isLoading={loadingFetchExpenses}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Pages.Expenses.no_expenses_found")}
                renderItem={(expense) => <ExpenseCard expense={expense} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableExpense ? t("Pages.Expenses.edit") : t("Pages.Expenses.add")}
          formId="expense-form"
          loadingSave={loadingSaveExpense}
        >
          <ExpenseForm
            formHtmlId={"expense-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableExpense(null);
              setLoadingSaveExpense(false);
              toast.success(t("General.successful_operation"), {
                description: t("Expenses.success.update"),
              });
            }}
            defaultValues={actionableExpense}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Expenses.confirm_delete_title")}
          description={t("Expenses.confirm_delete", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

ExpensesPage.messages = ["Notes", "Pages", "Expenses", "Forms", "General"];
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        ExpensesPage.messages,
      ),
    },
  };
};

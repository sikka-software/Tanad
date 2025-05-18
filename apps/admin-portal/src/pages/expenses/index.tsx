import { pick } from "lodash";
import { File, Plus, ReceiptText } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import ExpenseCard from "@/expense/expense.card";
import useExpenseColumns from "@/expense/expense.columns";
import { ExpenseForm } from "@/expense/expense.form";
import { useExpenses, useBulkDeleteExpenses, useDuplicateExpense } from "@/expense/expense.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/expense/expense.options";
import useExpenseStore from "@/expense/expense.store";
import ExpensesTable from "@/expense/expense.table";
import { ExpenseUpdateData } from "@/expense/expense.type";

export default function ExpensesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useExpenseColumns();

  const moduleHooks = createModuleStoreHooks(useExpenseStore, "expenses");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<ExpenseUpdateData | null>(null);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: expenses, isLoading, error } = useExpenses();
  const { mutateAsync: deleteExpenses, isPending: isDeleting } = useBulkDeleteExpenses();
  const { mutate: duplicateExpense } = useDuplicateExpense();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: expenses,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateExpense,
    previewAction: (id: string) => {
      window.open(`/pay/${id}`, "_blank");
    },
    moduleName: "Expenses",
  });

  const handleConfirmDelete = createDeleteHandler(deleteExpenses, {
    loading: "Expenses.loading.delete",
    success: "Expenses.success.delete",
    error: "Expenses.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useExpenseStore((state) => state.data) || [];
  const setData = useExpenseStore((state) => state.setData);

  useEffect(() => {
    if (expenses && setData) {
      setData(expenses);
    }
  }, [expenses, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Expenses.title")}
        description={t("Pages.Expenses.description")}
      />
      <DataPageLayout count={expenses?.length} itemsText={t("Pages.Expenses.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useExpenseStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useExpenseStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Expenses.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Expenses.add")}
            searchPlaceholder={t("Pages.Expenses.search")}
            hideOptions={expenses?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ExpensesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Expenses.create_first.title"),
                  description: t("Expenses.create_first.description"),
                  add: t("Pages.Expenses.add"),
                  icons: [ReceiptText, Plus, ReceiptText],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(expense) => (
                  <ExpenseCard expense={expense} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Expenses.edit") : t("Pages.Expenses.add")}
          formId="expense-form"
          loadingSave={loadingSave}
        >
          <ExpenseForm
            formHtmlId={"expense-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Expenses.confirm_delete", { count: selectedRows.length })}
          description={t("Expenses.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

ExpensesPage.messages = ["Metadata", "Notes", "Pages", "Expenses", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      ExpensesPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};

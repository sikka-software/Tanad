import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateExpense } from "@/expense/expense.hooks";
import useExpenseStore from "@/expense/expense.store";
import { Expense } from "@/expense/expense.type";

import useUserStore from "@/stores/use-user-store";

import useExpenseColumns from "./expense.columns";

const ExpensesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Expense>) => {
  const t = useTranslations();

  const columns = useExpenseColumns();

  const { mutate: updateExpense } = useUpdateExpense();
  const selectedRows = useExpenseStore((state) => state.selectedRows);
  const setSelectedRows = useExpenseStore((state) => state.setSelectedRows);

  const columnVisibility = useExpenseStore((state) => state.columnVisibility);
  const setColumnVisibility = useExpenseStore((state) => state.setColumnVisibility);

  const canEditExpense = useUserStore((state) => state.hasPermission("expenses.update"));
  const canDuplicateExpense = useUserStore((state) => state.hasPermission("expenses.duplicate"));
  const canViewExpense = useUserStore((state) => state.hasPermission("expenses.view"));
  const canArchiveExpense = useUserStore((state) => state.hasPermission("expenses.archive"));
  const canDeleteExpense = useUserStore((state) => state.hasPermission("expenses.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "expense_id") return;
    await updateExpense({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Expense[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const expenseTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Expense) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditExpense}
      canDuplicateAction={canDuplicateExpense}
      canViewAction={canViewExpense}
      canArchiveAction={canArchiveExpense}
      canDeleteAction={canDeleteExpense}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={expenseTableOptions}
      onActionClicked={onActionClicked}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default ExpensesTable;

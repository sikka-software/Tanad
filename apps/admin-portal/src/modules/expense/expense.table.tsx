import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateExpense } from "@/expense/expense.hooks";
import useExpenseStore from "@/expense/expense.store";
import { Expense } from "@/expense/expense.type";

import useUserStore from "@/stores/use-user-store";

const ExpensesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Expense>) => {
  const t = useTranslations();
  const { mutate: updateExpense } = useUpdateExpense();
  const selectedRows = useExpenseStore((state) => state.selectedRows);
  const setSelectedRows = useExpenseStore((state) => state.setSelectedRows);

  const canEditExpense = useUserStore((state) => state.hasPermission("expenses.update"));
  const canDuplicateExpense = useUserStore((state) => state.hasPermission("expenses.duplicate"));
  const canViewExpense = useUserStore((state) => state.hasPermission("expenses.view"));
  const canArchiveExpense = useUserStore((state) => state.hasPermission("expenses.archive"));
  const canDeleteExpense = useUserStore((state) => state.hasPermission("expenses.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Expense>[] = [
    {
      accessorKey: "expense_number",
      header: t("Expenses.form.expense_number.label"),
      validationSchema: z.string().min(1, t("Expenses.form.expense_number.required")),
    },
    {
      accessorKey: "issue_date",
      header: t("Expenses.form.issue_date.label"),
      validationSchema: z.string().min(1, t("Expenses.form.issue_date.required")),
    },
    {
      accessorKey: "due_date",
      header: t("Expenses.form.due_date.label"),
      validationSchema: z.string().min(1, t("Expenses.form.due_date.required")),
    },
    {
      accessorKey: "status",
      header: t("Expenses.form.status.label"),
      validationSchema: z.string().min(1, t("Expenses.form.status.required")),
      cell: ({ row }) => t(`Expenses.form.status.${row.getValue("status")}`),
    },
    {
      accessorKey: "amount",
      header: t("Expenses.form.amount.label"),
      validationSchema: z.number().min(0, t("Expenses.form.amount.required")),
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount as number);
      },
    },
    {
      accessorKey: "category",
      header: t("Expenses.form.category.label"),
      validationSchema: z.string().min(1, t("Expenses.form.category.required")),
    },
    {
      accessorKey: "notes",
      header: t("Expenses.form.notes.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "client_id",
      header: t("Expenses.form.client_id.label"),
      validationSchema: z.string().min(1, t("Expenses.form.client_id.required")),
    },
  ];

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
      canEditAction={canEditExpense}
      canDuplicateAction={canDuplicateExpense}
      canViewAction={canViewExpense}
      canArchiveAction={canArchiveExpense}
      canDeleteAction={canDeleteExpense}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={expenseTableOptions}
      onActionClicked={onActionClicked}
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

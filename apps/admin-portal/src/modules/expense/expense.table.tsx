import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useExpenseStore } from "@/modules/expense/expense.store";
import { Expense } from "@/modules/expense/expense.type";

import { useUpdateExpense } from "./expense.hooks";

const expenseNumberSchema = z.string().min(1, "Required");
const issue_dateSchema = z.string().min(1, "Required");
const due_dateSchema = z.string().min(1, "Required");
const statusSchema = z.enum(["pending", "paid", "overdue"]);
const amountSchema = z.number().min(0, "Required");
const categorySchema = z.string().min(1, "Required");
const notesSchema = z.string().nullable();
const clientIdSchema = z.string().min(1, "Required");

interface ExpensesTableProps {
  data: Expense[];
  isLoading?: boolean;
  error?: Error | null;
}

const ExpensesTable = ({ data, isLoading, error }: ExpensesTableProps) => {
  const t = useTranslations();
  const { mutate: updateExpense } = useUpdateExpense();
  const selectedRows = useExpenseStore((state) => state.selectedRows);
  const setSelectedRows = useExpenseStore((state) => state.setSelectedRows);

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Expense>[] = [
    {
      accessorKey: "expenseNumber",
      header: t("Expenses.form.expenseNumber.label"),
      validationSchema: expenseNumberSchema,
    },
    {
      accessorKey: "issue_date",
      header: t("Expenses.form.issue_date.label"),
      validationSchema: issue_dateSchema,
    },
    {
      accessorKey: "due_date",
      header: t("Expenses.form.due_date.label"),
      validationSchema: due_dateSchema,
    },
    {
      accessorKey: "status",
      header: t("Expenses.form.status.label"),
      validationSchema: statusSchema,
      cell: ({ row }) => t(`Expenses.form.status.options.${row.getValue("status")}`),
    },
    {
      accessorKey: "amount",
      header: t("Expenses.form.amount.label"),
      validationSchema: amountSchema,
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
      validationSchema: categorySchema,
    },
    {
      accessorKey: "notes",
      header: t("Expenses.form.notes.label"),
      validationSchema: notesSchema,
    },
    {
      accessorKey: "client_id",
      header: t("Expenses.form.client_id.label"),
      validationSchema: clientIdSchema,
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "expense_id") return;
    await updateExpense({ id: rowId, expense: { [columnId]: value } });
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
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={expenseTableOptions}
    />
  );
};

export default ExpensesTable;

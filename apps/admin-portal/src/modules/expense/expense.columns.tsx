import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useAppCurrencySymbol } from "@/lib/currency-utils";
import { useFormatDate } from "@/lib/date-utils";

import { Expense } from "@/expense/expense.type";

const useExpenseColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Expense>[] = [
    {
      accessorKey: "expense_number",
      header: t("Expenses.form.expense_number.label"),
    },
    {
      accessorKey: "issue_date",
      header: t("Expenses.form.issue_date.label"),
      cell: ({ row }) => useFormatDate(row.original.issue_date),
    },
    {
      accessorKey: "due_date",
      header: t("Expenses.form.due_date.label"),
      cell: ({ row }) => useFormatDate(row.original.due_date),
    },
    {
      accessorKey: "amount",
      header: t("Expenses.form.amount.label"),
      cell: ({ row }) => {
        return (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(row.getValue("amount"))}
            {useAppCurrencySymbol().symbol}
          </span>
        );
      },
    },
    {
      accessorKey: "category",
      header: t("Expenses.form.category.label"),
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      header: t("Expenses.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={[
            { label: t("Expenses.form.status.paid"), value: "paid" },
            { label: t("Expenses.form.status.pending"), value: "pending" },
            { label: t("Expenses.form.status.rejected"), value: "rejected" },
            { label: t("Expenses.form.status.overdue"), value: "overdue" },
          ]}
        />
      ),
    },
  ];

  return columns;
};

export default useExpenseColumns;

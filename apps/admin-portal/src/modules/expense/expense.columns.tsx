import { MoneyFormatter } from "@root/src/components/ui/currency-input";
import { getCurrencySymbol } from "@root/src/lib/currency-utils";
import useUserStore from "@root/src/stores/use-user-store";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Expense } from "./expense.type";

const useExpenseColumns = () => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

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
      accessorKey: "amount",
      header: t("Expenses.form.amount.label"),
      validationSchema: z.number().min(0, t("Expenses.form.amount.required")),
      cell: ({ row }) => {
        return (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(row.getValue("amount"))}
            {getCurrencySymbol(currency || "sar").symbol}
          </span>
        );
      },
    },
    {
      accessorKey: "category",
      header: t("Expenses.form.category.label"),
      validationSchema: z.string().min(1, t("Expenses.form.category.required")),
    },

    {
      accessorKey: "status",
      header: t("Expenses.form.status.label"),
      validationSchema: z.enum(["paid", "pending", "rejected", "overdue"]),
      cellType: "select",
      options: [
        { label: t("Expenses.form.status.paid"), value: "paid" },
        { label: t("Expenses.form.status.pending"), value: "pending" },
        { label: t("Expenses.form.status.rejected"), value: "rejected" },
        { label: t("Expenses.form.status.overdue"), value: "overdue" },
      ],
    },
  ];

  return columns;
};

export default useExpenseColumns;

import { Calendar, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";
import { MoneyFormatter } from "@/components/ui/inputs/currency-input";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { useUpdateExpense } from "@/expense/expense.hooks";
import useExpenseStore from "@/expense/expense.store";
import { Expense, ExpenseStatus, ExpenseStatusProps } from "@/expense/expense.type";

import useUserStore from "@/stores/use-user-store";

const ExpenseCard = ({
  expense,
  onActionClicked,
}: {
  expense: Expense;
  onActionClicked: (action: string, id: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateExpense } = useUpdateExpense();
  const data = useExpenseStore((state) => state.data);
  const setData = useExpenseStore((state) => state.setData);
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateExpense({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={expense.id}
      title={expense.expense_number}
      subtitle={expense.category || ""}
      currentStatus={expense.status as ExpenseStatusProps}
      statuses={Object.values(ExpenseStatus) as ExpenseStatusProps[]}
      parentTranslationKey="Expenses"
      onStatusChange={(status: ExpenseStatusProps) => handleEdit(expense.id, "status", status)}
      onEdit={() => onActionClicked("edit", expense.id)}
      onDelete={() => onActionClicked("delete", expense.id)}
      onDuplicate={() => onActionClicked("duplicate", expense.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="money">
            {MoneyFormatter(expense.amount)}
            {getCurrencySymbol(currency || "sar").symbol}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {t("Expenses.form.issue_date.label")}:{" "}
            {expense.issue_date ? new Date(expense.issue_date).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {t("Expenses.form.due_date.label")}:{" "}
            {expense.due_date ? new Date(expense.due_date).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Tag className="h-4 w-4" />
          <span>{expense.category}</span>
        </div>
      </div>
    </ModuleCard>
  );
};

export default ExpenseCard;

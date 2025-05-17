import { parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { Calendar, CalendarClock, CalendarPlus, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDateFormatter } from "react-aria";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import ModuleCard from "@/components/cards/module-card";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

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
  const formatter = useDateFormatter();
  const { mutate: updateExpense } = useUpdateExpense();
  const data = useExpenseStore((state) => state.data);
  const setData = useExpenseStore((state) => state.setData);
  const currency = useAppCurrencySymbol({
    all: { className: "size-4" },
  }).symbol;

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
      // className="justify-start"
    >
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarPlus className="h-4 w-4" />
            <span>
              {t("Expenses.form.issue_date.label")}:{" "}
              {expense.issue_date ? format(new Date(expense.issue_date), "dd/MM/yyyy") : "N/A"}
            </span>
          </div>
          {expense.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CalendarClock className="h-4 w-4" />
              <span>
                {t("Expenses.form.due_date.label")}:{" "}
                {expense.due_date ? format(new Date(expense.due_date), "dd/MM/yyyy") : "N/A"}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="money text-xl font-bold">
            {MoneyFormatter(expense.amount)}
            {currency}
          </span>
        </div>
      </div>
    </ModuleCard>
  );
};

export default ExpenseCard;

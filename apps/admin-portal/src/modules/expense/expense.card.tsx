import { Calendar, DollarSign, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Expense } from "@/expense/expense.type";

const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const t = useTranslations();
  return (
    <Card key={expense.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{expense.expense_number}</h3>
            <p className="text-sm text-gray-500">{expense.category}</p>
          </div>
          <Badge
            variant={
              expense.status === "paid"
                ? "default"
                : expense.status === "rejected"
                  ? "destructive"
                  : "secondary"
            }
          >
            {t(`Expenses.form.status.${expense.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(expense.amount)}
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
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;

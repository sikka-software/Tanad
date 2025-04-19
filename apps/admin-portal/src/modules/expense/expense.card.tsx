import { Calendar, DollarSign, FileText, Tag, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Expense } from "@/modules/expense/expense.type";

const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const t = useTranslations();
  return (
    <Card key={expense.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{expense.expenseNumber}</h3>
            <p className="text-sm text-gray-500">{expense.category}</p>
          </div>
          <Badge
            variant={
              expense.status === "paid"
                ? "default"
                : expense.status === "overdue"
                  ? "destructive"
                  : "secondary"
            }
          >
            {t(`Expenses.status.${expense.status}`)}
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
              {t("Expenses.form.issueDate.label")}:{" "}
              {new Date(expense.issueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {t("Expenses.form.dueDate.label")}: {new Date(expense.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Tag className="h-4 w-4" />
            <span>{expense.category}</span>
          </div>
          {expense.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="mt-1 h-4 w-4" />
              <p>{expense.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;

import { CalendarDays, CircleDollarSign, ReceiptText, NotebookText, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import { useDeleteSalary } from "@/salary/salary.hooks";
import { Salary } from "@/salary/salary.type";

// Helper to format date string (optional)
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Helper to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

const SalaryCard = ({ salary }: { salary: Salary }) => {
  const router = useRouter();
  const t = useTranslations("Salaries");
  const deleteSalaryMutation = useDeleteSalary();

  const handleDelete = (id: string) => {
    if (window.confirm(t("General.confirm_delete"))) {
      deleteSalaryMutation.mutate(id, {
        onSuccess: () => {
          toast.success(t("General.successful_operation"), {
            description: t("Salaries.success.delete"),
          });
        },
        onError: (err) => {
          toast.error(t("General.error_operation"), {
            description: t("Salaries.error.delete"),
          });
        },
      });
    }
  };

  return (
    <Card key={salary.id} className="relative transition-shadow hover:shadow-lg">
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/salaries/${salary.id}/edit`);
          }}
          aria-label={t("Salaries.edit_salary")}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(salary.id);
          }}
          disabled={deleteSalaryMutation.isPending}
          aria-label={t("Salaries.delete_salary")}
        >
          {deleteSalaryMutation.isPending ? "..." : "Del"}
        </Button>
      </div>

      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-lg">{salary.employee_name}</CardTitle>
        </div>
        <p className="pt-1 text-sm text-gray-500">Paid on: {formatDate(salary.payment_date)}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>{`${formatDate(salary.pay_period_start)} - ${formatDate(salary.pay_period_end)}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CircleDollarSign className="h-4 w-4" />
            <span>Gross: {formatCurrency(salary.gross_amount)}</span>
            <span className="mx-1">|</span>
            <span>Net: {formatCurrency(salary.net_amount)}</span>
          </div>
          {salary.deductions && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <ReceiptText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p>Deductions included</p>
            </div>
          )}
          {salary.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{salary.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryCard;

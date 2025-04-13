import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { User, CalendarDays, CircleDollarSign, ReceiptText, NotebookText } from "lucide-react";
import { toast } from "sonner";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useSalaries } from "@/hooks/useSalaries";
// Import the salaries hook
import { useDeleteSalary } from "@/hooks/useSalaries";
import type { Salary } from "@/types/salary.type";

// For delete feedback

// Helper to format date string (optional)
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    // Assuming dateString is YYYY-MM-DD or includes time
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString; // Return original if parsing fails
  }
};

// Helper to format currency (requires Intl object)
const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  // Replace 'en-US' and 'USD' with appropriate locale/currency if needed
};

export default function SalariesPage() {
  const t = useTranslations("Salaries");
  const router = useRouter(); // Get router for navigation
  const { data: salaries, ,isLoading, error } = useSalaries();
  const deleteSalaryMutation = useDeleteSalary(); // Hook for deletion

  const handleDelete = (id: string) => {
    if (window.confirm(t("confirm_delete"))) {
      // Add confirm_delete translation
      deleteSalaryMutation.mutate(id, {
        onSuccess: () => {
          toast.success(t("success.title"), {
            description: t("messages.success_deleted"), // Add success_deleted translation
          });
          // Data will refetch automatically due to query invalidation in the hook
        },
        onError: (err) => {
          toast.error(t("error.title"), {
            description: err instanceof Error ? err.message : t("messages.error_delete"), // Add error_delete
          });
        },
      });
    }
  };

  // Render function for a single salary card
  const renderSalary = (salary: Salary) => (
    <Card key={salary.id} className="relative transition-shadow hover:shadow-lg">
      {/* Actions Button (Top Right) */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            router.push(`/salaries/${salary.id}/edit`);
          }}
          aria-label={t("edit_salary")} // Add edit_salary translation
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            handleDelete(salary.id);
          }}
          disabled={deleteSalaryMutation.isPending}
          aria-label={t("delete_salary")} // Add delete_salary translation
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
          {/* Pay Period */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>{`${formatDate(salary.pay_period_start)} - ${formatDate(salary.pay_period_end)}`}</span>
          </div>
          {/* Amounts */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CircleDollarSign className="h-4 w-4" />
            <span>Gross: {formatCurrency(salary.gross_amount)}</span>
            <span className="mx-1">|</span>
            <span>Net: {formatCurrency(salary.net_amount)}</span>
          </div>
          {/* Deductions (simplified view) */}
          {salary.deductions && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <ReceiptText className="mt-1 h-4 w-4 flex-shrink-0" />
              {/* Displaying keys or count might be better than raw JSON */}
              <p>Deductions included</p>
              {/* <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-20">
                {JSON.stringify(salary.deductions, null, 2)}
              </pre> */}
            </div>
          )}
          {/* Notes */}
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

  return (
    <DataPageLayout>
      <PageTitle
        title={t("title")} // Salaries.title
        createButtonLink="/salaries/add"
        createButtonText={t("create_salary")} // Salaries.create_salary
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={salaries}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("no_salaries_found")} // Salaries.no_salaries_found
          renderItem={renderSalary}
          gridCols="3" // Adjust as needed, maybe 2 for more details?
          // Add key prop if not handled internally by DataModelList
        />
      </div>
    </DataPageLayout>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};

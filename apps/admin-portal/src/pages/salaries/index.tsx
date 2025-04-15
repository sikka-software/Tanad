import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { User, CalendarDays, CircleDollarSign, ReceiptText, NotebookText } from "lucide-react";
import { toast } from "sonner";

import DataPageLayout from "@/components/layouts/data-page-layout";
import SalariesTable from "@/components/tables/salaries-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useSalaries } from "@/hooks/useSalaries";
import { useDeleteSalary } from "@/hooks/useSalaries";
import type { Salary } from "@/types/salary.type";

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

export default function SalariesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: salaries, isLoading, error } = useSalaries();
  const deleteSalaryMutation = useDeleteSalary();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredSalaries = salaries?.filter(
    (salary) =>
      salary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salary.notes || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (window.confirm(t("General.confirm_delete"))) {
      deleteSalaryMutation.mutate(id, {
        onSuccess: () => {
          toast.success(t("General.successful_operation"), {
            description: t("Salaries.messages.success_deleted"),
          });
        },
        onError: (err) => {
          toast.error(t("General.error_operation"), {
            description: err instanceof Error ? err.message : t("Salaries.messages.error_delete"),
          });
        },
      });
    }
  };

  // Render function for a single salary card
  const renderSalary = (salary: Salary) => (
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

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("Salaries.title")}
        createHref="/salaries/add"
        createLabel={t("Salaries.create_salary")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("Salaries.search_salaries")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div>
        {viewMode === "table" ? (
          <SalariesTable
            data={filteredSalaries || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredSalaries || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Salaries.no_salaries_found")}
              renderItem={renderSalary}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};

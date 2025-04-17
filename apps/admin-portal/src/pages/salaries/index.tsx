import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import SalaryCard from "@/components/app/salary/salary.card";
import SalariesTable from "@/components/app/salary/salary.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import type { Salary } from "@/types/salary.type";

import { useSalaries } from "@/hooks/useSalaries";

export default function SalariesPage() {
  const t = useTranslations();
  const { data: salaries, isLoading, error } = useSalaries();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredSalaries = salaries?.filter(
    (salary) =>
      salary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salary.notes || "").toLowerCase().includes(searchQuery.toLowerCase()),
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
              renderItem={(salary: Salary) => <SalaryCard key={salary.id} salary={salary} />}
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

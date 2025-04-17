import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import CompanyCard from "@/components/app/company/company.card";
import CompaniesTable from "@/components/app/company/company.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Company } from "@/types/company.type";

import { useCompanies } from "@/hooks/useCompanies";

export default function CompaniesPage() {
  const t = useTranslations("Companies");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: companies, isLoading, error } = useCompanies();

  const filteredCompanies = Array.isArray(companies)
    ? companies.filter(
        (company: Company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/companies/add"
        createLabel={t("create_company")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_companies")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        {viewMode === "table" ? (
          <CompaniesTable
            data={filteredCompanies}
            isLoading={isLoading}
            error={error as Error | null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredCompanies}
              isLoading={isLoading}
              error={error as Error | null}
              emptyMessage={t("no_companies_found")}
              renderItem={(company) => <CompanyCard key={company.id} company={company} />}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

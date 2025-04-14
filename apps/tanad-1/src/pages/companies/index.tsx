import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import CompaniesTable from "@/components/tables/companies-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company.type";

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

  const renderCompany = (company: Company) => (
    <Card key={company.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
          </div>
          <Badge variant={company.isActive ? "default" : "secondary"}>
            {company.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${company.email}`} className="hover:text-primary">
              {company.email}
            </a>
          </div>
          {company.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${company.phone}`} className="hover:text-primary">
                {company.phone}
              </a>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <a
                href={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {company.website}
              </a>
            </div>
          )}
          {(company.address || company.city || company.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {[company.address, company.city, company.state].filter(Boolean).join(", ")}
                {company.zipCode && ` ${company.zipCode}`}
              </span>
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{company.size} employees</span>
            </div>
          )}
          {company.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500">{company.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
              renderItem={renderCompany}
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

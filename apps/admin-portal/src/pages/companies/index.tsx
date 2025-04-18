import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import CompanyCard from "@/components/app/company/company.card";
import CompaniesTable from "@/components/app/company/company.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { Company } from "@/types/company.type";

import { useCompanies, useBulkDeleteCompanies } from "@/hooks/useCompanies";
import { useCompaniesStore } from "@/stores/companies.store";

export default function CompaniesPage() {
  const t = useTranslations("Companies");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: companies, isLoading, error } = useCompanies();
  const { selectedRows, clearSelection } = useCompaniesStore();
  const { mutate: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();

  const filteredCompanies = Array.isArray(companies)
    ? companies.filter(
        (company: Company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) return;
    await deleteCompanies(selectedRows);
    clearSelection();
    setIsDeleteDialogOpen(false);
  };

  return (
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <SelectionMode
          selectedRows={selectedRows}
          clearSelection={clearSelection}
          isDeleting={isDeleting}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        />
      ) : (
        <PageSearchAndFilter
          title={t("title")}
          createHref="/companies/add"
          createLabel={t("create_company")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("search_companies")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

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

      <ConfirmDelete
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        handleConfirmDelete={handleConfirmDelete}
        title={t("confirm_delete")}
        description={t("delete_description", { count: selectedRows.length })}
      />
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

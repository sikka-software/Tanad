import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CompanyCard from "@/components/app/company/company.card";
import CompaniesTable from "@/components/app/company/company.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { useCompanies, useBulkDeleteCompanies } from "@/hooks/models/useCompanies";
import useCompaniesStore from "@/stores/companies.store";

export default function CompaniesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: companies, isLoading, error } = useCompanies();

  const { selectedRows, clearSelection } = useCompaniesStore();
  const { mutate: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();

  const filteredCompanies = Array.isArray(companies)
    ? companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleConfirmDelete = async () => {
    try {
      await deleteCompanies(selectedRows);
      clearSelection();
    } catch (error) {
      console.error("Error deleting companies:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Companies.title")} description={t("Companies.description")} />
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
            title={t("Companies.title")}
            createHref="/companies/add"
            createLabel={t("Companies.create_company")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Companies.search_companies")}
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
                emptyMessage={t("Companies.no_companies_found")}
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
          title={t("Companies.confirm_delete")}
          description={t("Companies.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

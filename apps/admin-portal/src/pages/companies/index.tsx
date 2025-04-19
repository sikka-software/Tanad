import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CompanyCard from "@/modules/company/company.card";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/company/company.options";
import CompaniesTable from "@/modules/company/company.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { useCompanies, useBulkDeleteCompanies } from "@/hooks/models/useCompanies";
import useCompanyStore from "@/stores/company.store";

export default function CompaniesPage() {
  const t = useTranslations();

  const viewMode = useCompanyStore((state) => state.viewMode);
  const isDeleteDialogOpen = useCompanyStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useCompanyStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useCompanyStore((state) => state.selectedRows);
  const setSelectedRows = useCompanyStore((state) => state.setSelectedRows);
  const clearSelection = useCompanyStore((state) => state.clearSelection);
  const sortRules = useCompanyStore((state) => state.sortRules);
  const sortCaseSensitive = useCompanyStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useCompanyStore((state) => state.sortNullsFirst);
  const searchQuery = useCompanyStore((state) => state.searchQuery);
  const filterConditions = useCompanyStore((state) => state.filterConditions);
  const filterCaseSensitive = useCompanyStore((state) => state.filterCaseSensitive);
  const getFilteredCompanies = useCompanyStore((state) => state.getFilteredCompanies);
  const getSortedCompanies = useCompanyStore((state) => state.getSortedCompanies);

  const { data: companies, isLoading, error } = useCompanies();
  const { mutate: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();

  const filteredCompanies = useMemo(() => {
    return getFilteredCompanies(companies || []);
  }, [companies, getFilteredCompanies, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedCompanies = useMemo(() => {
    return getSortedCompanies(filteredCompanies);
  }, [filteredCompanies, sortRules, sortCaseSensitive, sortNullsFirst]);

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
            store={useCompanyStore}
            title={t("Companies.title")}
            createHref="/companies/add"
            createLabel={t("Companies.create_company")}
            searchPlaceholder={t("Companies.search_companies")}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <CompaniesTable
              data={sortedCompanies}
              isLoading={isLoading}
              error={error as Error | null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedCompanies}
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

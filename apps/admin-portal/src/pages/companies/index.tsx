import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import CompanyCard from "@/company/company.card";
import { CompanyForm } from "@/company/company.form";
import { useCompanies, useBulkDeleteCompanies, useDuplicateCompany } from "@/company/company.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/company/company.options";
import useCompanyStore from "@/company/company.store";
import CompaniesTable from "@/company/company.table";
import { Company, CompanyUpdateData } from "@/company/company.type";

import useUserStore from "@/stores/use-user-store";

export default function CompaniesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadCompanies = useUserStore((state) => state.hasPermission("companies.read"));
  const canCreateCompanies = useUserStore((state) => state.hasPermission("companies.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableCompany, setActionableCompany] = useState<Company | null>(null);

  const loadingSaveCompany = useCompanyStore((state) => state.isLoading);
  const setLoadingSaveCompany = useCompanyStore((state) => state.setIsLoading);
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
  const getFilteredCompanies = useCompanyStore((state) => state.getFilteredData);
  const getSortedCompanies = useCompanyStore((state) => state.getSortedData);

  const { data: companies, isLoading: loadingFetchCompanies, error } = useCompanies();
  const { mutate: duplicateCompany } = useDuplicateCompany();
  const { mutateAsync: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: companies,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableCompany,
    duplicateMutation: duplicateCompany,
    moduleName: "Companies",
  });

  const handleConfirmDelete = createDeleteHandler(deleteCompanies, {
    loading: "Companies.loading.delete",
    success: "Companies.success.delete",
    error: "Companies.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredCompanies = useMemo(() => {
    return getFilteredCompanies(companies || []);
  }, [companies, getFilteredCompanies, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedCompanies = useMemo(() => {
    return getSortedCompanies(filteredCompanies);
  }, [filteredCompanies, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadCompanies) {
    return <NoPermission />;
  }
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
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Companies.title")}
            onAddClick={
              canCreateCompanies ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Companies.create_company")}
            searchPlaceholder={t("Companies.search_companies")}
            count={companies?.length}
            hideOptions={companies?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <CompaniesTable
              data={sortedCompanies}
              isLoading={loadingFetchCompanies}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedCompanies}
                isLoading={loadingFetchCompanies}
                error={error as Error | null}
                emptyMessage={t("Companies.no_companies_found")}
                renderItem={(company) => <CompanyCard key={company.id} company={company} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Companies.add_new")}
          formId="company-form"
          loadingSave={loadingSaveCompany}
        >
          <CompanyForm
            formHtmlId={"company-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableCompany(null);
              setLoadingSaveCompany(false);
              toast.success(t("General.successful_operation"), {
                description: t("Companies.success.update"),
              });
            }}
            defaultValues={actionableCompany}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
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

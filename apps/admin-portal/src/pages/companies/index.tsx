import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import CompanyCard from "@/modules/company/company.card";
import { CompanyForm } from "@/modules/company/company.form";
import {
  useCompanies,
  useBulkDeleteCompanies,
  useDuplicateCompany,
} from "@/modules/company/company.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/company/company.options";
import useCompanyStore from "@/modules/company/company.store";
import CompaniesTable from "@/modules/company/company.table";
import { CompanyUpdateData } from "@/modules/company/company.type";

export default function CompaniesPage() {
  const t = useTranslations();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableCompany, setActionableCompany] = useState<CompanyUpdateData | null>(null);

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
  const getFilteredCompanies = useCompanyStore((state) => state.getFilteredCompanies);
  const getSortedCompanies = useCompanyStore((state) => state.getSortedCompanies);

  const { data: companies, isLoading: loadingFetchCompanies, error } = useCompanies();
  const { mutate: duplicateCompany } = useDuplicateCompany();
  const { mutate: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();

  const filteredCompanies = useMemo(() => {
    return getFilteredCompanies(companies || []);
  }, [companies, getFilteredCompanies, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedCompanies = useMemo(() => {
    return getSortedCompanies(filteredCompanies);
  }, [filteredCompanies, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    const toastId = toast.loading(t("General.loading_operation"), {
      description: t("Companies.loading.deleting"),
    });

    await deleteCompanies(selectedRows, {
      onSuccess: () => {
        clearSelection();
        toast.success(t("General.successful_operation"), {
          description: t("Companies.success.deleted"),
        });
        toast.dismiss(toastId);
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error(t("General.error_operation"), {
          description: t("Companies.error.deleting"),
        });
        toast.dismiss(toastId);
      },
    });
  };

  const onActionClicked = async (action: string, rowId: string) => {
    console.log(action, rowId);
    if (action === "edit") {
      setIsFormDialogOpen(true);
      setActionableCompany(companies?.find((company) => company.id === rowId) || null);
    }

    if (action === "delete") {
      setSelectedRows([rowId]);
      setIsDeleteDialogOpen(true);
    }

    if (action === "duplicate") {
      const toastId = toast.loading(t("General.loading_operation"), {
        description: t("Companies.loading.duplicating"),
      });
      await duplicateCompany(rowId, {
        onSuccess: () => {
          toast.success(t("General.successful_operation"), {
            description: t("Companies.success.duplicated"),
          });
          toast.dismiss(toastId);
        },
        onError: () => {
          toast.error(t("General.error_operation"), {
            description: t("Companies.error.duplicating"),
          });
          toast.dismiss(toastId);
        },
      });
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
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Companies.title")}
            createHref="/companies/add"
            createLabel={t("Companies.create_company")}
            searchPlaceholder={t("Companies.search_companies")}
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
            id={"company-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableCompany(null);
              setLoadingSaveCompany(false);
              toast.success(t("General.successful_operation"), {
                description: t("Companies.success.updated"),
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

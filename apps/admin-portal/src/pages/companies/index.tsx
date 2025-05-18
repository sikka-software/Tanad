import { pick } from "lodash";
import { Building, Car, Plus } from "lucide-react";
import { Truck } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import CompanyCard from "@/company/company.card";
import useCompanyColumns from "@/company/company.columns";
import { CompanyForm } from "@/company/company.form";
import { useCompanies, useBulkDeleteCompanies, useDuplicateCompany } from "@/company/company.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/company/company.options";
import useCompanyStore from "@/company/company.store";
import CompaniesTable from "@/company/company.table";
import { CompanyUpdateData } from "@/company/company.type";

export default function CompaniesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useCompanyColumns();

  const moduleHooks = createModuleStoreHooks(useCompanyStore, "companies");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<CompanyUpdateData | null>(null);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: companies, isLoading, error } = useCompanies();
  const { mutateAsync: deleteCompanies, isPending: isDeleting } = useBulkDeleteCompanies();
  const { mutate: duplicateCompany } = useDuplicateCompany();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: companies,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateCompany,
    moduleName: "Companies",
  });

  const handleConfirmDelete = createDeleteHandler(deleteCompanies, {
    loading: "Companies.loading.delete",
    success: "Companies.success.delete",
    error: "Companies.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useCompanyStore((state) => state.data) || [];
  const setData = useCompanyStore((state) => state.setData);

  useEffect(() => {
    if (companies && setData) {
      setData(companies);
    }
  }, [companies, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Companies.title")}
        description={t("Pages.Companies.description")}
      />
      <DataPageLayout count={companies?.length} itemsText={t("Pages.Companies.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useCompanyStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useCompanyStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Companies.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Companies.create")}
            searchPlaceholder={t("Pages.Companies.search")}
            hideOptions={companies?.length === 0}
            id="companies-table"
          />
        )}

        <div>
          {viewMode === "table" ? (
            <CompaniesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Companies.create_first.title"),
                  description: t("Companies.create_first.description"),
                  add: t("Pages.Companies.add"),
                  icons: [Building, Plus, Building],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(company) => (
                  <CompanyCard company={company} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Companies.edit") : t("Pages.Companies.add")}
          formId="company-form"
          loadingSave={loadingSave}
        >
          <CompanyForm
            formHtmlId={"company-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Companies.confirm_delete", { count: selectedRows.length })}
          description={t("Companies.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

CompaniesPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "General",
  "Companies",
  "Forms",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        CompaniesPage.messages,
      ),
    },
  };
};

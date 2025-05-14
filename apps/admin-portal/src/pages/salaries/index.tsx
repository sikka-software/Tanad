import { FormSheet } from "@/components/ui/form-sheet";
import { SalaryForm } from "@/modules/salary/salary.form";
import { createModuleStoreHooks } from "@/utils/module-hooks";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import SalaryCard from "@/salary/salary.card";
import { useSalaries, useBulkDeleteSalaries, useDuplicateSalary } from "@/salary/salary.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/salary/salary.options";
import useSalaryStore from "@/salary/salary.store";
import SalariesTable from "@/salary/salary.table";

import useSalaryColumns from "@/modules/salary/salary.columns";
import { Salary, SalaryUpdateData } from "@/modules/salary/salary.type";

export default function SalariesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useSalaryColumns();

  const moduleHooks = createModuleStoreHooks(useSalaryStore, "salaries");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<SalaryUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const clearSelection = moduleHooks.useClearSelection();
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: salaries, isLoading, error } = useSalaries();
  const { mutateAsync: deleteSalaries, isPending: isDeleting } = useBulkDeleteSalaries();
  const { mutate: duplicateSalary } = useDuplicateSalary();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: salaries,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateSalary,
    moduleName: "Salaries",
  });

  const handleConfirmDelete = createDeleteHandler(deleteSalaries, {
    loading: "Salaries.loading.delete",
    success: "Salaries.success.delete",
    error: "Salaries.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useSalaryStore((state) => state.data) || [];
  const setData = useSalaryStore((state) => state.setData);

  useEffect(() => {
    if (salaries && setData) {
      setData(salaries);
    }
  }, [salaries, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Salaries.title")}
        description={t("Pages.Salaries.description")}
      />
      <DataPageLayout count={salaries?.length} itemsText={t("Pages.Salaries.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={(open) => {
              if (open) setPendingDeleteIds(selectedRows);
              setIsDeleteDialogOpen(open);
            }}
          />
        ) : (
          <PageSearchAndFilter
            store={useSalaryStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Salaries.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Salaries.create")}
            searchPlaceholder={t("Pages.Salaries.search")}
            hideOptions={salaries?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <SalariesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                emptyMessage={t("Salaries.no_salaries_found")}
                renderItem={(salary) => <SalaryCard key={salary.id} salary={salary} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormSheet
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Pages.Salaries.edit")}
          formId="salary-form"
          loadingSave={loadingSave}
        >
          <SalaryForm
            formHtmlId={"salary-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem as Salary}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Salaries.confirm_delete", { count: selectedRows.length })}
          description={t("Salaries.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

SalariesPage.messages = ["Notes", "Pages", "Salaries", "General"];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        SalariesPage.messages,
      ),
    },
  };
};

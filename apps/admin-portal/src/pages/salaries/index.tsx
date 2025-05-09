import { FormSheet } from "@root/src/components/ui/form-sheet";
import { BranchForm } from "@root/src/modules/branch/branch.form";
import { Branch } from "@root/src/modules/branch/branch.type";
import { SalaryForm } from "@root/src/modules/salary/salary.form";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

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

import { Salary } from "@/modules/salary/salary.type";
import useUserStore from "@/stores/use-user-store";

export default function SalariesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadSalaries = useUserStore((state) => state.hasPermission("salaries.read"));
  const canCreateSalaries = useUserStore((state) => state.hasPermission("salaries.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableSalary, setActionableSalary] = useState<Salary | null>(null);

  const loadingSaveSalary = useSalaryStore((state) => state.isLoading);
  const setLoadingSaveSalary = useSalaryStore((state) => state.setIsLoading);
  const viewMode = useSalaryStore((state) => state.viewMode);
  const isDeleteDialogOpen = useSalaryStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useSalaryStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useSalaryStore((state) => state.selectedRows);
  const setSelectedRows = useSalaryStore((state) => state.setSelectedRows);
  const clearSelection = useSalaryStore((state) => state.clearSelection);
  const sortRules = useSalaryStore((state) => state.sortRules);
  const sortCaseSensitive = useSalaryStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useSalaryStore((state) => state.sortNullsFirst);
  const searchQuery = useSalaryStore((state) => state.searchQuery);
  const filterConditions = useSalaryStore((state) => state.filterConditions);
  const filterCaseSensitive = useSalaryStore((state) => state.filterCaseSensitive);
  const getFilteredSalaries = useSalaryStore((state) => state.getFilteredData);
  const getSortedSalaries = useSalaryStore((state) => state.getSortedData);

  const { data: salaries, isLoading, error } = useSalaries();
  const { mutate: duplicateSalary } = useDuplicateSalary();
  const { mutateAsync: deleteSalaries, isPending: isDeleting } = useBulkDeleteSalaries();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: salaries,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableSalary,
    duplicateMutation: duplicateSalary,
    moduleName: "Salaries",
  });

  const handleConfirmDelete = createDeleteHandler(deleteSalaries, {
    loading: "Salaries.loading.delete",
    success: "Salaries.success.delete",
    error: "Salaries.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredSalaries = useMemo(() => {
    return getFilteredSalaries(salaries || []);
  }, [salaries, getFilteredSalaries, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedSalaries = useMemo(() => {
    return getSortedSalaries(filteredSalaries);
  }, [filteredSalaries, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadSalaries) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Salaries.title")} description={t("Salaries.description")} />
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
            store={useSalaryStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Salaries.title")}
            onAddClick={canCreateSalaries ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Salaries.create_salary")}
            searchPlaceholder={t("Salaries.search_salaries")}
            count={salaries?.length}
            hideOptions={salaries?.length === 0}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <SalariesTable
              data={sortedSalaries}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedSalaries}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
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
          loadingSave={loadingSaveSalary}
        >
          <SalaryForm
            formHtmlId={"salary-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableSalary(null);
              setLoadingSaveSalary(false);
            }}
            defaultValues={actionableSalary as Salary}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Salaries.delete_salary")}
          description={t("Salaries.confirm_delete")}
        />
      </DataPageLayout>
    </div>
  );
}

SalariesPage.messages = ["Notes", "Pages", "Salaries", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        SalariesPage.messages,
      ),
    },
  };
};

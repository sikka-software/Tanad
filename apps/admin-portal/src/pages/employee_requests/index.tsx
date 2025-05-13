import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormSheet } from "@/ui/form-sheet";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import EmployeeRequestCard from "@/employee-request/employee-request.card";
import useEmployeeRequestColumns from "@/employee-request/employee-request.columns";
import { EmployeeRequestForm } from "@/employee-request/employee-request.form";
import {
  useEmployeeRequests,
  useBulkDeleteEmployeeRequests,
  useDuplicateEmployeeRequest,
} from "@/employee-request/employee-request.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/employee-request/employee-request.options";
import useEmployeeRequestsStore from "@/employee-request/employee-request.store";
import useEmployeeRequestStore from "@/employee-request/employee-request.store";
import EmployeeRequestsTable from "@/employee-request/employee-request.table";
import { EmployeeRequestUpdateData } from "@/employee-request/employee-request.type";

export default function EmployeeRequestsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useEmployeeRequestColumns();

  const moduleHooks = createModuleStoreHooks(useEmployeeRequestStore, "employee_requests");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<EmployeeRequestUpdateData | null>(null);

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

  const { data: employeeRequests, isLoading, error } = useEmployeeRequests();
  const { mutateAsync: deleteEmployeeRequests, isPending: isDeleting } =
    useBulkDeleteEmployeeRequests();
  const { mutate: duplicateEmployeeRequest } = useDuplicateEmployeeRequest();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: employeeRequests,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateEmployeeRequest,
    moduleName: "EmployeeRequests",
  });

  const handleConfirmDelete = createDeleteHandler(deleteEmployeeRequests, {
    loading: "EmployeeRequests.loading.delete",
    success: "EmployeeRequests.success.delete",
    error: "EmployeeRequests.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useEmployeeRequestStore((state) => state.data) || [];
  const setData = useEmployeeRequestStore((state) => state.setData);

  useEffect(() => {
    if (employeeRequests && setData) {
      setData(employeeRequests);
    }
  }, [employeeRequests, setData]);

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
        title={t("Pages.EmployeeRequests.title")}
        description={t("Pages.EmployeeRequests.description")}
      />
      <DataPageLayout
        count={employeeRequests?.length}
        itemsText={t("Pages.EmployeeRequests.title")}
      >
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useEmployeeRequestsStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.EmployeeRequests.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.EmployeeRequests.add")}
            searchPlaceholder={t("Pages.EmployeeRequests.search")}
            hideOptions={employeeRequests?.length === 0}
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
            <EmployeeRequestsTable
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
                emptyMessage={t("EmployeeRequests.no_requests")}
                addFirstItemMessage={t("EmployeeRequests.add_first_request")}
                renderItem={(request) => <EmployeeRequestCard employeeRequest={request} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormSheet
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Pages.EmployeeRequests.edit")}
          formId="employee-request-form"
          loadingSave={loadingSave}
        >
          <EmployeeRequestForm
            formHtmlId={"employee-request-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("EmployeeRequests.confirm_delete", { count: selectedRows.length })}
          description={t("EmployeeRequests.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

EmployeeRequestsPage.messages = ["Notes", "Pages", "EmployeeRequests", "General"];
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        EmployeeRequestsPage.messages,
      ),
    },
  };
};

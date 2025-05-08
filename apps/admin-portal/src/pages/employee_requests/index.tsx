import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormSheet } from "@/ui/form-sheet";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import EmployeeRequestCard from "@/employee-request/employee-request.card";
import { EmployeeRequestForm } from "@/employee-request/employee-request.form";
import {
  useEmployeeRequests,
  useBulkDeleteEmployeeRequests,
  useDuplicateEmployeeRequest,
} from "@/employee-request/employee-request.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/employee-request/employee-request.options";
import useEmployeeRequestsStore from "@/employee-request/employee-request.store";
import EmployeeRequestsTable from "@/employee-request/employee-request.table";
import { EmployeeRequestUpdateData } from "@/employee-request/employee-request.type";

import useUserStore from "@/stores/use-user-store";

export default function EmployeeRequestsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadEmployeeRequests = useUserStore((state) =>
    state.hasPermission("employee_requests.read"),
  );
  const canCreateEmployeeRequests = useUserStore((state) =>
    state.hasPermission("employee_requests.create"),
  );

  const [actionableEmployeeRequest, setActionableEmployeeRequest] =
    useState<EmployeeRequestUpdateData | null>(null);

  const isFormDialogOpen = useEmployeeRequestsStore((state) => state.isFormDialogOpen);
  const setIsFormDialogOpen = useEmployeeRequestsStore((state) => state.setIsFormDialogOpen);

  const loadingSaveEmployeeRequest = useEmployeeRequestsStore((state) => state.isLoading);
  const setLoadingSaveEmployeeRequest = useEmployeeRequestsStore((state) => state.setIsLoading);

  const viewMode = useEmployeeRequestsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useEmployeeRequestsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useEmployeeRequestsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useEmployeeRequestsStore((state) => state.selectedRows);
  const setSelectedRows = useEmployeeRequestsStore((state) => state.setSelectedRows);
  const clearSelection = useEmployeeRequestsStore((state) => state.clearSelection);
  const sortRules = useEmployeeRequestsStore((state) => state.sortRules);
  const sortCaseSensitive = useEmployeeRequestsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useEmployeeRequestsStore((state) => state.sortNullsFirst);
  const searchQuery = useEmployeeRequestsStore((state) => state.searchQuery);
  const filterConditions = useEmployeeRequestsStore((state) => state.filterConditions);
  const filterCaseSensitive = useEmployeeRequestsStore((state) => state.filterCaseSensitive);
  const getFilteredEmployeeRequests = useEmployeeRequestsStore((state) => state.getFilteredData);
  const getSortedEmployeeRequests = useEmployeeRequestsStore((state) => state.getSortedData);

  const { data: requests, isLoading, error } = useEmployeeRequests();
  const { mutateAsync: deleteEmployeeRequests, isPending: isDeleting } =
    useBulkDeleteEmployeeRequests();
  const { mutate: duplicateEmployeeRequest } = useDuplicateEmployeeRequest();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: requests,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableEmployeeRequest,
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

  const filteredEmployeeRequests = useMemo(() => {
    return getFilteredEmployeeRequests(requests || []);
  }, [requests, getFilteredEmployeeRequests, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedEmployeeRequests = useMemo(() => {
    return getSortedEmployeeRequests(filteredEmployeeRequests);
  }, [filteredEmployeeRequests, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadEmployeeRequests) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.EmployeeRequests.title")}
        description={t("Pages.EmployeeRequests.description")}
      />
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
            store={useEmployeeRequestsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.EmployeeRequests.title")}
            onAddClick={
              canCreateEmployeeRequests ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Pages.EmployeeRequests.add")}
            searchPlaceholder={t("Pages.EmployeeRequests.search")}
            count={requests?.length}
            hideOptions={requests?.length === 0}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <EmployeeRequestsTable
              data={sortedEmployeeRequests}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedEmployeeRequests}
                isLoading={isLoading}
                error={error as Error | null}
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
          title={t("EmployeeRequests.edit_employee_request")}
          formId="employee-request-form"
          loadingSave={loadingSaveEmployeeRequest}
        >
          <EmployeeRequestForm
            formHtmlId={"employee-request-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableEmployeeRequest(null);
            }}
            defaultValues={actionableEmployeeRequest}
            editMode={true}
          />
        </FormSheet>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("EmployeeRequests.delete.title")}
          description={t("EmployeeRequests.delete.description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

EmployeeRequestsPage.messages = ["Notes", "Pages", "EmployeeRequests", "General"];
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        EmployeeRequestsPage.messages,
      ),
    },
  };
};

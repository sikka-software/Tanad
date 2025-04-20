import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import EmployeeRequestCard from "@/modules/employee-request/employee-request.card";
import {
  useEmployeeRequests,
  useBulkDeleteEmployeeRequests,
} from "@/modules/employee-request/employee-request.hooks";
import {
  FILTERABLE_FIELDS,
  SORTABLE_COLUMNS,
} from "@/modules/employee-request/employee-request.options";
import useEmployeeRequestsStore from "@/modules/employee-request/employee-request.store";
import EmployeeRequestsTable from "@/modules/employee-request/employee-request.table";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

export default function EmployeeRequestsPage() {
  const t = useTranslations();

  const viewMode = useEmployeeRequestsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useEmployeeRequestsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useEmployeeRequestsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useEmployeeRequestsStore((state) => state.selectedRows);
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
  const { mutateAsync: deleteEmployeeRequests, isPending: isDeleting } = useBulkDeleteEmployeeRequests();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteEmployeeRequests, {
    loading: "EmployeeRequests.loading.deleting",
    success: "EmployeeRequests.success.deleted",
    error: "EmployeeRequests.error.deleting",
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
  

  return (
    <div>
      <CustomPageMeta
        title={t("EmployeeRequests.title")}
        description={t("EmployeeRequests.description")}
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
            title={t("EmployeeRequests.title")}
            createHref="/employee-requests/add"
            createLabel={t("EmployeeRequests.add_new")}
            searchPlaceholder={t("EmployeeRequests.search_requests")}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <EmployeeRequestsTable
              data={sortedEmployeeRequests}
              isLoading={isLoading}
              error={error as Error | null}
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

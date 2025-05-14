import { createModuleStoreHooks } from "@root/src/utils/module-hooks";
import { pick } from "lodash";
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

import JobCard from "@/job/job.card";
import { JobForm } from "@/job/job.form";
import { useJobs, useBulkDeleteJobs, useDuplicateJob } from "@/job/job.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/job/job.options";
import useJobsStore from "@/job/job.store";
import JobTable from "@/job/job.table";
import { JobUpdateData } from "@/job/job.type";

import useJobColumns from "@/modules/job/job.columns";

export default function JobsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useJobColumns();

  const moduleHooks = createModuleStoreHooks(useJobsStore, "jobs");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<JobUpdateData | null>(null);
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

  const { data: jobs, isLoading: loadingFetchJobs, error } = useJobs();
  const { mutateAsync: duplicateJob } = useDuplicateJob();
  const { mutateAsync: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: jobs,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateJob,
    moduleName: "Jobs",
  });

  const handleConfirmDelete = createDeleteHandler(deleteJobs, {
    loading: "Jobs.loading.delete",
    success: "Jobs.success.delete",
    error: "Jobs.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredData = useMemo(() => {
    return getFilteredData(jobs || []);
  }, [jobs, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Pages.Jobs.title")} description={t("Pages.Jobs.description")} />
      <DataPageLayout count={jobs?.length} itemsText={t("Pages.Jobs.title")}>
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
            store={useJobsStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Jobs.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Jobs.add")}
            searchPlaceholder={t("Pages.Jobs.search")}
            hideOptions={jobs?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <JobTable
              data={sortedData}
              isLoading={loadingFetchJobs}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={loadingFetchJobs}
                error={error}
                emptyMessage={t("Pages.Jobs.no_jobs_found")}
                renderItem={(job) => <JobCard job={job} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Jobs.edit") : t("Pages.Jobs.add")}
          formId="job-form"
          loadingSave={loadingSave}
        >
          <JobForm
            formHtmlId="job-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
              toast.success(t("General.successful_operation"), {
                description: t("Jobs.success.update"),
              });
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
          title={t("Jobs.confirm_delete", { count: selectedRows.length })}
          description={t("Jobs.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

JobsPage.messages = [
  "Notes",
  "Pages",
  "Jobs",
  "Branches",
  "Warehouses",
  "OnlineStores",
  "Offices",
  "Departments",
  "Forms",
  "General",
];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, JobsPage.messages),
    },
  };
};

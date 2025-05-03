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

import useUserStore from "@/stores/use-user-store";

export default function JobsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadJobs = useUserStore((state) => state.hasPermission("jobs.read"));
  const canCreateJobs = useUserStore((state) => state.hasPermission("jobs.create"));

  const [actionableJob, setActionableJob] = useState<JobUpdateData | null>(null);

  const isLoading = useJobsStore((state) => state.isLoading);
  const setIsLoading = useJobsStore((state) => state.setIsLoading);

  const isFormDialogOpen = useJobsStore((state) => state.isFormDialogOpen);
  const setIsFormDialogOpen = useJobsStore((state) => state.setIsFormDialogOpen);
  const actionableItem = useJobsStore((state) => state.actionableItem);
  const setActionableItem = useJobsStore((state) => state.setActionableItem);
  const viewMode = useJobsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useJobsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useJobsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useJobsStore((state) => state.selectedRows);
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const clearSelection = useJobsStore((state) => state.clearSelection);
  const sortRules = useJobsStore((state) => state.sortRules);
  const sortCaseSensitive = useJobsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useJobsStore((state) => state.sortNullsFirst);
  const searchQuery = useJobsStore((state) => state.searchQuery);
  const filterConditions = useJobsStore((state) => state.filterConditions);
  const filterCaseSensitive = useJobsStore((state) => state.filterCaseSensitive);
  const getFilteredJobs = useJobsStore((state) => state.getFilteredData);
  const getSortedJobs = useJobsStore((state) => state.getSortedData);

  const { data: jobs, isLoading: loadingFetchJobs, error } = useJobs();
  const { mutateAsync: duplicateJob } = useDuplicateJob();
  const { mutateAsync: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: jobs,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableJob,
    duplicateMutation: duplicateJob,
    moduleName: "Jobs",
  });

  const handleConfirmDelete = createDeleteHandler(deleteJobs, {
    loading: "Jobs.loading.delete",
    success: "Jobs.success.deleted",
    error: "Jobs.error.deleting",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredJobs = useMemo(() => {
    return getFilteredJobs(jobs || []);
  }, [jobs, getFilteredJobs, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedJobs = useMemo(() => {
    return getSortedJobs(filteredJobs);
  }, [filteredJobs, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadJobs) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Jobs.title")} description={t("Jobs.description")} />
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
            store={useJobsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Jobs.title")}
            onAddClick={canCreateJobs ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Jobs.create_job")}
            searchPlaceholder={t("Jobs.search_jobs")}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <JobTable
              data={sortedJobs}
              isLoading={loadingFetchJobs}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedJobs}
                isLoading={loadingFetchJobs}
                error={error}
                emptyMessage={t("Jobs.no_jobs_found")}
                renderItem={(job) => <JobCard job={job} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Jobs.add_new")}
          formId="job-form"
          loadingSave={isLoading}
        >
          <JobForm
            id={"job-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setIsLoading(false);
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
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Jobs.delete.title")}
          description={t("Jobs.delete.description", { count: selectedRows.length })}
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

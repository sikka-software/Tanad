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

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import JobCard from "@/modules/job/job.card";
import { useJobs, useBulkDeleteJobs } from "@/modules/job/job.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/job/job.options";
import useJobsStore from "@/modules/job/job.store";
import JobTable from "@/modules/job/job.table";

export default function JobsPage() {
  const t = useTranslations();

  const viewMode = useJobsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useJobsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useJobsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useJobsStore((state) => state.selectedRows);
  const clearSelection = useJobsStore((state) => state.clearSelection);
  const sortRules = useJobsStore((state) => state.sortRules);
  const sortCaseSensitive = useJobsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useJobsStore((state) => state.sortNullsFirst);
  const searchQuery = useJobsStore((state) => state.searchQuery);
  const filterConditions = useJobsStore((state) => state.filterConditions);
  const filterCaseSensitive = useJobsStore((state) => state.filterCaseSensitive);
  const getFilteredJobs = useJobsStore((state) => state.getFilteredData);
  const getSortedJobs = useJobsStore((state) => state.getSortedData);

  const { data: jobs, isLoading, error } = useJobs();
  const { mutateAsync: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteJobs, {
    loading: "Jobs.loading.deleting",
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
            createHref="/jobs/add"
            createLabel={t("Jobs.create_job")}
            searchPlaceholder={t("Jobs.search_jobs")}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <JobTable data={sortedJobs} isLoading={isLoading} error={error} />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedJobs}
                isLoading={isLoading}
                error={error}
                emptyMessage={t("Jobs.no_jobs_found")}
                renderItem={(job) => <JobCard job={job} />}
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

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import JobCard from "@/modules/job/job.card";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/job/job.options";
import JobTable from "@/modules/job/job.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Job } from "@/types/job.type";

import { useJobs, useBulkDeleteJobs } from "@/hooks/models/useJobs";
import { useJobsStore } from "@/stores/job.store";

export default function JobsPage() {
  const t = useTranslations();

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
  const getFilteredJobs = useJobsStore((state) => state.getFilteredJobs);
  const getSortedJobs = useJobsStore((state) => state.getSortedJobs);

  const { data: jobs, isLoading, error } = useJobs();
  const { mutate: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();

  const filteredJobs = useMemo(() => {
    return getFilteredJobs(jobs || []);
  }, [jobs, getFilteredJobs, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedJobs = useMemo(() => {
    return getSortedJobs(filteredJobs);
  }, [filteredJobs, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleRowSelectionChange = (rows: Job[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteJobs(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete jobs:", error);
          toast.error(t("Jobs.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete jobs:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
            <JobTable
              data={sortedJobs}
              isLoading={isLoading}
              error={error}
              onSelectedRowsChange={handleRowSelectionChange}
            />
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
          handleConfirmDelete={handleConfirmDelete}
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

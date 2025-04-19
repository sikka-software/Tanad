import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import JobCard from "@/components/app/job/job.card";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/components/app/job/job.options";
import JobTable from "@/components/app/job/job.table";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { applyFilters } from "@/lib/filter-utils";
import { sortFactory } from "@/lib/sort-utils";

import { Job } from "@/types/job.type";

import { useJobs, useBulkDeleteJobs } from "@/hooks/models/useJobs";
import { useJobsStore } from "@/stores/jobs.store";

export default function JobsPage() {
  const t = useTranslations();

  const isDeleteDialogOpen = useJobsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useJobsStore((state) => state.setIsDeleteDialogOpen);
  const searchQuery = useJobsStore((state) => state.searchQuery);
  const setSearchQuery = useJobsStore((state) => state.setSearchQuery);
  const viewMode = useJobsStore((state) => state.viewMode);
  const setViewMode = useJobsStore((state) => state.setViewMode);
  const selectedRows = useJobsStore((state) => state.selectedRows);
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const clearSelection = useJobsStore((state) => state.clearSelection);
  const sortRules = useJobsStore((state) => state.sortRules);
  const setSortRules = useJobsStore((state) => state.setSortRules);
  const sortCaseSensitive = useJobsStore((state) => state.sortCaseSensitive);
  const setSortCaseSensitive = useJobsStore((state) => state.setSortCaseSensitive);
  const sortNullsFirst = useJobsStore((state) => state.sortNullsFirst);
  const setSortNullsFirst = useJobsStore((state) => state.setSortNullsFirst);
  const filterConditions = useJobsStore((state) => state.filterConditions);
  const setFilterConditions = useJobsStore((state) => state.setFilterConditions);
  const filterCaseSensitive = useJobsStore((state) => state.filterCaseSensitive);
  const setFilterCaseSensitive = useJobsStore((state) => state.setFilterCaseSensitive);

  const { data: jobs, isLoading, error } = useJobs();
  const { mutate: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();

  // Apply search and filters
  const filteredData = jobs
    ? applyFilters(
        jobs.filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase())),
        filterConditions,
        filterCaseSensitive,
      )
    : [];

  const sortedJobs = sortFactory("jobs", filteredData || [], sortRules, {
    caseSensitive: sortCaseSensitive,
    nullsFirst: sortNullsFirst,
  });

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
          title={t("Jobs.title")}
          createHref="/jobs/add"
          createLabel={t("Jobs.create_job")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Jobs.search_jobs")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortRules={sortRules}
          onSortRulesChange={setSortRules}
          sortableColumns={SORTABLE_COLUMNS}
          caseSensitive={sortCaseSensitive}
          onCaseSensitiveChange={setSortCaseSensitive}
          nullsFirst={sortNullsFirst}
          onNullsFirstChange={setSortNullsFirst}
          filterableFields={FILTERABLE_FIELDS}
          filterConditions={filterConditions}
          onFilterConditionsChange={setFilterConditions}
          filterCaseSensitive={filterCaseSensitive}
          onFilterCaseSensitiveChange={setFilterCaseSensitive}
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
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

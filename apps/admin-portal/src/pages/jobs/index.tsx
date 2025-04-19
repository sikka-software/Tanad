import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import JobCard from "@/components/app/job/job.card";
import JobTable from "@/components/app/job/job.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { sortFactory } from "@/lib/sort-utils";

import { Job } from "@/types/job.type";

import { useJobs, useBulkDeleteJobs } from "@/hooks/models/useJobs";
import { useJobsStore } from "@/stores/jobs.store";

export default function JobsPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortRules, setSortRules] = useState<{ field: string; direction: string }[]>([
    { field: "created_at", direction: "desc" },
  ]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [nullsFirst, setNullsFirst] = useState(false);

  const { data: jobs, isLoading, error } = useJobs();
  const selectedRows = useJobsStore((state) => state.selectedRows);
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const clearSelection = useJobsStore((state) => state.clearSelection);
  const { mutate: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();

  const filteredData =
    jobs?.filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];

  console.log("Data being sorted:", filteredData);

  const sortedJobs = sortFactory("jobs", filteredData || [], sortRules, {
    caseSensitive,
    nullsFirst,
  });

  const sortableColumns = [
    { value: "created_at", label: t("Jobs.form.created_at.label") },
    { value: "title", label: t("Jobs.form.title.label") },
    { value: "description", label: t("Jobs.form.description.label") },
    { value: "requirements", label: t("Jobs.form.requirements.label") },
    { value: "location", label: t("Jobs.form.location.label") },
    { value: "department", label: t("Jobs.form.department.label") },
    { value: "type", label: t("Jobs.form.type.label") },
    { value: "salary", label: t("Jobs.form.salary.label") },
    { value: "is_active", label: t("Jobs.form.is_active.label") },
    { value: "start_date", label: t("Jobs.form.start_date.label") },
    { value: "end_date", label: t("Jobs.form.end_date.label") },
  ];

  const handleRowSelectionChange = (selectedJobs: Job[]) => {
    setSelectedRows(selectedJobs.map((job) => job.id));
  };

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) return;
    await deleteJobs(selectedRows);
    clearSelection();
    setIsDeleteDialogOpen(false);
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
          onSortRulesChange={(value) => setSortRules(value)}
          sortableColumns={sortableColumns}
          caseSensitive={caseSensitive}
          onCaseSensitiveChange={(value) => setCaseSensitive(value)}
          nullsFirst={nullsFirst}
          onNullsFirstChange={(value) => setNullsFirst(value)}
        />
      )}

      <div>
        {viewMode === "table" ? (
          <JobTable
            key={`sorted-${sortedJobs?.length}-${JSON.stringify(sortRules)}`}
            data={sortedJobs || []}
            isLoading={isLoading}
            error={error}
            onSelectedRowsChange={handleRowSelectionChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={sortedJobs || []}
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

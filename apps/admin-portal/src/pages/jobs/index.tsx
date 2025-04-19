import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import JobCard from "@/components/app/job/job.card";
import JobTable from "@/components/app/job/job.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter, { FilterCondition } from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { sortFactory } from "@/lib/sort-utils";

import { Job } from "@/types/job.type";

import { useJobs, useBulkDeleteJobs } from "@/hooks/models/useJobs";
import { useJobsStore } from "@/stores/jobs.store";

// Define the filterable fields for jobs
const FILTERABLE_FIELDS = [
  { id: "title", translationKey: "Jobs.form.title.label", type: "text" as const },
  { id: "description", translationKey: "Jobs.form.description.label", type: "text" as const },
  { id: "salary", translationKey: "Jobs.form.salary.label", type: "text" as const },
  { id: "created_at", translationKey: "Jobs.form.created_at.label", type: "date" as const },
  { id: "updated_at", translationKey: "Jobs.form.updated_at.label", type: "date" as const },
];

// Define the sortable columns
const SORTABLE_COLUMNS = [
  { value: "created_at", translationKey: "Jobs.form.created_at.label" },
  { value: "title", translationKey: "Jobs.form.title.label" },
  { value: "description", translationKey: "Jobs.form.description.label" },
  { value: "requirements", translationKey: "Jobs.form.requirements.label" },
  { value: "location", translationKey: "Jobs.form.location.label" },
  { value: "department", translationKey: "Jobs.form.department.label" },
  { value: "type", translationKey: "Jobs.form.type.label" },
  { value: "salary", translationKey: "Jobs.form.salary.label" },
  { value: "is_active", translationKey: "Jobs.form.is_active.label" },
  { value: "start_date", translationKey: "Jobs.form.start_date.label" },
  { value: "end_date", translationKey: "Jobs.form.end_date.label" },
];

// const sortableColumns = [
// ];

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

  // Filter state
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterCaseSensitive, setFilterCaseSensitive] = useState(false);

  const { data: jobs, isLoading, error } = useJobs();
  const selectedRows = useJobsStore((state) => state.selectedRows);
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const clearSelection = useJobsStore((state) => state.clearSelection);
  const { mutate: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();

  // Apply filters to the data
  const applyFilters = (data: Job[]) => {
    if (!filterConditions.length) return data;

    return data.filter((job) => {
      return filterConditions.reduce((pass, condition, index) => {
        let matches = false;
        const value = job[condition.field as keyof Job];
        const filterValue = condition.value;

        if (condition.operator === "isEmpty") {
          matches = !value;
        } else if (condition.operator === "isNotEmpty") {
          matches = Boolean(value);
        } else if (typeof value === "string") {
          const stringValue = String(value);
          const compareValue = filterCaseSensitive ? stringValue : stringValue.toLowerCase();
          const compareFilter = filterCaseSensitive ? filterValue : filterValue.toLowerCase();

          switch (condition.operator) {
            case "equals":
              matches = compareValue === compareFilter;
              break;
            case "contains":
              matches = compareValue.includes(compareFilter);
              break;
            case "startsWith":
              matches = compareValue.startsWith(compareFilter);
              break;
            case "endsWith":
              matches = compareValue.endsWith(compareFilter);
              break;
          }
        } else if (typeof value === "number") {
          const numValue = Number(filterValue);
          switch (condition.operator) {
            case "equals":
              matches = value === numValue;
              break;
            case "greaterThan":
              matches = value > numValue;
              break;
            case "lessThan":
              matches = value < numValue;
              break;
            case "between":
              const [min, max] = filterValue.split(",").map(Number);
              matches = value >= min && value <= max;
              break;
          }
        } else if (value && typeof value === "object" && "getTime" in value) {
          const dateValue = new Date(value);
          const filterDate = new Date(filterValue);
          switch (condition.operator) {
            case "equals":
              matches = dateValue.getTime() === filterDate.getTime();
              break;
            case "before":
              matches = dateValue < filterDate;
              break;
            case "after":
              matches = dateValue > filterDate;
              break;
            case "between":
              const [start, end] = filterValue.split(",").map((d) => new Date(d.trim()));
              matches = dateValue >= start && dateValue <= end;
              break;
          }
        }

        return index === 0
          ? matches
          : condition.conjunction === "and"
            ? pass && matches
            : pass || matches;
      }, true);
    });
  };

  // Apply search and filters
  const filteredData = jobs
    ? applyFilters(
        jobs.filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : [];

  const sortedJobs = sortFactory("jobs", filteredData || [], sortRules, {
    caseSensitive,
    nullsFirst,
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
          caseSensitive={caseSensitive}
          onCaseSensitiveChange={setCaseSensitive}
          nullsFirst={nullsFirst}
          onNullsFirstChange={setNullsFirst}
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

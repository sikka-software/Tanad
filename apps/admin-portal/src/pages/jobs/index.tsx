import { useTranslations } from "next-intl";
import { useState } from "react";

import JobCard from "@/components/app/job/job.card";
import { JobTable } from "@/components/app/job/job.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { Job } from "@/types/job.type";

import { useJobs, useBulkDeleteJobs } from "@/hooks/useJobs";
import { useJobsStore } from "@/stores/jobs.store";

export default function JobsPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: jobs, isLoading, error } = useJobs();
  const { selectedRows, setSelectedRows, clearSelection } = useJobsStore();
  const { mutate: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();

  const handleRowSelectionChange = (selectedJobs: Job[]) => {
    setSelectedRows(selectedJobs.map((job) => job.id));
  };

  const handleConfirmDelete = async () => {
    if (selectedRows.length === 0) return;
    await deleteJobs(selectedRows);
    clearSelection();
    setIsDeleteDialogOpen(false);
  };

  const filteredData =
    jobs?.filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];

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
          createLabel={t("Jobs.create")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Jobs.search")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      <div>
        {viewMode === "table" ? (
          <JobTable
            data={filteredData}
            isLoading={isLoading}
            error={error}
            onSelectedRowsChange={handleRowSelectionChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredData}
              isLoading={isLoading}
              error={error}
              emptyMessage={t("Jobs.empty")}
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

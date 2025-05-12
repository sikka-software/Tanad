import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";
import NoPermission from "@/components/ui/no-permission";

import JobListingCard from "@/job-listing/job-listing.card";
import {
  useJobListings,
  useBulkDeleteJobListings,
  useDuplicateJobListing,
} from "@/job-listing/job-listing.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/job-listing/job-listing.options";
import useJobListingsStore from "@/job-listing/job-listing.store";
import JobListingsTable from "@/job-listing/job-listing.table";
import { JobListingWithJobs } from "@/job-listing/job-listing.type";

import useJobListingColumns from "@/modules/job-listing/job-listing.columns";
import { JobListingForm } from "@/modules/job-listing/job-listing.form";
import useUserStore from "@/stores/use-user-store";

export default function JobListingsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useJobListingColumns();

  const canReadJobListings = useUserStore((state) => state.hasPermission("job_listings.read"));
  const canCreateJobListings = useUserStore((state) => state.hasPermission("job_listings.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableJobListing, setActionableJobListing] = useState<JobListingWithJobs | null>(null);

  const loadingSaveJobListing = useJobListingsStore((state) => state.isLoading);
  const setLoadingSaveJobListing = useJobListingsStore((state) => state.setIsLoading);

  const viewMode = useJobListingsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useJobListingsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useJobListingsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useJobListingsStore((state) => state.selectedRows);
  const setSelectedRows = useJobListingsStore((state) => state.setSelectedRows);
  const clearSelection = useJobListingsStore((state) => state.clearSelection);
  const sortRules = useJobListingsStore((state) => state.sortRules);
  const sortCaseSensitive = useJobListingsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useJobListingsStore((state) => state.sortNullsFirst);
  const searchQuery = useJobListingsStore((state) => state.searchQuery);
  const filterConditions = useJobListingsStore((state) => state.filterConditions);
  const filterCaseSensitive = useJobListingsStore((state) => state.filterCaseSensitive);
  const getFilteredJobListings = useJobListingsStore((state) => state.getFilteredData);
  const getSortedJobListings = useJobListingsStore((state) => state.getSortedData);
  const columnVisibility = useJobListingsStore((state) => state.columnVisibility);
  const setColumnVisibility = useJobListingsStore((state) => state.setColumnVisibility);

  const { data: jobListings = [], isLoading, error } = useJobListings();
  const { mutateAsync: deleteJobListings, isPending: isDeleting } = useBulkDeleteJobListings();
  const { createDeleteHandler } = useDeleteHandler();
  const { mutate: duplicateJobListing } = useDuplicateJobListing();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: jobListings as JobListingWithJobs[],
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableJobListing,
    duplicateMutation: duplicateJobListing,
    previewAction: (id: string) => {
      window.open(`/job_listings/preview/${id}`, "_blank");
    },
    moduleName: "JobListings",
  });

  const handleConfirmDelete = createDeleteHandler(deleteJobListings, {
    loading: "JobListings.loading.delete",
    success: "JobListings.success.delete",
    error: "JobListings.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredListings = useMemo(() => {
    return getFilteredJobListings(jobListings || []);
  }, [jobListings, getFilteredJobListings, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedListings = useMemo(() => {
    return getSortedJobListings(filteredListings);
  }, [filteredListings, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadJobListings) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.JobListings.title")}
        description={t("Pages.JobListings.description")}
      />
      <DataPageLayout count={jobListings?.length} itemsText={t("Pages.JobListings.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useJobListingsStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.JobListings.title")}
            onAddClick={
              canCreateJobListings ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Pages.JobListings.add")}
            searchPlaceholder={t("Pages.JobListings.search")}
            hideOptions={jobListings?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <JobListingsTable
              data={sortedListings as JobListingWithJobs[]}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedListings as JobListingWithJobs[]}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Pages.JobListings.no_listings_found")}
                renderItem={(listing: JobListingWithJobs) => (
                  <JobListingCard key={listing.id} jobListing={listing} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableJobListing ? t("Pages.JobListings.edit") : t("Pages.JobListings.add")}
          formId="job-listing-form"
          loadingSave={loadingSaveJobListing}
        >
          <JobListingForm
            formHtmlId={"job-listing-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableJobListing(null);
              setLoadingSaveJobListing(false);
              toast.success(t("General.successful_operation"), {
                description: t("JobListings.success.update"),
              });
            }}
            defaultValues={actionableJobListing}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("JobListings.confirm_delete")}
          description={t("JobListings.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

JobListingsPage.messages = ["Notes", "Pages", "JobListings", "Settings", "Jobs", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        JobListingsPage.messages,
      ),
    },
  };
};

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
import JobListingCard from "@/modules/job-listing/job-listing.card";
import { useJobListings, useBulkDeleteJobListings } from "@/modules/job-listing/job-listing.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/modules/job-listing/job-listing.options";
import useJobListingsStore from "@/modules/job-listing/job-listing.store";
import JobListingsTable from "@/modules/job-listing/job-listing.table";
import { JobListing } from "@/modules/job-listing/job-listing.type";

export default function JobListingsPage() {
  const t = useTranslations();

  const viewMode = useJobListingsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useJobListingsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useJobListingsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useJobListingsStore((state) => state.selectedRows);
  const clearSelection = useJobListingsStore((state) => state.clearSelection);
  const sortRules = useJobListingsStore((state) => state.sortRules);
  const sortCaseSensitive = useJobListingsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useJobListingsStore((state) => state.sortNullsFirst);
  const searchQuery = useJobListingsStore((state) => state.searchQuery);
  const filterConditions = useJobListingsStore((state) => state.filterConditions);
  const filterCaseSensitive = useJobListingsStore((state) => state.filterCaseSensitive);
  const getFilteredJobListings = useJobListingsStore((state) => state.getFilteredData);
  const getSortedJobListings = useJobListingsStore((state) => state.getSortedData);

  const { data: jobListings = [], isLoading, error } = useJobListings();
  const { mutateAsync: deleteJobListings, isPending: isDeleting } = useBulkDeleteJobListings();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteJobListings, {
    loading: "JobListings.loading.deleting",
    success: "JobListings.success.deleted",
    error: "JobListings.error.deleting",
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

  return (
    <div>
      <CustomPageMeta title={t("JobListings.title")} />
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
            store={useJobListingsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("JobListings.title")}
            createHref="/jobs/listings/add"
            createLabel={t("JobListings.create_listing")}
            searchPlaceholder={t("JobListings.search_listings")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <JobListingsTable
              data={sortedListings}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedListings}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("JobListings.no_listings_found")}
                renderItem={(listing: JobListing) => (
                  <JobListingCard key={listing.id} jobListing={listing} />
                )}
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
          title={t("JobListings.confirm_delete")}
          description={t("JobListings.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import JobListingCard from "@/components/app/job-listing/job-listing.card";
import JobListingsTable from "@/components/app/job-listing/job-listing.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { JobListing } from "@/types/job-listing.type";

import useUserStore from "@/hooks/use-user-store";
import { useJobListings, useBulkDeleteJobListings } from "@/hooks/useJobListings";
import useJobListingsStore from "@/stores/job-listings.store";

export default function JobListingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: jobListings = [], isLoading, error } = useJobListings();

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useJobListingsStore();
  const { mutate: deleteJobListings, isPending: isDeleting } = useBulkDeleteJobListings();

  const filteredListings = jobListings.filter(
    (listing: JobListing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const handleRowSelectionChange = (rows: JobListing[]) => {
    const newSelectedIds = rows.map((row) => row.id);
    setSelectedRows(newSelectedIds);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteJobListings(selectedRows);
      clearSelection();
      toast.success(t("JobListings.messages.items_deleted"));
    } catch (err: unknown) {
      console.error("Error deleting job listings:", err);
      toast.error(t("JobListings.messages.delete_error"), {
        description: String(err),
      });
    } finally {
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
          title={t("JobListings.title")}
          createHref="/jobs/listings/add"
          createLabel={t("JobListings.create_listing")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("JobListings.search_listings")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      <div>
        {viewMode === "table" ? (
          <JobListingsTable
            data={filteredListings}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onSelectedRowsChange={handleRowSelectionChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredListings}
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
        handleConfirmDelete={handleConfirmDelete}
        title={t("JobListings.confirm_delete")}
        description={t("JobListings.delete_description", { count: selectedRows.length })}
      />
    </DataPageLayout>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};

import { pick } from "lodash";
import { Briefcase, Plus } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import JobListingCard from "@/job-listing/job-listing.card";
import useJobListingColumns from "@/job-listing/job-listing.columns";
import { JobListingForm } from "@/job-listing/job-listing.form";
import {
  useJobListings,
  useBulkDeleteJobListings,
  useDuplicateJobListing,
} from "@/job-listing/job-listing.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/job-listing/job-listing.options";
import useJobListingsStore from "@/job-listing/job-listing.store";
import JobListingsTable from "@/job-listing/job-listing.table";
import { JobListingUpdateData, JobListingWithJobs } from "@/job-listing/job-listing.type";

export default function JobListingsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useJobListingColumns();

  const moduleHooks = createModuleStoreHooks(useJobListingsStore, "job_listings");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<JobListingUpdateData | null>(null);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const clearSelection = moduleHooks.useClearSelection();
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: jobListings, isLoading, error } = useJobListings();
  const { mutateAsync: deleteJobListings, isPending: isDeleting } = useBulkDeleteJobListings();
  const { mutate: duplicateJobListing } = useDuplicateJobListing();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: jobListings,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
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

  const storeData = useJobListingsStore((state) => state.data) || [];
  const setData = useJobListingsStore((state) => state.setData);

  useEffect(() => {
    if (jobListings && setData) {
      setData(jobListings);
    }
  }, [jobListings, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
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
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
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
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("JobListings.create_first.title"),
                  description: t("JobListings.create_first.description"),
                  add: t("Pages.JobListings.add"),
                  icons: [Briefcase, Plus, Briefcase],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
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
          title={actionableItem ? t("Pages.JobListings.edit") : t("Pages.JobListings.add")}
          formId="job-listing-form"
          loadingSave={loadingSave}
        >
          <JobListingForm
            formHtmlId={"job-listing-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
              toast.success(t("General.successful_operation"), {
                description: t("JobListings.success.update"),
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
          title={t("JobListings.confirm_delete", { count: selectedRows.length })}
          description={t("JobListings.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

JobListingsPage.messages = ["Notes", "Pages", "JobListings", "Settings", "Jobs", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        JobListingsPage.messages,
      ),
    },
  };
};

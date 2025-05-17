import { pick } from "lodash";
import { Briefcase, Plus } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
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

import JobCard from "@/job/job.card";
import useJobColumns from "@/job/job.columns";
import JobForm from "@/job/job.form";
import { useJobs, useBulkDeleteJobs, useDuplicateJob } from "@/job/job.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/job/job.options";
import useJobsStore from "@/job/job.store";
import JobTable from "@/job/job.table";
import { JobUpdateData } from "@/job/job.type";

export default function JobsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useJobColumns();

  const moduleHooks = createModuleStoreHooks(useJobsStore, "jobs");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<JobUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const sortRules = moduleHooks.useSortRules();
  const setSortRules = moduleHooks.useSetSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: jobs, isLoading: loadingFetchJobs, error } = useJobs();
  const { mutateAsync: duplicateJob } = useDuplicateJob();
  const { mutateAsync: deleteJobs, isPending: isDeleting } = useBulkDeleteJobs();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: jobs,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateJob,
    moduleName: "Jobs",
  });

  const handleConfirmDelete = createDeleteHandler(deleteJobs, {
    loading: "Jobs.loading.delete",
    success: "Jobs.success.delete",
    error: "Jobs.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredData = useMemo(() => {
    return getFilteredData(jobs || []);
  }, [jobs, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Pages.Jobs.title")} description={t("Pages.Jobs.description")} />
      <DataPageLayout count={jobs?.length} itemsText={t("Pages.Jobs.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useJobsStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useJobsStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Jobs.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Jobs.add")}
            searchPlaceholder={t("Pages.Jobs.search")}
            hideOptions={jobs?.length === 0}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <JobTable
              data={sortedData}
              isLoading={loadingFetchJobs}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={loadingFetchJobs}
                error={error}
                empty={{
                  title: t("Jobs.create_first.title"),
                  description: t("Jobs.create_first.description"),
                  add: t("Pages.Jobs.add"),
                  icons: [Briefcase, Plus, Briefcase],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(job) => <JobCard job={job} onActionClicked={onActionClicked} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Jobs.edit") : t("Pages.Jobs.add")}
          formId="job-form"
          loadingSave={loadingSave}
        >
          <JobForm
            formHtmlId="job-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Jobs.confirm_delete", { count: selectedRows.length })}
          description={t("Jobs.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

JobsPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Jobs",
  "Branches",
  "Warehouses",
  "OnlineStores",
  "Offices",
  "Departments",
  "Forms",
  "General",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, JobsPage.messages),
    },
  };
};

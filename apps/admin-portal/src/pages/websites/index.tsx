import { pick } from "lodash";
import { Globe, Link, Plus, User } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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

import WebsiteCard from "@/website/website.card";
import useWebsiteColumns from "@/website/website.columns";
import { WebsiteForm } from "@/website/website.form";
import { useWebsites, useBulkDeleteWebsites, useDuplicateWebsite } from "@/website/website.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/website/website.options";
import useWebsiteStore from "@/website/website.store";
import WebsitesTable from "@/website/website.table";
import { WebsiteUpdateData } from "@/website/website.type";

export default function WebsitesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useWebsiteColumns();

  const moduleHooks = createModuleStoreHooks(useWebsiteStore, "websites");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<WebsiteUpdateData | null>(null);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: websites, isLoading, error } = useWebsites();
  const { mutateAsync: deleteWebsites, isPending: isDeleting } = useBulkDeleteWebsites();
  const { mutate: duplicateWebsite } = useDuplicateWebsite();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: websites,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateWebsite,
    moduleName: "Websites",
  });

  const handleConfirmDelete = createDeleteHandler(deleteWebsites, {
    loading: "Websites.loading.delete",
    success: "Websites.success.delete",
    error: "Websites.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useWebsiteStore((state) => state.data) || [];
  const setData = useWebsiteStore((state) => state.setData);

  useEffect(() => {
    if (websites && setData) {
      setData(websites);
    }
  }, [websites, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

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

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Websites.title")}
        description={t("Pages.Websites.description")}
      />
      <DataPageLayout count={websites?.length} itemsText={t("Pages.Websites.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useWebsiteStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useWebsiteStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Websites.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Websites.add")}
            searchPlaceholder={t("Pages.Websites.search")}
            hideOptions={sortedData?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <WebsitesTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Websites.create_first.title"),
                  description: t("Websites.create_first.description"),
                  add: t("Pages.Websites.add"),
                  icons: [Globe, Plus, Globe],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    onActionClicked={onActionClicked}
                  />
                )}
                gridCols="3"
              />
            </div>
          ) : null}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem?.id ? t("Pages.Websites.edit") : t("Pages.Websites.add")}
          formId="website-form"
          loadingSave={loadingSave}
        >
          <WebsiteForm
            formHtmlId={"website-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem}
            editMode={!!actionableItem?.id}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Websites.confirm_delete", { count: selectedRows.length })}
          description={t("Websites.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

WebsitesPage.messages = ["Metadata", "Notes", "Pages", "Websites", "General", "CommonStatus"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      WebsitesPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};

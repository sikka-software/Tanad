import { pick } from "lodash";
import { Plus, Server } from "lucide-react";
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

import ServerCard from "@/server/server.card";
import useServerColumns from "@/server/server.columns";
import { ServerForm } from "@/server/server.form";
import { useServers, useBulkDeleteServers, useDuplicateServer } from "@/server/server.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/server/server.options";
import useServerStore from "@/server/server.store";
import ServersTable from "@/server/server.table";
import { ServerUpdateData } from "@/server/server.type";

export default function ServersPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useServerColumns();

  const moduleHooks = createModuleStoreHooks(useServerStore, "servers");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<ServerUpdateData | null>(null);

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

  const { data: servers, isLoading, error } = useServers();
  const { mutateAsync: deleteServers, isPending: isDeleting } = useBulkDeleteServers();
  const { mutate: duplicateServer } = useDuplicateServer();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: servers,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateServer,
    moduleName: "Servers",
  });

  const handleConfirmDelete = createDeleteHandler(deleteServers, {
    loading: "Servers.loading.delete",
    success: "Servers.success.delete",
    error: "Servers.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useServerStore((state) => state.data) || [];
  const setData = useServerStore((state) => state.setData);

  useEffect(() => {
    if (servers && setData) {
      setData(servers);
    }
  }, [servers, setData]);

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
        title={t("Pages.Servers.title")}
        description={t("Pages.Servers.description")}
      />
      <DataPageLayout count={servers?.length} itemsText={t("Pages.Servers.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useServerStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useServerStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Servers.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Servers.add")}
            searchPlaceholder={t("Pages.Servers.search")}
            hideOptions={servers?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ServersTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Servers.create_first.title"),
                  description: t("Servers.create_first.description"),
                  add: t("Pages.Servers.add"),
                  icons: [Server, Plus, Server],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(server) => (
                  <ServerCard server={server} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Servers.edit") : t("Pages.Servers.add")}
          formId="server-form"
          loadingSave={loadingSave}
        >
          <ServerForm
            formHtmlId={"server-form"}
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
          title={t("Servers.confirm_delete", { count: selectedRows.length })}
          description={t("Servers.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

ServersPage.messages = [
  "Metadata",
  "Notes",
  "Forms",
  "Pages",
  "Servers",
  "General",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        ServersPage.messages,
      ),
    },
  };
};

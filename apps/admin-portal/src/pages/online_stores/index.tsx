import { pick } from "lodash";
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

import OnlineStoreCard from "@/modules/online-store/online-store.card";
import useOnlineStoreColumns from "@/modules/online-store/online-store.columns";
import { OnlineStoreForm } from "@/modules/online-store/online-store.form";
import {
  useBulkDeleteOnlineStores,
  useOnlineStores,
  useDuplicateOnlineStore,
} from "@/modules/online-store/online-store.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/online-store/online-store.options";
import useOnlineStoreStore from "@/modules/online-store/online-store.store";
import OnlineStoresTable from "@/modules/online-store/online-store.table";
import { OnlineStore, OnlineStoreUpdateData } from "@/modules/online-store/online-store.type";

export default function OnlineStoresPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useOnlineStoreColumns();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableOnlineStore, setActionableOnlineStore] = useState<OnlineStoreUpdateData | null>(
    null,
  );

  const moduleHooks = createModuleStoreHooks(useOnlineStoreStore, "online_stores");

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

  const { data: onlineStores, isLoading: loadingFetchOnlineStores, error } = useOnlineStores();
  const { mutate: duplicateOnlineStore } = useDuplicateOnlineStore();
  const { mutateAsync: deleteOnlineStores, isPending: isDeleting } = useBulkDeleteOnlineStores();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: onlineStores,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableOnlineStore,
    duplicateMutation: duplicateOnlineStore,
    moduleName: "OnlineStores",
  });

  const handleConfirmDelete = createDeleteHandler(deleteOnlineStores, {
    loading: "OnlineStores.loading.delete",
    success: "OnlineStores.success.delete",
    error: "OnlineStores.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useOnlineStoreStore((state) => state.data) || [];
  const setData = useOnlineStoreStore((state) => state.setData);

  useEffect(() => {
    if (onlineStores && setData) {
      setData(onlineStores);
    }
  }, [onlineStores, setData]);

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
        title={t("Pages.OnlineStores.title")}
        description={t("Pages.OnlineStores.description")}
      />
      <DataPageLayout count={onlineStores?.length} itemsText={t("Pages.OnlineStores.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useOnlineStoreStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.OnlineStores.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.OnlineStores.add")}
            searchPlaceholder={t("Pages.OnlineStores.search")}
            hideOptions={onlineStores?.length === 0}
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
            <OnlineStoresTable
              data={sortedData}
              isLoading={loadingFetchOnlineStores}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={loadingFetchOnlineStores}
                error={error as Error | null}
                emptyMessage={t("Pages.OnlineStores.no_online_stores_found")}
                renderItem={(onlineStore) => (
                  <OnlineStoreCard key={onlineStore.id} onlineStore={onlineStore} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableOnlineStore ? t("Pages.OnlineStores.edit") : t("Pages.OnlineStores.add")}
          formId="online-store-form"
          loadingSave={loadingSave}
        >
          <OnlineStoreForm
            formHtmlId={"online-store-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableOnlineStore(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableOnlineStore as OnlineStore}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("OnlineStores.confirm_delete", { count: selectedRows.length })}
          description={t("OnlineStores.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

OnlineStoresPage.messages = ["Notes", "Pages", "OnlineStores", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        OnlineStoresPage.messages,
      ),
    },
  };
};

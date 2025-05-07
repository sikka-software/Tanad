import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import OnlineStoreCard from "@/modules/online-store/online-store.card";
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
import useUserStore from "@/stores/use-user-store";

export default function OnlineStoresPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadOnlineStores = useUserStore((state) => state.hasPermission("online_stores.read"));
  const canCreateOnlineStores = useUserStore((state) =>
    state.hasPermission("online_stores.create"),
  );

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableOnlineStore, setActionableOnlineStore] = useState<OnlineStoreUpdateData | null>(
    null,
  );

  const loadingSaveOnlineStore = useOnlineStoreStore((state) => state.isLoading);
  const setLoadingSaveOnlineStore = useOnlineStoreStore((state) => state.setIsLoading);
  const viewMode = useOnlineStoreStore((state) => state.viewMode);
  const isDeleteDialogOpen = useOnlineStoreStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useOnlineStoreStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useOnlineStoreStore((state) => state.selectedRows);
  const setSelectedRows = useOnlineStoreStore((state) => state.setSelectedRows);
  const clearSelection = useOnlineStoreStore((state) => state.clearSelection);
  const sortRules = useOnlineStoreStore((state) => state.sortRules);
  const sortCaseSensitive = useOnlineStoreStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useOnlineStoreStore((state) => state.sortNullsFirst);
  const searchQuery = useOnlineStoreStore((state) => state.searchQuery);
  const filterConditions = useOnlineStoreStore((state) => state.filterConditions);
  const filterCaseSensitive = useOnlineStoreStore((state) => state.filterCaseSensitive);
  const getFilteredOnlineStores = useOnlineStoreStore((state) => state.getFilteredData);
  const getSortedOnlineStores = useOnlineStoreStore((state) => state.getSortedData);

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

  const filteredOnlineStores = useMemo(() => {
    return getFilteredOnlineStores(onlineStores || []);
  }, [onlineStores, getFilteredOnlineStores, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedOnlineStores = useMemo(() => {
    return getSortedOnlineStores(filteredOnlineStores);
  }, [filteredOnlineStores, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadOnlineStores) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("OnlineStores.title")} description={t("OnlineStores.description")} />
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
            store={useOnlineStoreStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("OnlineStores.title")}
            onAddClick={
              canCreateOnlineStores ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("OnlineStores.create_new")}
            searchPlaceholder={t("OnlineStores.search_online_stores")}
            count={onlineStores?.length}
            hideOptions={onlineStores?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <OnlineStoresTable
              data={sortedOnlineStores}
              isLoading={loadingFetchOnlineStores}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedOnlineStores}
                isLoading={loadingFetchOnlineStores}
                error={error as Error | null}
                emptyMessage={t("OnlineStores.no_online_stores_found")}
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
          title={t("OnlineStores.add_new")}
          formId="online-store-form"
          loadingSave={loadingSaveOnlineStore}
        >
          <OnlineStoreForm
            formHtmlId={"online-store-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableOnlineStore(null);
              setLoadingSaveOnlineStore(false);
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
          title={t("OnlineStores.confirm_delete")}
          description={t("OnlineStores.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

import ServerCard from "@/modules/server/server.card";
import { ServerForm } from "@/modules/server/server.form";
import {
  useServers,
  useBulkDeleteServers,
  useDuplicateServer,
} from "@/modules/server/server.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/server/server.options";
import useServerStore from "@/modules/server/server.store";
import ServersTable from "@/modules/server/server.table";
import { ServerUpdateData } from "@/modules/server/server.type";
import useUserStore from "@/stores/use-user-store";

export default function ServersPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadServers = useUserStore((state) => state.hasPermission("servers.read"));
  const canCreateServers = useUserStore((state) => state.hasPermission("servers.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableServer, setActionableServer] = useState<ServerUpdateData | null>(null);

  const loadingSaveServer = useServerStore((state) => state.isLoading);
  const setLoadingSaveServer = useServerStore((state) => state.setIsLoading);
  const viewMode = useServerStore((state) => state.viewMode);
  const isDeleteDialogOpen = useServerStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useServerStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useServerStore((state) => state.selectedRows);
  const setSelectedRows = useServerStore((state) => state.setSelectedRows);
  const clearSelection = useServerStore((state) => state.clearSelection);
  const sortRules = useServerStore((state) => state.sortRules);
  const sortCaseSensitive = useServerStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useServerStore((state) => state.sortNullsFirst);
  const searchQuery = useServerStore((state) => state.searchQuery);
  const filterConditions = useServerStore((state) => state.filterConditions);
  const filterCaseSensitive = useServerStore((state) => state.filterCaseSensitive);
  const getFilteredServers = useServerStore((state) => state.getFilteredData);
  const getSortedServers = useServerStore((state) => state.getSortedData);

  const { data: servers, isLoading: loadingFetchServers, error } = useServers();
  const { mutate: duplicateServer } = useDuplicateServer();
  const { mutateAsync: deleteServers, isPending: isDeleting } = useBulkDeleteServers();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: servers,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableServer,
    duplicateMutation: duplicateServer,
    moduleName: "Servers",
  });

  const handleConfirmDelete = createDeleteHandler(deleteServers, {
    loading: "Servers.loading.delete",
    success: "Servers.success.delete",
    error: "Servers.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredServers = useMemo(() => {
    return getFilteredServers(servers || []);
  }, [servers, getFilteredServers, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedServers = useMemo(() => {
    return getSortedServers(filteredServers);
  }, [filteredServers, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadServers) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Servers.title")} description={t("Servers.description")} />
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
            store={useServerStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Servers.title")}
            onAddClick={canCreateServers ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Servers.create_new")}
            searchPlaceholder={t("Servers.search_servers")}
            count={servers?.length}
            hideOptions={servers?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <ServersTable
              data={sortedServers}
              isLoading={loadingFetchServers}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedServers}
                isLoading={loadingFetchServers}
                error={error as Error | null}
                emptyMessage={t("Servers.no_servers_found")}
                renderItem={(server) => <ServerCard key={server.id} server={server} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Servers.add_new")}
          formId="server-form"
          loadingSave={loadingSaveServer}
        >
          <ServerForm
            formHtmlId={"server-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableServer(null);
              setLoadingSaveServer(false);
            }}
            defaultValues={actionableServer}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Servers.confirm_delete")}
          description={t("Servers.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

ServersPage.messages = ["Pages", "Servers", "General"];

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

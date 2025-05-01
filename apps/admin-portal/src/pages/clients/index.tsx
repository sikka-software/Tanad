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

import ClientCard from "@/client/client.card";
import { ClientForm } from "@/client/client.form";
import { useClients, useBulkDeleteClients, useDuplicateClient } from "@/client/client.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/client/client.options";
import useClientStore from "@/client/client.store";
import ClientsTable from "@/client/client.table";
import { ClientUpdateData } from "@/client/client.type";

import useUserStore from "@/stores/use-user-store";

export default function ClientsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadClients = useUserStore((state) => state.hasPermission("clients.read"));
  const canCreateClients = useUserStore((state) => state.hasPermission("clients.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableClient, setActionableClient] = useState<ClientUpdateData | null>(null);

  const loadingSaveClient = useClientStore((state) => state.isLoading);
  const setLoadingSaveClient = useClientStore((state) => state.setIsLoading);
  const viewMode = useClientStore((state) => state.viewMode);
  const isDeleteDialogOpen = useClientStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useClientStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useClientStore((state) => state.selectedRows);
  const setSelectedRows = useClientStore((state) => state.setSelectedRows);
  const clearSelection = useClientStore((state) => state.clearSelection);
  const sortRules = useClientStore((state) => state.sortRules);
  const sortCaseSensitive = useClientStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useClientStore((state) => state.sortNullsFirst);
  const searchQuery = useClientStore((state) => state.searchQuery);
  const filterConditions = useClientStore((state) => state.filterConditions);
  const filterCaseSensitive = useClientStore((state) => state.filterCaseSensitive);
  const getFilteredClients = useClientStore((state) => state.getFilteredData);
  const getSortedClients = useClientStore((state) => state.getSortedData);

  const { data: clients, isLoading, error } = useClients();
  const { mutate: duplicateClient } = useDuplicateClient();
  const { mutateAsync: deleteClients, isPending: isDeleting } = useBulkDeleteClients();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: clients,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableClient,
    duplicateMutation: duplicateClient,
    moduleName: "Clients",
  });

  const handleConfirmDelete = createDeleteHandler(deleteClients, {
    loading: "Clients.loading.deleting",
    success: "Clients.success.deleted",
    error: "Clients.error.deleting",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredClients = useMemo(() => {
    return getFilteredClients(clients || []);
  }, [clients, getFilteredClients, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedClients = useMemo(() => {
    return getSortedClients(filteredClients);
  }, [filteredClients, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadClients) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Clients.title")} description={t("Clients.description")} />
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
            store={useClientStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Clients.title")}
            onAddClick={canCreateClients ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Clients.add_new")}
            searchPlaceholder={t("Clients.search_clients")}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <ClientsTable
              key={`sorted-${sortedClients?.length}-${JSON.stringify(sortRules)}`}
              data={sortedClients || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedClients || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Clients.no_clients_found")}
                renderItem={(client) => <ClientCard client={client} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Clients.add_new")}
          formId="client-form"
          loadingSave={loadingSaveClient}
        >
          <ClientForm
            id={"client-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableClient(null);
              setLoadingSaveClient(false);
              toast.success(t("General.successful_operation"), {
                description: t("Clients.success.updated"),
              });
            }}
            defaultValues={actionableClient}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Clients.confirm_delete_title")}
          description={t("Clients.confirm_delete", { count: selectedRows.length })}
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

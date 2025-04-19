import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import ClientCard from "@/modules/client/client.card";
import { useClients, useBulkDeleteClients } from "@/modules/client/client.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/client/client.options";
import { useClientsStore } from "@/modules/client/client.store";
import ClientsTable from "@/modules/client/client.table";
import { Client } from "@/modules/client/client.type";

export default function ClientsPage() {
  const t = useTranslations();

  const viewMode = useClientsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useClientsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useClientsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useClientsStore((state) => state.selectedRows);
  const setSelectedRows = useClientsStore((state) => state.setSelectedRows);
  const clearSelection = useClientsStore((state) => state.clearSelection);
  const sortRules = useClientsStore((state) => state.sortRules);
  const sortCaseSensitive = useClientsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useClientsStore((state) => state.sortNullsFirst);
  const searchQuery = useClientsStore((state) => state.searchQuery);
  const filterConditions = useClientsStore((state) => state.filterConditions);
  const filterCaseSensitive = useClientsStore((state) => state.filterCaseSensitive);
  const getFilteredClients = useClientsStore((state) => state.getFilteredClients);
  const getSortedClients = useClientsStore((state) => state.getSortedClients);

  const { data: clients, isLoading, error } = useClients();
  const { mutate: deleteClients, isPending: isDeleting } = useBulkDeleteClients();

  const filteredClients = useMemo(() => {
    return getFilteredClients(clients || []);
  }, [clients, getFilteredClients, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedClients = useMemo(() => {
    return getSortedClients(filteredClients);
  }, [filteredClients, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleRowSelectionChange = (rows: Client[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteClients(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete clients:", error);
          toast.error(t("Clients.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete clients:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
            store={useClientsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Clients.title")}
            createHref="/clients/add"
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
              onSelectedRowsChange={handleRowSelectionChange}
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

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
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

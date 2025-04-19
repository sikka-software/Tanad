import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import ClientCard from "@/modules/client/client.card";
import { useClients, useBulkDeleteClients } from "@/modules/client/client.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/client/client.options";
import { useClientStore } from "@/modules/client/client.store";
import ClientsTable from "@/modules/client/client.table";

export default function ClientsPage() {
  const t = useTranslations();

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
  const getFilteredClients = useClientStore((state) => state.getFilteredClients);
  const getSortedClients = useClientStore((state) => state.getSortedClients);

  const { data: clients, isLoading, error } = useClients();
  const { mutate: deleteClients, isPending: isDeleting } = useBulkDeleteClients();

  const filteredClients = useMemo(() => {
    return getFilteredClients(clients || []);
  }, [clients, getFilteredClients, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedClients = useMemo(() => {
    return getSortedClients(filteredClients);
  }, [filteredClients, sortRules, sortCaseSensitive, sortNullsFirst]);

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
            store={useClientStore}
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

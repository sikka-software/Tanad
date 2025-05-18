import { pick } from "lodash";
import { Plus, User } from "lucide-react";
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

import { useCompanies } from "@/company/company.hooks";
import { Company } from "@/company/company.type";

import ClientCard from "@/client/client.card";
import useClientColumns from "@/client/client.columns";
import ClientForm from "@/client/client.form";
import { useClients, useBulkDeleteClients, useDuplicateClient } from "@/client/client.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/client/client.options";
import useClientStore from "@/client/client.store";
import ClientsTable from "@/client/client.table";
import { ClientUpdateData, Client } from "@/client/client.type";

export default function ClientsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useClientColumns();

  const moduleHooks = createModuleStoreHooks(useClientStore, "clients");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<ClientUpdateData | null>(null);

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

  const { data: companies } = useCompanies();
  const { data: clients, isLoading, error } = useClients();
  const { mutateAsync: deleteClients, isPending: isDeleting } = useBulkDeleteClients();
  const { mutate: duplicateClient } = useDuplicateClient();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: clients,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateClient,
    moduleName: "Clients",
  });

  const handleConfirmDelete = createDeleteHandler(deleteClients, {
    loading: "Clients.loading.delete",
    success: "Clients.success.delete",
    error: "Clients.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useClientStore((state) => state.data) || [];
  const setData = useClientStore((state) => state.setData);

  useEffect(() => {
    if (clients && setData) {
      setData(clients);
    }
  }, [clients, setData]);

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
        title={t("Pages.Clients.title")}
        description={t("Pages.Clients.description")}
      />
      <DataPageLayout count={clients?.length} itemsText={t("Pages.Clients.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useClientStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useClientStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Clients.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Clients.add")}
            searchPlaceholder={t("Pages.Clients.search")}
            hideOptions={clients?.length === 0}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <ClientsTable
              key={`sorted-${sortedData?.length}-${JSON.stringify(sortRules)}`}
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList<Client>
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Clients.create_first.title"),
                  description: t("Clients.create_first.description"),
                  add: t("Pages.Clients.add"),
                  icons: [User, Plus, User],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(client) => (
                  <ClientCard
                    client={client}
                    company={companies?.find((company) => company.id === client.company) as Company}
                    onActionClicked={onActionClicked}
                  />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Clients.edit") : t("Pages.Clients.add")}
          formId="client-form"
          loadingSave={loadingSave}
        >
          <ClientForm
            formHtmlId={"client-form"}
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
          title={t("Clients.confirm_delete", { count: selectedRows.length })}
          description={t("Clients.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

ClientsPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Clients",
  "Companies",
  "General",
  "Forms",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        ClientsPage.messages,
      ),
    },
  };
};

import { pick } from "lodash";
import { Car, Plus, Truck } from "lucide-react";
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

import TruckCard from "@/truck/truck.card";
import useTruckColumns from "@/truck/truck.columns";
import { TruckForm } from "@/truck/truck.form";
import { useTrucks, useBulkDeleteTrucks, useDuplicateTruck } from "@/truck/truck.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/truck/truck.options";
import useTruckStore from "@/truck/truck.store";
import TrucksTable from "@/truck/truck.table";
import { TruckUpdateData } from "@/truck/truck.type";

export default function TrucksPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useTruckColumns();

  const moduleHooks = createModuleStoreHooks(useTruckStore, "trucks");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<TruckUpdateData | null>(null);

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

  const { data: trucks, isLoading: isFetchingTrucks, error } = useTrucks();
  const { mutateAsync: deleteTrucks, isPending: isDeleting } = useBulkDeleteTrucks();
  const { mutate: duplicateTruck } = useDuplicateTruck();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: trucks,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateTruck,
    moduleName: "Trucks",
  });

  const handleConfirmDelete = createDeleteHandler(deleteTrucks, {
    loading: "Trucks.loading.delete",
    success: "Trucks.success.delete",
    error: "Trucks.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useTruckStore((state) => state.data) || [];
  const setData = useTruckStore((state) => state.setData);

  useEffect(() => {
    if (trucks && setData) {
      setData(trucks);
    }
  }, [trucks, setData]);

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
      <CustomPageMeta title={t("Pages.Trucks.title")} description={t("Pages.Trucks.description")} />
      <DataPageLayout count={trucks?.length} itemsText={t("Pages.Trucks.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useTruckStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useTruckStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Trucks.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Trucks.add")}
            searchPlaceholder={t("Pages.Trucks.search")}
            hideOptions={trucks?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <TrucksTable
              data={sortedData}
              isLoading={isFetchingTrucks}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isFetchingTrucks}
                error={error}
                empty={{
                  title: t("Trucks.create_first.title"),
                  description: t("Trucks.create_first.description"),
                  add: t("Pages.Trucks.add"),
                  icons: [Truck, Plus, Truck],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(truck) => (
                  <TruckCard truck={truck} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Trucks.edit") : t("Pages.Trucks.add")}
          formId="truck-form"
          loadingSave={loadingSave}
        >
          <TruckForm
            formHtmlId={"truck-form"}
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
          title={t("Trucks.confirm_delete", { count: selectedRows.length })}
          description={t("Trucks.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

TrucksPage.messages = [
  "Metadata",
  "Pages",
  "Trucks",
  "Vehicles",
  "Notes",
  "Forms",
  "General",
  "PaymentCycles",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        TrucksPage.messages,
      ),
    },
  };
};

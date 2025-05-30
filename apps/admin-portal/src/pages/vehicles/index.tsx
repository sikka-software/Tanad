import { pick } from "lodash";
import { Car, Plus } from "lucide-react";
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

import VehicleCard from "@/vehicle/vehicle.card";
import useVehicleColumns from "@/vehicle/vehicle.columns";
import { VehicleForm } from "@/vehicle/vehicle.form";
import { useVehicles, useBulkDeleteVehicles, useDuplicateVehicle } from "@/vehicle/vehicle.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/vehicle/vehicle.options";
import useVehicleStore from "@/vehicle/vehicle.store";
import VehiclesTable from "@/vehicle/vehicle.table";
import { VehicleUpdateData } from "@/vehicle/vehicle.type";

export default function VehiclesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useVehicleColumns();

  const moduleHooks = createModuleStoreHooks(useVehicleStore, "vehicles");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<VehicleUpdateData | null>(null);

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

  const { data: vehicles, isLoading, error } = useVehicles();
  const { mutateAsync: deleteVehicles, isPending: isDeleting } = useBulkDeleteVehicles();
  const { mutate: duplicateVehicle } = useDuplicateVehicle();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: vehicles,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateVehicle,
    moduleName: "Vehicles",
  });

  const handleConfirmDelete = createDeleteHandler(deleteVehicles, {
    loading: "Vehicles.loading.delete",
    success: "Vehicles.success.delete",
    error: "Vehicles.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useVehicleStore((state) => state.data) || [];
  const setData = useVehicleStore((state) => state.setData);

  useEffect(() => {
    if (vehicles && setData) {
      setData(vehicles);
    }
  }, [vehicles, setData]);

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
        title={t("Pages.Vehicles.title")}
        description={t("Pages.Vehicles.description")}
      />
      <DataPageLayout count={vehicles?.length} itemsText={t("Pages.Vehicles.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useVehicleStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useVehicleStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Vehicles.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Vehicles.add")}
            searchPlaceholder={t("Pages.Vehicles.search")}
            hideOptions={vehicles?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <VehiclesTable
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
                  title: t("Vehicles.create_first.title"),
                  description: t("Vehicles.create_first.description"),
                  add: t("Pages.Vehicles.add"),
                  icons: [Car, Plus, Car],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
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
          title={actionableItem ? t("Pages.Vehicles.edit") : t("Pages.Vehicles.add")}
          formId="vehicle-form"
          loadingSave={loadingSave}
        >
          <VehicleForm
            formHtmlId={"vehicle-form"}
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
          title={t("Vehicles.confirm_delete", { count: selectedRows.length })}
          description={t("Vehicles.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

VehiclesPage.messages = [
  "Metadata",
  "Pages",
  "Vehicles",
  "Notes",
  "Forms",
  "General",
  "PaymentCycles",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      VehiclesPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};

import useTruckColumns from "@root/src/modules/truck/truck.columns";
import { createModuleStoreHooks } from "@root/src/utils/module-hooks";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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

import TruckCard from "@/modules/truck/truck.card";
import { TruckForm } from "@/modules/truck/truck.form";
import { useTrucks, useBulkDeleteTrucks, useDuplicateTruck } from "@/modules/truck/truck.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/truck/truck.options";
import useTruckStore from "@/modules/truck/truck.store";
import TrucksTable from "@/modules/truck/truck.table";
import { TruckUpdateData } from "@/modules/truck/truck.type";

export default function TrucksPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useTruckColumns();

  const moduleHooks = createModuleStoreHooks(useTruckStore, "trucks");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<TruckUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

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

  const { data: trucks, isLoading, error } = useTrucks();
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

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Trucks.title")} description={t("Trucks.description")} />
      <DataPageLayout count={trucks?.length} itemsText={t("Pages.Trucks.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={(open) => {
              if (open) setPendingDeleteIds(selectedRows);
              setIsDeleteDialogOpen(open);
            }}
          />
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
            <TrucksTable
              data={sortedData}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedData}
                isLoading={isLoading}
                error={error}
                emptyMessage={t("Trucks.no_trucks_found")}
                renderItem={(truck) => <TruckCard key={truck.id} truck={truck} />}
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
          title={t("Trucks.confirm_delete")}
          description={t("Trucks.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

TrucksPage.messages = ["Pages", "Trucks", "Vehicles", "Notes", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        TrucksPage.messages,
      ),
    },
  };
};

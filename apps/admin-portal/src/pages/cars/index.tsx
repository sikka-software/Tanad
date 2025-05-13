import useCarColumns from "@root/src/modules/car/car.columns";
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

import CarCard from "@/modules/car/car.card";
import { CarForm } from "@/modules/car/car.form";
import { useCars, useBulkDeleteCars, useDuplicateCar } from "@/modules/car/car.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/car/car.options";
import useCarStore from "@/modules/car/car.store";
import CarsTable from "@/modules/car/car.table";
import { CarUpdateData } from "@/modules/car/car.type";

export default function CarsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useCarColumns();

  const moduleHooks = createModuleStoreHooks(useCarStore, "cars");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<CarUpdateData | null>(null);
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

  const { data: cars, isLoading, error } = useCars();
  const { mutateAsync: deleteCars, isPending: isDeleting } = useBulkDeleteCars();
  const { mutate: duplicateCar } = useDuplicateCar();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: cars,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateCar,
    moduleName: "Cars",
  });

  const handleConfirmDelete = createDeleteHandler(deleteCars, {
    loading: "Cars.loading.delete",
    success: "Cars.success.delete",
    error: "Cars.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useCarStore((state) => state.data) || [];
  const setData = useCarStore((state) => state.setData);

  useEffect(() => {
    if (cars && setData) {
      setData(cars);
    }
  }, [cars, setData]);

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
      <CustomPageMeta title={t("Cars.title")} description={t("Cars.description")} />
      <DataPageLayout count={cars?.length} itemsText={t("Pages.Cars.title")}>
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
            store={useCarStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Cars.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Cars.add")}
            searchPlaceholder={t("Pages.Cars.search")}
            hideOptions={cars?.length === 0}
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
            <CarsTable
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
                emptyMessage={t("Cars.no_cars_found")}
                renderItem={(car) => <CarCard key={car.id} car={car} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Cars.edit") : t("Pages.Cars.add")}
          formId="car-form"
          loadingSave={loadingSave}
        >
          <CarForm
            formHtmlId={"car-form"}
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
          title={t("Cars.confirm_delete")}
          description={t("Cars.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

CarsPage.messages = ["Pages", "Cars", "Vehicles", "Notes", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, CarsPage.messages),
    },
  };
};

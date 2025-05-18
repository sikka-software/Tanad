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

import CarCard from "@/car/car.card";
import useCarColumns from "@/car/car.columns";
import { CarForm } from "@/car/car.form";
import { useCars, useBulkDeleteCars, useDuplicateCar } from "@/car/car.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/car/car.options";
import useCarStore from "@/car/car.store";
import CarsTable from "@/car/car.table";
import { CarUpdateData } from "@/car/car.type";

export default function CarsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useCarColumns();

  const moduleHooks = createModuleStoreHooks(useCarStore, "cars");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<CarUpdateData | null>(null);

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
      <CustomPageMeta title={t("Pages.Cars.title")} description={t("Pages.Cars.description")} />
      <DataPageLayout count={cars?.length} itemsText={t("Pages.Cars.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useCarStore} isDeleting={isDeleting} />
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
          />
        )}

        <div>
          {viewMode === "table" ? (
            <CarsTable
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
                  title: t("Cars.create_first.title"),
                  description: t("Cars.create_first.description"),
                  add: t("Pages.Cars.add"),
                  icons: [Car, Plus, Car],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(car) => <CarCard car={car} onActionClicked={onActionClicked} />}
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
          title={t("Cars.confirm_delete", { count: selectedRows.length })}
          description={t("Cars.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

CarsPage.messages = [
  "Metadata",
  "Pages",
  "Cars",
  "Vehicles",
  "Notes",
  "Forms",
  "General",
  "PaymentCycles",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, CarsPage.messages),
    },
  };
};

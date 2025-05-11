import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

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
import useUserStore from "@/stores/use-user-store";

export default function CarsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadCars = useUserStore((state) => state.hasPermission("cars.read"));
  const canCreateCars = useUserStore((state) => state.hasPermission("cars.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableCar, setActionableCar] = useState<CarUpdateData | null>(null);

  const loadingSaveCar = useCarStore((state) => state.isLoading);
  const setLoadingSaveCar = useCarStore((state) => state.setIsLoading);
  const viewMode = useCarStore((state) => state.viewMode);
  const isDeleteDialogOpen = useCarStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useCarStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useCarStore((state) => state.selectedRows);
  const setSelectedRows = useCarStore((state) => state.setSelectedRows);
  const clearSelection = useCarStore((state) => state.clearSelection);
  const sortRules = useCarStore((state) => state.sortRules);
  const sortCaseSensitive = useCarStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useCarStore((state) => state.sortNullsFirst);
  const searchQuery = useCarStore((state) => state.searchQuery);
  const filterConditions = useCarStore((state) => state.filterConditions);
  const filterCaseSensitive = useCarStore((state) => state.filterCaseSensitive);
  const getFilteredCars = useCarStore((state) => state.getFilteredData);
  const getSortedCars = useCarStore((state) => state.getSortedData);

  const { data: cars, isLoading: loadingFetchCars, error } = useCars();
  const { mutate: duplicateCar } = useDuplicateCar();
  const { mutateAsync: deleteCars, isPending: isDeleting } = useBulkDeleteCars();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: cars,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableCar,
    duplicateMutation: duplicateCar,
    moduleName: "Cars",
  });

  const handleConfirmDelete = createDeleteHandler(deleteCars, {
    loading: "Cars.loading.delete",
    success: "Cars.success.delete",
    error: "Cars.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredCars = useMemo(() => {
    return getFilteredCars(cars || []);
  }, [cars, getFilteredCars, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedCars = useMemo(() => {
    return getSortedCars(filteredCars);
  }, [filteredCars, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadCars) {
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
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useCarStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Cars.title")}
            onAddClick={canCreateCars ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Cars.add")}
            searchPlaceholder={t("Pages.Cars.search")}
            hideOptions={cars?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <CarsTable
              data={sortedCars}
              isLoading={loadingFetchCars}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedCars}
                isLoading={loadingFetchCars}
                error={error as Error | null}
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
          title={actionableCar ? t("Pages.Cars.edit") : t("Pages.Cars.add")}
          formId="car-form"
          loadingSave={loadingSaveCar}
        >
          <CarForm
            formHtmlId={"car-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableCar(null);
              setLoadingSaveCar(false);
            }}
            defaultValues={actionableCar}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Cars.confirm_delete")}
          description={t("Cars.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

CarsPage.messages = ["Pages", "Cars", "Notes", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, CarsPage.messages),
    },
  };
};

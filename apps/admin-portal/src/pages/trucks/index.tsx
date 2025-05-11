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

import TruckCard from "@/modules/truck/truck.card";
import { TruckForm } from "@/modules/truck/truck.form";
import { useTrucks, useBulkDeleteTrucks, useDuplicateTruck } from "@/modules/truck/truck.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/truck/truck.options";
import useTruckStore from "@/modules/truck/truck.store";
import TrucksTable from "@/modules/truck/truck.table";
import { TruckUpdateData } from "@/modules/truck/truck.type";
import useUserStore from "@/stores/use-user-store";

export default function TrucksPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadTrucks = useUserStore((state) => state.hasPermission("trucks.read"));
  const canCreateTrucks = useUserStore((state) => state.hasPermission("trucks.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableTruck, setActionableTruck] = useState<TruckUpdateData | null>(null);

  const loadingSaveTruck = useTruckStore((state) => state.isLoading);
  const setLoadingSaveTruck = useTruckStore((state) => state.setIsLoading);
  const viewMode = useTruckStore((state) => state.viewMode);
  const isDeleteDialogOpen = useTruckStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useTruckStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useTruckStore((state) => state.selectedRows);
  const setSelectedRows = useTruckStore((state) => state.setSelectedRows);
  const clearSelection = useTruckStore((state) => state.clearSelection);
  const sortRules = useTruckStore((state) => state.sortRules);
  const sortCaseSensitive = useTruckStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useTruckStore((state) => state.sortNullsFirst);
  const searchQuery = useTruckStore((state) => state.searchQuery);
  const filterConditions = useTruckStore((state) => state.filterConditions);
  const filterCaseSensitive = useTruckStore((state) => state.filterCaseSensitive);
  const getFilteredTrucks = useTruckStore((state) => state.getFilteredData);
  const getSortedTrucks = useTruckStore((state) => state.getSortedData);

  const { data: trucks, isLoading: loadingFetchTrucks, error } = useTrucks();
  const { mutate: duplicateTruck } = useDuplicateTruck();
  const { mutateAsync: deleteTrucks, isPending: isDeleting } = useBulkDeleteTrucks();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: trucks,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableTruck,
    duplicateMutation: duplicateTruck,
    moduleName: "Trucks",
  });

  const handleConfirmDelete = createDeleteHandler(deleteTrucks, {
    loading: "Trucks.loading.delete",
    success: "Trucks.success.delete",
    error: "Trucks.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredTrucks = useMemo(() => {
    return getFilteredTrucks(trucks || []);
  }, [trucks, getFilteredTrucks, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedTrucks = useMemo(() => {
    return getSortedTrucks(filteredTrucks);
  }, [filteredTrucks, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadTrucks) {
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
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useTruckStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Trucks.title")}
            onAddClick={canCreateTrucks ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Trucks.add")}
            searchPlaceholder={t("Pages.Trucks.search")}
            hideOptions={trucks?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <TrucksTable
              data={sortedTrucks}
              isLoading={loadingFetchTrucks}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedTrucks}
                isLoading={loadingFetchTrucks}
                error={error as Error | null}
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
          title={actionableTruck ? t("Pages.Trucks.edit") : t("Pages.Trucks.add")}
          formId="truck-form"
          loadingSave={loadingSaveTruck}
        >
          <TruckForm
            formHtmlId={"truck-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableTruck(null);
              setLoadingSaveTruck(false);
            }}
            defaultValues={actionableTruck}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Trucks.confirm_delete")}
          description={t("Trucks.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

TrucksPage.messages = ["Pages", "Trucks", "Notes", "Forms", "General"];

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

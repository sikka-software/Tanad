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

import IndividualCard from "@/individual/individual.card";
import useIndividualColumns from "@/individual/individual.columns";
import IndividualForm from "@/individual/individual.form";
import {
  useIndividuals,
  useBulkDeleteIndividuals,
  useDuplicateIndividual,
} from "@/individual/individual.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/individual/individual.options";
import useIndividualStore from "@/individual/individual.store";
import IndividualsTable from "@/individual/individual.table";
import { IndividualUpdateData, Individual } from "@/individual/individual.type";

export default function IndividualsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useIndividualColumns();

  const moduleHooks = createModuleStoreHooks(useIndividualStore, "individuals");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<IndividualUpdateData | null>(null);

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
  const { data: individuals, isLoading, error } = useIndividuals();
  const { mutateAsync: deleteIndividuals, isPending: isDeleting } = useBulkDeleteIndividuals();
  const { mutate: duplicateIndividual } = useDuplicateIndividual();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: individuals,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateIndividual,
    moduleName: "Individuals",
  });

  const handleConfirmDelete = createDeleteHandler(deleteIndividuals, {
    loading: "Individuals.loading.delete",
    success: "Individuals.success.delete",
    error: "Individuals.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useIndividualStore((state) => state.data) || [];
  const setData = useIndividualStore((state) => state.setData);

  useEffect(() => {
    if (individuals && setData) {
      setData(individuals);
    }
  }, [individuals, setData]);

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
        title={t("Pages.Individuals.title")}
        description={t("Pages.Individuals.description")}
      />
      <DataPageLayout count={individuals?.length} itemsText={t("Pages.Individuals.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useIndividualStore} isDeleting={isDeleting} />
        ) : (
          <PageSearchAndFilter
            store={useIndividualStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Individuals.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Individuals.add")}
            searchPlaceholder={t("Pages.Individuals.search")}
            hideOptions={individuals?.length === 0}
          />
        )}
        <div>
          {viewMode === "table" ? (
            <IndividualsTable
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
              <DataModelList<Individual>
                data={sortedData}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Individuals.create_first.title"),
                  description: t("Individuals.create_first.description"),
                  add: t("Pages.Individuals.add"),
                  icons: [User, Plus, User],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(individual) => (
                  <IndividualCard
                    key={individual.id}
                    individual={individual}
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
          title={actionableItem ? t("Pages.Individuals.edit") : t("Pages.Individuals.add")}
          formId="individual-form"
          loadingSave={loadingSave}
        >
          <IndividualForm
            formHtmlId="individual-form"
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
          title={t("Individuals.confirm_delete", { count: selectedRows.length })}
          description={t("Individuals.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

IndividualsPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Individuals",
  "Companies",
  "General",
  "Forms",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      IndividualsPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};

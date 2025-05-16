import { pick } from "lodash";
import { Currency, FileMinus2, FilePlus2, Plus } from "lucide-react";
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

import PurchaseCard from "@/purchase/purchase.card";
import usePurchaseColumns from "@/purchase/purchase.columns";
import { PurchaseForm } from "@/purchase/purchase.form";
import {
  usePurchases,
  useBulkDeletePurchases,
  useDuplicatePurchase,
} from "@/purchase/purchase.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/purchase/purchase.options";
import usePurchaseStore from "@/purchase/purchase.store";
import PurchasesTable from "@/purchase/purchase.table";
import { PurchaseUpdateData } from "@/purchase/purchase.type";

export default function PurchasesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = usePurchaseColumns();

  const moduleHooks = createModuleStoreHooks(usePurchaseStore, "purchases");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionablePurchase, setActionablePurchase] = useState<PurchaseUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Column Visibility
  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();
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

  const { data: purchases, isLoading: loadingFetchPurchases, error } = usePurchases();
  const { mutate: duplicatePurchase } = useDuplicatePurchase();
  const { mutateAsync: deletePurchases, isPending: isDeleting } = useBulkDeletePurchases();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: purchases,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionablePurchase,
    duplicateMutation: duplicatePurchase,
    moduleName: "Purchases",
  });

  const handleConfirmDelete = createDeleteHandler(deletePurchases, {
    loading: "Purchases.loading.delete",
    success: "Purchases.success.delete",
    error: "Purchases.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = usePurchaseStore((state) => state.data) || [];
  const setData = usePurchaseStore((state) => state.setData);

  useEffect(() => {
    if (purchases && setData) {
      setData(purchases);
    }
  }, [purchases, setData]);

  const filteredPurchases = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedPurchases = useMemo(() => {
    return getSortedData(filteredPurchases);
  }, [filteredPurchases, sortRules, sortCaseSensitive, sortNullsFirst]);

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

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Purchases.title")}
        description={t("Pages.Purchases.description")}
      />
      <DataPageLayout count={purchases?.length} itemsText={t("Pages.Purchases.title")}>
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
            store={usePurchaseStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Purchases.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Purchases.add")}
            searchPlaceholder={t("Pages.Purchases.search")}
            hideOptions={purchases?.length === 0}
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
            <PurchasesTable
              data={sortedPurchases}
              isLoading={loadingFetchPurchases}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <DataModelList
                data={sortedPurchases}
                isLoading={loadingFetchPurchases}
                error={error}
                empty={{
                  title: t("Purchases.create_first.title"),
                  description: t("Purchases.create_first.description"),
                  add: t("Pages.Purchases.add"),
                  icons: [FileMinus2, Plus, FilePlus2],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(purchase) => (
                  <PurchaseCard purchase={purchase} onActionClicked={onActionClicked} />
                )}
                gridCols="3"
              />
            </div>
          ) : null}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionablePurchase ? t("Pages.Purchases.edit") : t("Pages.Purchases.add")}
          formId="purchase-form"
          loadingSave={loadingSave}
        >
          <PurchaseForm
            formHtmlId={"purchase-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionablePurchase(null);
              setLoadingSave(false);
            }}
            defaultValues={actionablePurchase}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Purchases.confirm_delete", { count: selectedRows.length })}
          description={t("Purchases.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

PurchasesPage.messages = ["Notes", "Pages", "Purchases", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        PurchasesPage.messages,
      ),
    },
  };
};

import { pick } from "lodash";
import { Currency, Plus } from "lucide-react";
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

import useUserStore from "@/stores/use-user-store";

export default function PurchasesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = usePurchaseColumns();

  const canReadPurchases = useUserStore((state) => state.hasPermission("purchases.read"));
  const canCreatePurchases = useUserStore((state) => state.hasPermission("purchases.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionablePurchase, setActionablePurchase] = useState<PurchaseUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const loadingSavePurchase = usePurchaseStore((state) => state.isLoading);
  const setLoadingSavePurchase = usePurchaseStore((state) => state.setIsLoading);

  const isDeleteDialogOpen = usePurchaseStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = usePurchaseStore((state) => state.setIsDeleteDialogOpen);

  const selectedRows = usePurchaseStore((state) => state.selectedRows);
  const setSelectedRows = usePurchaseStore((state) => state.setSelectedRows);

  const columnVisibility = usePurchaseStore((state) => state.columnVisibility);
  const setColumnVisibility = usePurchaseStore((state) => state.setColumnVisibility);

  const viewMode = usePurchaseStore((state) => state.viewMode);
  const clearSelection = usePurchaseStore((state) => state.clearSelection);
  const sortRules = usePurchaseStore((state) => state.sortRules);
  const sortCaseSensitive = usePurchaseStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = usePurchaseStore((state) => state.sortNullsFirst);
  const searchQuery = usePurchaseStore((state) => state.searchQuery);
  const filterConditions = usePurchaseStore((state) => state.filterConditions);
  const filterCaseSensitive = usePurchaseStore((state) => state.filterCaseSensitive);
  const getFilteredPurchases = usePurchaseStore((state) => state.getFilteredData);
  const getSortedPurchases = usePurchaseStore((state) => state.getSortedData);

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
    return getFilteredPurchases(storeData);
  }, [storeData, getFilteredPurchases, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedPurchases = useMemo(() => {
    return getSortedPurchases(filteredPurchases);
  }, [filteredPurchases, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadPurchases) {
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
            onAddClick={
              canCreatePurchases ? () => router.push(router.pathname + "/add") : undefined
            }
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
                  icons: [Currency, Plus, Currency],
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
          loadingSave={loadingSavePurchase}
        >
          <PurchaseForm
            formHtmlId={"purchase-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionablePurchase(null);
              setLoadingSavePurchase(false);
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

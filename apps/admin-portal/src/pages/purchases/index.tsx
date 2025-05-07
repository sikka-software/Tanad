import { GetStaticProps } from "next";
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

import PurchaseCard from "@/purchase/purchase.card";
import { PurchaseForm } from "@/purchase/purchase.form";
import {
  usePurchases,
  useBulkDeletePurchases,
  useDuplicatePurchase,
  useUpdatePurchase,
} from "@/purchase/purchase.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/purchase/purchase.options";
import usePurchaseStore from "@/purchase/purchase.store";
import PurchasesTable from "@/purchase/purchase.table";
import { Purchase, PurchaseUpdateData } from "@/purchase/purchase.type";

import useUserStore from "@/stores/use-user-store";

export default function PurchasesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadPurchases = useUserStore((state) => state.hasPermission("purchases.read"));
  const canCreatePurchases = useUserStore((state) => state.hasPermission("purchases.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionablePurchase, setActionablePurchase] = useState<PurchaseUpdateData | null>(null);
  const [displayData, setDisplayData] = useState<Purchase[]>([]);

  const loadingSavePurchase = usePurchaseStore((state) => state.isLoading);
  const setLoadingSavePurchase = usePurchaseStore((state) => state.setIsLoading);
  const viewMode = usePurchaseStore((state) => state.viewMode);
  const isDeleteDialogOpen = usePurchaseStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = usePurchaseStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = usePurchaseStore((state) => state.selectedRows);
  const setSelectedRows = usePurchaseStore((state) => state.setSelectedRows);
  const clearSelection = usePurchaseStore((state) => state.clearSelection);
  const sortRules = usePurchaseStore((state) => state.sortRules);
  const sortCaseSensitive = usePurchaseStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = usePurchaseStore((state) => state.sortNullsFirst);
  const searchQuery = usePurchaseStore((state) => state.searchQuery);
  const filterConditions = usePurchaseStore((state) => state.filterConditions);
  const filterCaseSensitive = usePurchaseStore((state) => state.filterCaseSensitive);
  const getFilteredPurchases = usePurchaseStore((state) => state.getFilteredData);
  const getSortedPurchases = usePurchaseStore((state) => state.getSortedData);
  const setViewMode = usePurchaseStore((state) => state.setViewMode);

  const { data: purchases, isLoading: loadingFetchPurchases, error } = usePurchases();
  const { mutate: duplicatePurchase } = useDuplicatePurchase();
  const { mutateAsync: deletePurchases, isPending: isDeleting } = useBulkDeletePurchases();
  const { mutate: updatePurchase } = useUpdatePurchase();
  const { createDeleteHandler } = useDeleteHandler();

  useEffect(() => {
    if (purchases) {
      setDisplayData(purchases);
    } else {
      setDisplayData([]);
    }
  }, [purchases]);

  const { handleAction: onActionClicked } = useDataTableActions({
    data: displayData,
    setSelectedRows,
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
      setDisplayData((current) => current.filter((row) => !selectedRows.includes(row.id)));
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredPurchases = useMemo(() => {
    return getFilteredPurchases(displayData);
  }, [displayData, getFilteredPurchases, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedPurchases = useMemo(() => {
    return getSortedPurchases(filteredPurchases);
  }, [filteredPurchases, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadPurchases) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Purchases.title")} description={t("Purchases.description")} />
      <DataPageLayout>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={usePurchaseStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Purchases.title")}
            onAddClick={
              canCreatePurchases ? () => router.push(router.pathname + "/add") : undefined
            }
            createLabel={t("Purchases.create_new")}
            searchPlaceholder={t("Purchases.search_purchases")}
            count={displayData?.length}
            hideOptions={displayData?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <PurchasesTable
              data={sortedPurchases}
              isLoading={loadingFetchPurchases}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <DataModelList
                data={sortedPurchases}
                isLoading={loadingFetchPurchases}
                error={error as Error | null}
                emptyMessage={t("Purchases.no_purchases_found")}
                renderItem={(purchase) => <PurchaseCard key={purchase.id} purchase={purchase} />}
                gridCols="3"
              />
            </div>
          ) : null}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Purchases.add_new")}
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
            defaultValues={actionablePurchase as Purchase}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Purchases.confirm_delete")}
          description={t("Purchases.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

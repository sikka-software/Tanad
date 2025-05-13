import useInvoiceColumns from "@root/src/modules/invoice/invoice.columns";
import { InvoiceForm } from "@root/src/modules/invoice/invoice.form";
import { createModuleStoreHooks } from "@root/src/utils/module-hooks";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import InvoiceCard from "@/invoice/invoice.card";
import { useInvoices, useBulkDeleteInvoices, useDuplicateInvoice } from "@/invoice/invoice.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/invoice/invoice.options";
import useInvoiceStore from "@/invoice/invoice.store";
import InvoicesTable from "@/invoice/invoice.table";

import { InvoiceUpdateData } from "@/modules/invoice/invoice.type";

export default function InvoicesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useInvoiceColumns();

  const moduleHooks = createModuleStoreHooks(useInvoiceStore, "invoices");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<InvoiceUpdateData | null>(null);
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

  const { data: invoices, isLoading, error } = useInvoices();
  const { mutateAsync: deleteInvoices, isPending: isDeleting } = useBulkDeleteInvoices();
  const { mutate: duplicateInvoice } = useDuplicateInvoice();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: invoices,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateInvoice,
    previewAction: (id: string) => {
      window.open(`/pay/${id}`, "_blank");
    },
    moduleName: "Invoices",
  });

  const handleConfirmDelete = createDeleteHandler(deleteInvoices, {
    loading: "Invoices.loading.delete",
    success: "Invoices.success.delete",
    error: "Invoices.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useInvoiceStore((state) => state.data) || [];
  const setData = useInvoiceStore((state) => state.setData);

  useEffect(() => {
    if (invoices && setData) {
      setData(invoices);
    }
  }, [invoices, setData]);

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
      <CustomPageMeta title={t("Invoices.title")} description={t("Invoices.description")} />
      <DataPageLayout count={invoices?.length} itemsText={t("Pages.Invoices.title")}>
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
            store={useInvoiceStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Invoices.title")}
            onAddClick={canCreate ? () => router.push("/invoices/add") : undefined}
            createLabel={t("Pages.Invoices.add")}
            searchPlaceholder={t("Pages.Invoices.search")}
            hideOptions={invoices?.length === 0}
            id="invoices-table"
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
            <InvoicesTable
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
                emptyMessage={t("Invoices.no_invoices_found")}
                addFirstItemMessage={t("Invoices.add_first_invoice")}
                renderItem={(invoice) => <InvoiceCard invoice={invoice} />}
                gridCols="2"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Invoices.edit") : t("Pages.Invoices.add")}
          formId="invoice-form"
          loadingSave={loadingSave}
        >
          <InvoiceForm
            formHtmlId={"invoice-form"}
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
          title={t("Invoices.confirm_delete", { count: selectedRows.length })}
          description={t("Invoices.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

InvoicesPage.messages = [
  "Notes",
  "Pages",
  "Clients",
  "Companies",
  "Invoices",
  "Forms",
  "General",
  "Products",
  "ProductsFormSection",
];
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        InvoicesPage.messages,
      ),
    },
  };
};

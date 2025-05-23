import { pick } from "lodash";
import { File, Plus } from "lucide-react";
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

import InvoiceCard from "@/invoice/invoice.card";
import useInvoiceColumns from "@/invoice/invoice.columns";
import { InvoiceForm } from "@/invoice/invoice.form";
import { useBulkDeleteInvoices, useDuplicateInvoice, useInvoices } from "@/invoice/invoice.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/invoice/invoice.options";
import useInvoiceStore from "@/invoice/invoice.store";
import InvoicesTable from "@/invoice/invoice.table";
import { Invoice, InvoiceUpdateData } from "@/invoice/invoice.type";

export default function InvoicesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useInvoiceColumns();

  const moduleHooks = createModuleStoreHooks(useInvoiceStore, "invoices");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<InvoiceUpdateData | null>(null);

  // Convert Invoice to InvoiceUpdateData (handling zatca_enabled null to undefined)
  const handleSetActionableItem = (item: Invoice | null) => {
    if (!item) {
      setActionableItem(null);
      return;
    }

    const updateData: InvoiceUpdateData = {
      ...item,
      zatca_enabled: item.zatca_enabled === null ? undefined : item.zatca_enabled,
    };
    setActionableItem(updateData);
  };

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
    setActionableItem: handleSetActionableItem,
    duplicateMutation: duplicateInvoice,
    previewAction: (id: string) => {
      // window.open(`/pay/${id}`, "_blank");
      window.open(`/invoices/${id}`, "_blank");
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
        title={t("Pages.Invoices.title")}
        description={t("Pages.Invoices.description")}
      />
      <DataPageLayout count={invoices?.length} itemsText={t("Pages.Invoices.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useInvoiceStore} isDeleting={isDeleting} />
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
          />
        )}

        <div>
          {viewMode === "table" ? (
            <InvoicesTable
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
                  title: t("Invoices.create_first.title"),
                  description: t("Invoices.create_first.description"),
                  add: t("Pages.Invoices.add"),
                  icons: [File, Plus, File],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onActionClicked={onActionClicked}
                  />
                )}
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
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

InvoicesPage.messages = [
  "Metadata",
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      InvoicesPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import InvoiceCard from "@/modules/invoice/invoice.card";
import { useInvoices, useBulkDeleteInvoices } from "@/modules/invoice/invoice.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/modules/invoice/invoice.options";
import { useInvoiceStore } from "@/modules/invoice/invoice.store";
import InvoicesTable from "@/modules/invoice/invoice.table";

export default function InvoicesPage() {
  const t = useTranslations();

  const viewMode = useInvoiceStore((state) => state.viewMode);
  const isDeleteDialogOpen = useInvoiceStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useInvoiceStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useInvoiceStore((state) => state.selectedRows);
  const setSelectedRows = useInvoiceStore((state) => state.setSelectedRows);
  const clearSelection = useInvoiceStore((state) => state.clearSelection);
  const sortRules = useInvoiceStore((state) => state.sortRules);
  const sortCaseSensitive = useInvoiceStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useInvoiceStore((state) => state.sortNullsFirst);
  const searchQuery = useInvoiceStore((state) => state.searchQuery);
  const filterConditions = useInvoiceStore((state) => state.filterConditions);
  const filterCaseSensitive = useInvoiceStore((state) => state.filterCaseSensitive);
  const getFilteredInvoices = useInvoiceStore((state) => state.getFilteredInvoices);
  const getSortedInvoices = useInvoiceStore((state) => state.getSortedInvoices);

  const { data: invoices, isLoading, error } = useInvoices();
  const { mutate: deleteInvoices, isPending: isDeleting } = useBulkDeleteInvoices();

  const filteredInvoices = useMemo(() => {
    return getFilteredInvoices(invoices || []);
  }, [invoices, getFilteredInvoices, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedInvoices = useMemo(() => {
    return getSortedInvoices(filteredInvoices);
  }, [filteredInvoices, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    try {
      await deleteInvoices(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete invoices:", error);
          toast.error(t("Invoices.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete invoices:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Invoices.title")} description={t("Invoices.description")} />
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
            store={useInvoiceStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Invoices.title")}
            createHref="/invoices/add"
            createLabel={t("Invoices.create_invoice")}
            searchPlaceholder={t("Invoices.search_invoices")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <InvoicesTable
              data={sortedInvoices}
              isLoading={isLoading}
              error={error as Error | null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedInvoices}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Invoices.no_invoices_found")}
                addFirstItemMessage={t("Invoices.add_first_invoice")}
                renderItem={(invoice) => <InvoiceCard invoice={invoice} />}
                gridCols="2"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
          title={t("Invoices.delete.title")}
          description={t("Invoices.delete.description", { count: selectedRows.length })}
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

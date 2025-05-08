import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

import { InvoiceForm } from "@/modules/invoice/invoice.form";
import { InvoiceUpdateData } from "@/modules/invoice/invoice.type";
import useUserStore from "@/stores/use-user-store";

export default function InvoicesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadInvoices = useUserStore((state) => state.hasPermission("invoices.read"));
  const canCreateInvoices = useUserStore((state) => state.hasPermission("invoices.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const [actionableInvoice, setActionableInvoice] = useState<InvoiceUpdateData | null>(null);

  const loadingSaveInvoice = useInvoiceStore((state) => state.isLoading);
  const setLoadingSaveInvoice = useInvoiceStore((state) => state.setIsLoading);
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
  const getFilteredInvoices = useInvoiceStore((state) => state.getFilteredData);
  const getSortedInvoices = useInvoiceStore((state) => state.getSortedData);

  const { data: invoices, isLoading, error } = useInvoices();
  const { mutateAsync: deleteInvoices, isPending: isDeleting } = useBulkDeleteInvoices();
  const { mutate: duplicateInvoice } = useDuplicateInvoice();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: invoices as InvoiceUpdateData[],
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableInvoice as (item: InvoiceUpdateData | null) => void,
    duplicateMutation: duplicateInvoice,
    moduleName: "Invoices",
    previewAction: (id: string) => {
      window.open(`/pay/${id}`, "_blank");
    },
  });

  const handleConfirmDelete = createDeleteHandler(deleteInvoices, {
    loading: "Invoices.loading.delete",
    success: "Invoices.success.delete",
    error: "Invoices.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredInvoices = useMemo(() => {
    return getFilteredInvoices(invoices || []);
  }, [invoices, getFilteredInvoices, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedInvoices = useMemo(() => {
    return getSortedInvoices(filteredInvoices);
  }, [filteredInvoices, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadInvoices) {
    return <NoPermission />;
  }
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
            title={t("Pages.Invoices.title")}
            onAddClick={canCreateInvoices ? () => router.push("/invoices/add") : undefined}
            createLabel={t("Pages.Invoices.add")}
            searchPlaceholder={t("Pages.Invoices.search")}
            count={invoices?.length}
            hideOptions={invoices?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <InvoicesTable
              data={sortedInvoices}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
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

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Invoices.edit_invoice")}
          formId="invoice-form"
          loadingSave={loadingSaveInvoice}
        >
          <InvoiceForm
            formHtmlId={"invoice-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableInvoice(null);
              setLoadingSaveInvoice(false);
              toast.success(t("General.successful_operation"), {
                description: t("Invoices.success.update"),
              });
            }}
            defaultValues={actionableInvoice}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Invoices.delete.title")}
          description={t("Invoices.delete.description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

InvoicesPage.messages = ["Notes", "Pages", "Invoices", "General"];
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        InvoicesPage.messages,
      ),
    },
  };
};

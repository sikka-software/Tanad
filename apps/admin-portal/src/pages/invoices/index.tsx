import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import InvoiceCard from "@/modules/invoice/invoice.card";
import { useInvoices } from "@/modules/invoice/invoice.hooks";
import InvoicesTable from "@/modules/invoice/invoice.table";
import { Invoice } from "@/modules/invoice/invoice.type";

export default function InvoicesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: invoices, isLoading, error } = useInvoices();

  const filteredInvoices = Array.isArray(invoices)
    ? invoices.filter(
        (invoice: Invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.client?.company?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          invoice.client?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <div>
      <CustomPageMeta title={t("Invoices.title")} description={t("Invoices.description")} />
      <DataPageLayout>
        <PageSearchAndFilter
          title={t("Invoices.title")}
          createHref="/invoices/add"
          createLabel={t("Invoices.create_invoice")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Invoices.search_invoices")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div>
          {viewMode === "table" ? (
            <InvoicesTable
              data={filteredInvoices}
              isLoading={isLoading}
              error={error as Error | null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredInvoices}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Invoices.no_invoices_found")}
                addFirstItemMessage={t("Invoices.add_first_invoice")}
                renderItem={(invoice: Invoice) => <InvoiceCard invoice={invoice} />}
                gridCols="2"
              />
            </div>
          )}
        </div>
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

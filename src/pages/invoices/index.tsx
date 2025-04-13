import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { format } from "date-fns";

import DataPageLayout from "@/components/layouts/data-page-layout";
import InvoicesTable from "@/components/tables/invoices-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/types/invoice.type";

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function InvoicesPage() {
  const t = useTranslations("Invoices");
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

  const renderInvoice = (invoice: Invoice) => (
    <Card key={invoice.id} className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("invoice_number", { number: invoice.invoiceNumber })}
          </h3>
          <p className="text-sm text-gray-500">{invoice.client?.company}</p>
        </div>
        <Badge className={getStatusColor(invoice.status)}>
          {t(`status.${invoice.status.toLowerCase()}`)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("issue_date")}</span>
            <span className="text-sm">{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("due_date")}</span>
            <span className="text-sm">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("amount")}</span>
            <span className="text-lg font-bold">${invoice.total.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <p className="text-sm text-gray-500">
              {invoice.client?.name} • {invoice.client?.email}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pay/${invoice.id}`} target="_blank">
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/invoices/add"
        createLabel={t("create_invoice")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_invoices")}
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
              emptyMessage={t("no_invoices_found")}
              addFirstItemMessage={t("add_first_invoice")}
              renderItem={renderInvoice}
              gridCols="2"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

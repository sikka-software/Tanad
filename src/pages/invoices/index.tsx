import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { format } from "date-fns";

import { Invoice } from "@/api/invoices";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useInvoices } from "@/hooks/useInvoices";

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
  const { data: invoices, isLoading, error } = useInvoices();

  const renderInvoice = (invoice: Invoice) => (
    <Card key={invoice.id} className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("invoice_number", { number: invoice.invoice_number })}</h3>
          <p className="text-sm text-gray-500">{invoice.client.company}</p>
        </div>
        <Badge className={getStatusColor(invoice.status)}>
          {t(`status.${invoice.status.toLowerCase()}`)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("issue_date")}</span>
            <span className="text-sm">{format(new Date(invoice.issue_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("due_date")}</span>
            <span className="text-sm">{format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("amount")}</span>
            <span className="text-lg font-bold">${invoice.total.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <p className="text-sm text-gray-500">
              {invoice.client.name} • {invoice.client.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto space-y-4">
      <PageTitle
        title={t("title")}
        createButtonLink="/invoices/add"
        createButtonText={t("create_invoice")}
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={invoices}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("no_invoices_found")}
          renderItem={renderInvoice}
          gridCols="2"
        />
      </div>
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

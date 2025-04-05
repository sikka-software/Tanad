import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import PageTitle from "@/components/ui/page-title";
import { GetStaticProps } from "next";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/api/invoices";

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
  const { data: invoices = [], isLoading, error } = useInvoices();

  if (isLoading) {
    return (
      <div className="mx-auto space-y-4">
        <PageTitle
          title={t("title")}
          createButtonLink="/invoices/add"
          createButtonText={t("create_invoice")}
          createButtonDisabled
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : "An error occurred while fetching invoices"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <PageTitle
        title={t("title")}
        createButtonLink="/invoices/add"
        createButtonText={t("create_invoice")}
      />

      <div className="p-4">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("no_invoices_found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((invoice: Invoice) => (
              <Card
                key={invoice.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Invoice #{invoice.invoice_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {invoice.client.company}
                    </p>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Issue Date</span>
                      <span className="text-sm">
                        {format(new Date(invoice.issue_date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Due Date</span>
                      <span className="text-sm">
                        {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-lg font-bold">
                        ${invoice.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500">
                        {invoice.client.name} • {invoice.client.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

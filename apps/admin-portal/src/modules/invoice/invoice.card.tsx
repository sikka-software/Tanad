import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Invoice } from "@/invoice/invoice.type";

function getInvoiceStatusColor(status: string): string {
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

const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  const t = useTranslations("Invoices");
  return (
    <Card key={invoice.id} className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("invoice_number", { number: invoice.invoice_number })}
          </h3>
          <p className="text-sm text-gray-500">{invoice.client?.company}</p>
        </div>
        <Badge className={getInvoiceStatusColor(invoice.status)}>
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
};

export default InvoiceCard;

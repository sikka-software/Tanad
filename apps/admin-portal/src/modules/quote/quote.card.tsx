import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";

import { Quote } from "@/quote/quote.type";

function getQuoteStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    case "draft":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

const QuoteCard = ({ quote }: { quote: Quote }) => {
  const t = useTranslations("Quotes");
  return (
    <Card key={quote.id} className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("quote_number", { number: quote.quote_number })}
          </h3>
          <p className="text-sm text-gray-500">{quote.client?.company}</p>
        </div>
        <Badge className={getQuoteStatusColor(quote.status)}>
          {t(`status.${quote.status.toLowerCase()}`)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("issue_date")}</span>
            <span className="text-sm">{format(new Date(quote.issue_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("expiry_date")}</span>
            <span className="text-sm">{format(new Date(quote.expiry_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("amount")}</span>
            <span className="text-lg font-bold">
              $
              {(
                (quote.subtotal || 0) +
                ((quote.subtotal || 0) * (quote.tax_rate || 0)) / 100
              ).toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-2">
            <p className="text-sm text-gray-500">
              {quote.client?.name} • {quote.client?.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;

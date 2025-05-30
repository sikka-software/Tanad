import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { useUpdateQuote } from "@/quote/quote.hooks";
import useQuoteStore from "@/quote/quote.store";
import { Quote, QuoteStatus, QuoteStatusProps, QuoteUpdateData } from "@/quote/quote.type";

const QuoteCard = ({
  quote,
  onActionClicked,
}: {
  quote: Quote;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateQuote } = useUpdateQuote();

  const currency = useAppCurrencySymbol({ sar: { className: "size-4" } }).symbol;

  const data = useQuoteStore((state) => state.data);
  const setData = useQuoteStore((state) => state.setData);

  const handleEdit = createHandleEdit<Quote, QuoteUpdateData>(setData, updateQuote, data);

  return (
    <ModuleCard
      id={quote.id}
      parentTranslationKey="Quotes"
      title={quote.quote_number}
      subtitle={quote.client?.company || ""}
      currentStatus={quote.status as QuoteStatusProps}
      statuses={Object.values(QuoteStatus) as QuoteStatusProps[]}
      onStatusChange={(status: QuoteStatusProps) => handleEdit(quote.id, "status", status)}
      onEdit={() => onActionClicked("edit", quote.id)}
      onDelete={() => onActionClicked("delete", quote.id)}
      onDuplicate={() => onActionClicked("duplicate", quote.id)}
    >
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Quotes.form.issue_date.label")}</span>
          <span className="text-sm">{format(new Date(quote.issue_date), "MMM dd, yyyy")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Quotes.form.expiry_date.label")}</span>
          <span className="text-sm">{format(new Date(quote.expiry_date), "MMM dd, yyyy")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Quotes.form.total.label")}</span>
          <span className="money text-lg font-bold">
            {MoneyFormatter(
              (quote.subtotal || 0) + ((quote.subtotal || 0) * (quote.tax_rate || 0)) / 100 || 0,
            )}{" "}
            {currency}
          </span>
        </div>
        <div className="border-t pt-2">
          <p className="text-sm text-gray-500">
            {quote.client?.name} • {quote.client?.email}
          </p>
        </div>
      </div>
    </ModuleCard>
  );
};

export default QuoteCard;

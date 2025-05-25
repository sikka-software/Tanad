import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useAppCurrencySymbol } from "@/lib/currency-utils";
import { useFormatDate } from "@/utils/date-utils";

import { Quote, QuoteStatus } from "@/quote/quote.type";

const useQuoteColumns = (handleEdit?: (id: string, field: string, value: string) => void) => {
  const t = useTranslations();
  const currency = useAppCurrencySymbol().symbol;

  const columns: ExtendedColumnDef<Quote>[] = [
    {
      accessorKey: "quote_number",
      header: t("Quotes.form.quote_number.label"),
    },
    //client.name
    {
      enableEditing: false,
      accessorKey: "client.name",
      id: "client.name",
      header: t("Quotes.form.client.label"),
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return "N/A";
        // Display name and email if available
        return (
          <div>
            <div className="text-sm font-medium">{client.name || "-"}</div>
            {/* {client.email && <div className="text-muted-foreground text-xs">{client.email}</div>} */}
          </div>
        );
      },
    },
    {
      accessorKey: "issue_date",
      header: t("Quotes.form.issue_date.label"),
      cell: ({ row }) => useFormatDate(row.original.issue_date),
    },
    {
      accessorKey: "expiry_date",
      header: t("Quotes.form.expiry_date.label"),
      cell: ({ row }) => useFormatDate(row.original.expiry_date),
    },
    {
      accessorKey: "subtotal",
      header: t("Quotes.form.subtotal.label"),
      cell: ({ row }) => {
        return (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(row.getValue("subtotal"))}
            {currency}
          </span>
        );
      },
    },
    {
      accessorKey: "tax_rate",
      header: t("Quotes.form.tax_rate.label"),
      cell: (props: CellContext<Quote, unknown>) => `${props.row.original.tax_rate || 0}%`,
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      header: t("Quotes.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={QuoteStatus.map((status) => ({
            label: t(`Quotes.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default useQuoteColumns;

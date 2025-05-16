import { CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Quote, QuoteStatus } from "@/quote/quote.type";

const useQuoteColumns = (handleEdit?: (id: string, field: string, value: string) => void) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Quote>[] = [
    {
      accessorKey: "quote_number",
      header: t("Quotes.form.quote_number.label"),
      validationSchema: z.string().min(1, t("Quotes.form.quote_number.required")),
    },
    {
      accessorKey: "client_id",
      header: t("Quotes.form.client.label"),
      cell: (props: CellContext<Quote, unknown>) => props.row.original.client?.company || "N/A",
    },
    {
      accessorKey: "issue_date",
      header: t("Quotes.form.issue_date.label"),
      cell: (props: CellContext<Quote, unknown>) => {
        try {
          return format(new Date(props.row.original.issue_date), "MMM dd, yyyy");
        } catch (e) {
          return t("General.invalid_date");
        }
      },
    },
    {
      accessorKey: "expiry_date",
      header: t("Quotes.form.expiry_date.label"),
      cell: (props: CellContext<Quote, unknown>) => {
        try {
          return format(new Date(props.row.original.expiry_date), "MMM dd, yyyy");
        } catch (e) {
          return t("General.invalid_date");
        }
      },
    },
    {
      accessorKey: "subtotal",
      header: t("Quotes.form.subtotal.label"),
      validationSchema: z.number().min(0, t("Quotes.form.subtotal.required")),
      cell: (props: CellContext<Quote, unknown>) =>
        `$${Number(props.row.original.subtotal || 0).toFixed(2)}`,
    },
    {
      accessorKey: "tax_rate",
      header: t("Quotes.form.tax_rate.label"),
      validationSchema: z.number().min(0, t("Quotes.form.tax_rate.required")),
      cell: (props: CellContext<Quote, unknown>) => `${props.row.original.tax_rate || 0}%`,
    },

    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,

      header: t("Metadata.updated_at.label"),
      validationSchema: z.string().min(1, t("Metadata.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      header: t("Quotes.form.status.label"),
      validationSchema: z.enum(QuoteStatus),
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

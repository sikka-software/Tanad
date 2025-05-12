import { CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Quote } from "./quote.type";

const useQuoteColumns = () => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Quote>[] = [
    {
      accessorKey: "quote_number",
      header: t("Quotes.form.quote_number"),
      validationSchema: z.string().min(1, t("Quotes.form.quote_number.required")),
    },
    {
      accessorKey: "client_id",
      header: t("Companies.title"),
      cell: (props: CellContext<Quote, unknown>) => props.row.original.client?.company || "N/A",
    },
    {
      accessorKey: "issue_date",
      header: t("Quotes.form.issue_date"),
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
      header: t("Quotes.form.expiry_date"),
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
      header: t("Quotes.form.subtotal"),
      validationSchema: z.number().min(0, t("Quotes.form.subtotal.required")),
      cell: (props: CellContext<Quote, unknown>) =>
        `$${Number(props.row.original.subtotal || 0).toFixed(2)}`,
    },
    {
      accessorKey: "tax_rate",
      header: t("Quotes.form.tax_rate"),
      validationSchema: z.number().min(0, t("Quotes.form.tax_rate.required")),
      cell: (props: CellContext<Quote, unknown>) => `${props.row.original.tax_rate || 0}%`,
    },
    {
      accessorKey: "status",
      header: t("Quotes.form.status.title"),
      validationSchema: z.enum(["draft", "sent", "accepted", "rejected", "expired"]),
    },
  ];

  return columns;
};

export default useQuoteColumns;

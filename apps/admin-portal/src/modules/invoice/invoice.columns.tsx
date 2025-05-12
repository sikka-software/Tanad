import { MoneyFormatter } from "@root/src/components/ui/currency-input";
import { getCurrencySymbol } from "@root/src/lib/currency-utils";
import useUserStore from "@root/src/stores/use-user-store";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Invoice } from "@/invoice/invoice.type";

const useInvoiceColumns = () => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice_number",
      header: t("Invoices.form.invoice_number.label"),
      validationSchema: z.string().min(1, t("Invoices.form.invoice_number.required")),
    },
    {
      enableEditing: false,
      accessorKey: "client.name",
      id: "client.name",
      header: t("Invoices.form.client.label"),
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
      enableEditing: false,
      accessorKey: "issue_date",
      header: t("Invoices.form.issue_date.label"),
      validationSchema: z.string().min(1, t("Invoices.form.issue_date.required")),
      cell: ({ row }) => row.original.issue_date,
    },
    {
      accessorKey: "due_date",
      header: t("Invoices.form.due_date.label"),
      validationSchema: z.string().min(1, t("Invoices.form.due_date.required")),
      cell: ({ row }) => row.original.due_date,
    },
    {
      enableEditing: false,
      accessorKey: "total",
      header: t("Invoices.form.total.label"),
      validationSchema: z.number().min(0, t("Invoices.form.total.required")),
      cell: ({ row }) => {
        return (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(row.getValue("total"))}
            {getCurrencySymbol(currency || "sar").symbol}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("Invoices.form.status.label"),
      validationSchema: z.string().min(1, t("Invoices.form.status.required")),
      cell: ({ row }) => {
        const status = row.original.status;
        return <div className="text-sm font-medium">{t(`Invoices.form.status.${status}`)}</div>;
      },
    },
  ];

  return columns;
};

export default useInvoiceColumns;

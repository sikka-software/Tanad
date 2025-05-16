import { useTranslations } from "next-intl";
import { z } from "zod";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CodeCell from "@/tables/code-cell";
import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { Invoice } from "@/invoice/invoice.type";
import { InvoiceStatus } from "@/invoice/invoice.type";

import useUserStore from "@/stores/use-user-store";

const useInvoiceColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Invoice>[] = [
    //invoice_number
    {
      noPadding: true,
      accessorKey: "invoice_number",
      header: t("Invoices.form.invoice_number.label"),
      validationSchema: z.string().min(1, t("Invoices.form.invoice_number.required")),
      cell: ({ getValue, row }) => (
        <CodeCell
          onChange={(e) => handleEdit?.(row.id, "invoice_number", e.target.value)}
          onRandom={() => {
            const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let randomCode = "";
            for (let i = 0; i < 5; i++) {
              randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            handleEdit?.(row.id, "invoice_number", `INV-${randomCode}`);
          }}
          onSerial={() => {
            const paddedNumber = String(row.index + 1).padStart(4, "0");
            handleEdit?.(row.id, "invoice_number", `INV-${paddedNumber}`);
          }}
          code={getValue() as string}
          onCodeChange={() => console.log("changing")}
        />
      ),
    },
    //client.name
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
    //issue_date
    {
      enableEditing: false,
      accessorKey: "issue_date",
      header: t("Invoices.form.issue_date.label"),
      validationSchema: z.string().min(1, t("Invoices.form.issue_date.required")),
      cell: ({ row }) => row.original.issue_date,
    },
    //due_date
    {
      enableEditing: false,
      accessorKey: "due_date",
      header: t("Invoices.form.due_date.label"),
      validationSchema: z.string().min(1, t("Invoices.form.due_date.required")),
      cell: ({ row }) => row.original.due_date,
    },
    //total
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
    //status
    {
      accessorKey: "status",
      header: t("Invoices.form.status.label"),
      validationSchema: z.string().min(1, t("Invoices.form.status.required")),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={InvoiceStatus.map((status) => ({
            label: t(`Invoices.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default useInvoiceColumns;

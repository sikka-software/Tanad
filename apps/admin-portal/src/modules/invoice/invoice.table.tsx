import React from "react";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/ui/button";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Invoice } from "@/modules/invoice/invoice.type";

import { useInvoicesStore } from "@/modules/invoice/invoice.store";

const invoiceNumberSchema = z.string().min(1, "Required");
const issueDateSchema = z.date();
const dueDateSchema = z.date();
const totalSchema = z.number().min(0, "Must be >= 0");
const statusSchema = z.enum(["paid", "pending", "overdue"]);

interface InvoicesTableProps {
  data: Invoice[];
  isLoading?: boolean;
  error?: Error | null;
}

const InvoicesTable = ({ data, isLoading, error }: InvoicesTableProps) => {
  const t = useTranslations("Invoices");
  const { updateInvoice } = useInvoicesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    let processedValue = value;
    if (columnId === "issueDate" || columnId === "dueDate") {
      processedValue = new Date(value as string).toISOString();
    }
    await updateInvoice(rowId, { [columnId]: processedValue });
  };

  const columns: ExtendedColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: t("form.invoice_number.label"),
      validationSchema: invoiceNumberSchema,
    },
    {
      accessorKey: "client.company",
      header: t("form.client.label"),
      cell: ({ row }) => row.original.client?.company || "N/A",
    },
    {
      accessorKey: "issueDate",
      header: t("form.issue_date.label"),
      validationSchema: issueDateSchema,
      cell: ({ row }) => format(new Date(row.original.issueDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: t("form.due_date.label"),
      validationSchema: dueDateSchema,
      cell: ({ row }) => format(new Date(row.original.dueDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "total",
      header: t("form.total.label"),
      validationSchema: totalSchema,
      cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: t("form.status.label"),
      validationSchema: statusSchema,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pay/${invoice.id}`} target="_blank">
                {t("actions.preview")}
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default InvoicesTable;

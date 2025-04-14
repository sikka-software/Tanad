import React from "react";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import { useUpdateInvoice } from "@/hooks/useInvoices";
import { Invoice } from "@/types/invoice.type";

import ErrorComponent from "../ui/error-component";
import TableSkeleton from "../ui/table-skeleton";

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
  const { mutate: updateInvoice } = useUpdateInvoice();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    let processedValue = value;
    if (columnId === "issueDate" || columnId === "dueDate") {
      processedValue = new Date(value as string).toISOString();
    }

    await updateInvoice({ id: rowId, invoice: { [columnId]: processedValue } });
  };

  const columns: ExtendedColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
    },
    {
      accessorKey: "client.company",
      header: "Client",
      cell: ({ row }) => row.original.client?.company || "N/A",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => format(new Date(row.original.issueDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => format(new Date(row.original.dueDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pay/${invoice.id}`} target="_blank">
                Preview
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

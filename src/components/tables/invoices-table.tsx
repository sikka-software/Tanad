import React from "react";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateInvoice } from "@/hooks/useInvoices";
import { Invoice } from "@/types/invoice.type";

const invoiceNumberSchema = z.string().min(1, "Required");
const issueDateSchema = z.date();
const dueDateSchema = z.date();
const totalSchema = z.number().min(0, "Must be >= 0");
const statusSchema = z.enum(["paid", "pending", "overdue"]);

const columns: ColumnDef<Invoice>[] = [
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

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        {t("error_loading_invoices")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default InvoicesTable;

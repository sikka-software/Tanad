import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Invoice } from "@/types/invoice.type";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useInvoicesStore } from "@/stores/invoices.store";

const invoiceNumberSchema = z.string().min(1, "Required");
const issueDateSchema = z.date();
const dueDateSchema = z.date();
const totalSchema = z.number().min(0, "Must be >= 0");
const statusSchema = z.enum(["paid", "pending", "overdue"]);

const columns: ColumnDef<Invoice>[] = [
  { 
    accessorKey: "invoice_number", 
    header: "Invoice #",
    validationSchema: invoiceNumberSchema
  },
  { 
    accessorKey: "client.company", 
    header: "Client",
    cell: ({ row }) => row.original.client?.company || "N/A"
  },
  { 
    accessorKey: "issue_date", 
    header: "Issue Date",
    cell: ({ row }) => format(new Date(row.original.issue_date), "MMM dd, yyyy"),
    validationSchema: issueDateSchema
  },
  { 
    accessorKey: "due_date", 
    header: "Due Date",
    cell: ({ row }) => format(new Date(row.original.due_date), "MMM dd, yyyy"),
    validationSchema: dueDateSchema
  },
  { 
    accessorKey: "total", 
    header: "Total",
    cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
    validationSchema: totalSchema
  },
  { 
    accessorKey: "status", 
    header: "Status",
    validationSchema: statusSchema
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
  const { updateInvoice } = useInvoicesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    let processedValue = value;
    if (columnId === "issue_date" || columnId === "due_date") {
      processedValue = new Date(value as string).toISOString();
    }
    
    await updateInvoice(rowId, { [columnId]: processedValue });
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
    return <div className="bg-red-800 rounded p-2 m-4 mb-0 text-center">
      {t("error_loading_invoices")}: {error.message}
    </div>;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default InvoicesTable; 
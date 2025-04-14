import React from "react";

import { type CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { z } from "zod";

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
import { useQuotesStore } from "@/stores/quotes.store";
import { Quote } from "@/types/quote.type";

const quoteNumberSchema = z.string().min(1, "Required");
const statusSchema = z.enum(["draft", "sent", "accepted", "rejected", "expired"]);
const subtotalSchema = z.number().min(0, "Must be >= 0");
const taxRateSchema = z.number().min(0, "Must be >= 0").max(100, "Must be <= 100");

const columns = [
  {
    accessorKey: "quote_number",
    header: "Quote Number",
    validationSchema: quoteNumberSchema,
  },
  {
    accessorKey: "client_id",
    header: "Company",
    cell: (props: CellContext<Quote, unknown>) => props.row.original.clients?.company || "N/A",
  },
  {
    accessorKey: "issue_date",
    header: "Issue Date",
    cell: (props: CellContext<Quote, unknown>) => {
      try {
        return format(new Date(props.row.original.issue_date), "MMM dd, yyyy");
      } catch (e) {
        return "Invalid Date";
      }
    },
  },
  {
    accessorKey: "expiry_date",
    header: "Expiry Date",
    cell: (props: CellContext<Quote, unknown>) => {
      try {
        return format(new Date(props.row.original.expiry_date), "MMM dd, yyyy");
      } catch (e) {
        return "Invalid Date";
      }
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    validationSchema: statusSchema,
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    validationSchema: subtotalSchema,
    cell: (props: CellContext<Quote, unknown>) =>
      `$${Number(props.row.original.subtotal || 0).toFixed(2)}`,
  },
  {
    accessorKey: "tax_rate",
    header: "Tax Rate (%)",
    validationSchema: taxRateSchema,
    cell: (props: CellContext<Quote, unknown>) => `${props.row.original.tax_rate || 0}%`,
  },
];

interface QuotesTableProps {
  data: Quote[];
  isLoading?: boolean;
  error?: Error | null;
}

const QuotesTable = ({ data, isLoading, error }: QuotesTableProps) => {
  const { updateQuote } = useQuotesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    // Don't allow editing of computed or relation fields
    if (columnId === "client_id") return;

    await updateQuote(rowId, { [columnId]: value });
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
        Error loading quotes: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default QuotesTable;

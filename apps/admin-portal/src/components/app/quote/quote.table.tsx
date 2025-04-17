import React from "react";

import { useTranslations } from "next-intl";

import { type CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Quote } from "@/types/quote.type";

import { useBulkDeleteQuotes } from "@/hooks/useQuotes";
import { useQuotesStore } from "@/stores/quotes.store";

const quoteNumberSchema = z.string().min(1, "Required");
const statusSchema = z.enum(["draft", "sent", "accepted", "rejected", "expired"]);
const subtotalSchema = z.number().min(0, "Must be >= 0");
const taxRateSchema = z.number().min(0, "Must be >= 0").max(100, "Must be <= 100");

interface QuotesTableProps {
  data: Quote[];
  isLoading?: boolean;
  error?: Error | null;
}

const QuotesTable = ({ data, isLoading, error }: QuotesTableProps) => {
  const { updateQuote, setSelectedRows, selectedRows } = useQuotesStore();
  const bulkDeleteQuotes = useBulkDeleteQuotes();
  const t = useTranslations();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    // Don't allow editing of computed or relation fields
    if (columnId === "client_id") return;

    await updateQuote(rowId, { [columnId]: value });
  };

  const handleSelectedRowsChange = (rows: Quote[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    // Only update if the selection has actually changed
    const currentSelection = new Set(selectedRows);
    const newSelection = new Set(newSelectedIds);

    if (
      newSelection.size !== currentSelection.size ||
      !Array.from(newSelection).every((id) => currentSelection.has(id))
    ) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error(t("Quotes.error.no_selection"));
      return;
    }

    try {
      await bulkDeleteQuotes.mutateAsync(selectedRows);
      toast.success(t("Quotes.success.bulk_delete"));
      setSelectedRows([]);
    } catch (error) {
      toast.error(t("Quotes.error.bulk_delete"));
    }
  };

  const columns: ExtendedColumnDef<Quote>[] = [
    {
      accessorKey: "quote_number",
      header: t("Quotes.quote_number"),
      validationSchema: quoteNumberSchema,
    },
    {
      accessorKey: "client_id",
      header: t("Companies.title"),
      cell: (props: CellContext<Quote, unknown>) => props.row.original.clients?.company || "N/A",
    },
    {
      accessorKey: "issue_date",
      header: t("Quotes.issue_date"),
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
      header: t("Quotes.expiry_date"),
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
      header: t("Quotes.status.title"),
      validationSchema: statusSchema,
    },
    {
      accessorKey: "subtotal",
      header: t("Quotes.subtotal"),
      validationSchema: subtotalSchema,
      cell: (props: CellContext<Quote, unknown>) =>
        `$${Number(props.row.original.subtotal || 0).toFixed(2)}`,
    },
    {
      accessorKey: "tax_rate",
      header: t("Quotes.tax_rate"),
      validationSchema: taxRateSchema,
      cell: (props: CellContext<Quote, unknown>) => `${props.row.original.tax_rate || 0}%`,
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

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleSelectedRowsChange}
      tableOptions={{
        state: {
          rowSelection,
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row) => row.id!,
        onRowSelectionChange: (updater) => {
          const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
          const selectedRows = data.filter((row) => newSelection[row.id!]);
          handleSelectedRowsChange(selectedRows);
        },
      }}
    />
  );
};

export default QuotesTable;

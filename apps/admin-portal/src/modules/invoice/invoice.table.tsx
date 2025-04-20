import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import { z } from "zod";

import { Button } from "@/ui/button";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useInvoiceStore } from "@/modules/invoice/invoice.store";
import { Invoice } from "@/modules/invoice/invoice.type";

const invoice_numberSchema = z.string().min(1, "Required");
const issue_dateSchema = z.date();
const due_dateSchema = z.date();
const totalSchema = z.number().min(0, "Must be >= 0");
const statusSchema = z.enum(["paid", "pending", "overdue"]);

interface InvoicesTableProps {
  data: Invoice[];
  isLoading?: boolean;
  error?: Error | null;
}

const InvoicesTable = ({ data, isLoading, error }: InvoicesTableProps) => {
  const t = useTranslations("Invoices");
  const { updateInvoice } = useInvoiceStore();
  const selectedRows = useInvoiceStore((state) => state.selectedRows);
  const setSelectedRows = useInvoiceStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice_number",
      header: t("form.invoice_number.label"),
      validationSchema: invoice_numberSchema,
    },
    {
      accessorKey: "client.company",
      header: t("form.client.label"),
      cell: ({ row }) => row.original.client?.company || "N/A",
    },
    {
      accessorKey: "issue_date",
      header: t("form.issue_date.label"),
      validationSchema: issue_dateSchema,
      cell: ({ row }) => format(new Date(row.original.issue_date), "MMM dd, yyyy"),
    },
    {
      accessorKey: "due_date",
      header: t("form.due_date.label"),
      validationSchema: due_dateSchema,
      cell: ({ row }) => format(new Date(row.original.due_date), "MMM dd, yyyy"),
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    let processedValue = value;
    if (columnId === "issue_date" || columnId === "due_date") {
      processedValue = new Date(value as string).toISOString();
    }
    await updateInvoice(rowId, { [columnId]: processedValue });
  };

  const handleRowSelectionChange = (rows: Invoice[]) => {
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

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const invoiceTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Invoice) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      tableOptions={invoiceTableOptions}
    />
  );
};

export default InvoicesTable;

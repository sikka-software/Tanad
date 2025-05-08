import { type CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateQuote } from "@/quote/quote.hooks";
import useQuotesStore from "@/quote/quote.store";
import { Quote, QuoteUpdateData } from "@/quote/quote.type";

import useUserStore from "@/stores/use-user-store";

const QuotesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Quote>) => {
  const t = useTranslations();
  const { mutateAsync: updateQuote } = useUpdateQuote();
  const setSelectedRows = useQuotesStore((state) => state.setSelectedRows);
  const selectedRows = useQuotesStore((state) => state.selectedRows);

  const canEditQuote = useUserStore((state) => state.hasPermission("quotes.update"));
  const canDuplicateQuote = useUserStore((state) => state.hasPermission("quotes.duplicate"));
  const canViewQuote = useUserStore((state) => state.hasPermission("quotes.view"));
  const canArchiveQuote = useUserStore((state) => state.hasPermission("quotes.archive"));
  const canDeleteQuote = useUserStore((state) => state.hasPermission("quotes.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "client_id") return;
    await updateQuote({ id: rowId, data: { [columnId]: value } as QuoteUpdateData });
  };

  const handleRowSelectionChange = (rows: Quote[]) => {
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

  const quoteTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Quote) => row.id!,
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
      enableRowSelection={true}
      enableRowActions={true}
      canEditAction={canEditQuote}
      canDuplicateAction={canDuplicateQuote}
      canViewAction={canViewQuote}
      canArchiveAction={canArchiveQuote}
      canDeleteAction={canDeleteQuote}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={quoteTableOptions}
      onActionClicked={onActionClicked}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default QuotesTable;

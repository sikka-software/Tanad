import { useTranslations } from "next-intl";
import React from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateQuote } from "@/quote/quote.hooks";
import useQuotesStore from "@/quote/quote.store";
import { Quote } from "@/quote/quote.type";

import useUserStore from "@/stores/use-user-store";

import useQuoteColumns from "./quote.columns";

const QuotesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Quote>) => {
  const t = useTranslations();
  const { mutateAsync: updateQuote } = useUpdateQuote();

  const setData = useQuotesStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateQuote({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useQuoteColumns(handleEdit);

  const setSelectedRows = useQuotesStore((state) => state.setSelectedRows);
  const selectedRows = useQuotesStore((state) => state.selectedRows);

  const columnVisibility = useQuotesStore((state) => state.columnVisibility);
  const setColumnVisibility = useQuotesStore((state) => state.setColumnVisibility);

  const canEditQuote = useUserStore((state) => state.hasPermission("quotes.update"));
  const canDuplicateQuote = useUserStore((state) => state.hasPermission("quotes.duplicate"));
  const canViewQuote = useUserStore((state) => state.hasPermission("quotes.view"));
  const canArchiveQuote = useUserStore((state) => state.hasPermission("quotes.archive"));
  const canDeleteQuote = useUserStore((state) => state.hasPermission("quotes.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
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
      enableColumnSizing={true}
      canEditAction={canEditQuote}
      canDuplicateAction={canDuplicateQuote}
      canViewAction={canViewQuote}
      canArchiveAction={canArchiveQuote}
      canDeleteAction={canDeleteQuote}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={quoteTableOptions}
      onActionClicked={onActionClicked}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
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

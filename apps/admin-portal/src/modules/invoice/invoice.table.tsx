import { useTranslations } from "next-intl";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateInvoice } from "@/invoice/invoice.hooks";
import useInvoiceStore from "@/invoice/invoice.store";
import { Invoice, InvoiceUpdateData } from "@/invoice/invoice.type";

import useUserStore from "@/stores/use-user-store";

import useInvoiceColumns from "./invoice.columns";

const InvoicesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Invoice>) => {
  const t = useTranslations();
  const { mutateAsync: updateInvoice } = useUpdateInvoice();
  const setData = useInvoiceStore((state) => state.setData);

  const handleEdit = createHandleEdit<Invoice, InvoiceUpdateData>(setData, updateInvoice, data);

  const columns = useInvoiceColumns(handleEdit);

  const selectedRows = useInvoiceStore((state) => state.selectedRows);
  const setSelectedRows = useInvoiceStore((state) => state.setSelectedRows);

  const columnVisibility = useInvoiceStore((state) => state.columnVisibility);
  const setColumnVisibility = useInvoiceStore((state) => state.setColumnVisibility);

  const canEditInvoice = useUserStore((state) => state.hasPermission("invoices.update"));
  const canDuplicateInvoice = useUserStore((state) => state.hasPermission("invoices.duplicate"));
  const canViewInvoice = useUserStore((state) => state.hasPermission("invoices.view"));
  const canArchiveInvoice = useUserStore((state) => state.hasPermission("invoices.archive"));
  const canDeleteInvoice = useUserStore((state) => state.hasPermission("invoices.delete"));
  const canPreviewInvoice = true;

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
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
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditInvoice}
      canDuplicateAction={canDuplicateInvoice}
      canViewAction={canViewInvoice}
      canArchiveAction={canArchiveInvoice}
      canDeleteAction={canDeleteInvoice}
      canPreviewAction={canPreviewInvoice}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={invoiceTableOptions}
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
        preview: t("General.preview"),
      }}
    />
  );
};

export default InvoicesTable;

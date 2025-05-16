import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import usePurchaseColumns from "./purchase.columns";
import { useUpdatePurchase } from "./purchase.hooks";
import usePurchaseStore from "./purchase.store";
import { Purchase } from "./purchase.type";

const PurchasesTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Purchase>) => {
  const t = useTranslations();
  const { mutate: updatePurchase } = useUpdatePurchase();

  const setData = usePurchaseStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updatePurchase({ id: rowId, data: { [columnId]: value } });
  };
  const columns = usePurchaseColumns(handleEdit);

  const selectedRows = usePurchaseStore((state) => state.selectedRows);
  const setSelectedRows = usePurchaseStore((state) => state.setSelectedRows);

  const columnVisibility = usePurchaseStore((state) => state.columnVisibility);
  const setColumnVisibility = usePurchaseStore((state) => state.setColumnVisibility);

  const canEditPurchase = useUserStore((state) => state.hasPermission("purchases.update"));
  const canDuplicatePurchase = useUserStore((state) => state.hasPermission("purchases.duplicate"));
  const canViewPurchase = useUserStore((state) => state.hasPermission("purchases.view"));
  const canArchivePurchase = useUserStore((state) => state.hasPermission("purchases.archive"));
  const canDeletePurchase = useUserStore((state) => state.hasPermission("purchases.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Purchase[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
    );
  }

  const purchaseTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Purchase) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
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
      canEditAction={canEditPurchase}
      canDuplicateAction={canDuplicatePurchase}
      canViewAction={canViewPurchase}
      canArchiveAction={canArchivePurchase}
      canDeleteAction={canDeletePurchase}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={purchaseTableOptions}
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

export default PurchasesTable;

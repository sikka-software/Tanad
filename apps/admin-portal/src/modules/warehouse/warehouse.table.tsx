import { useTranslations } from "next-intl";
import React from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateWarehouse } from "@/warehouse/warehouse.hooks";
import useWarehouseStore from "@/warehouse/warehouse.store";
import { Warehouse } from "@/warehouse/warehouse.type";

import useUserStore from "@/stores/use-user-store";

import useWarehouseColumns from "./warehouse.columns";

const WarehouseTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Warehouse>) => {
  const t = useTranslations();

  const { mutate: updateWarehouse } = useUpdateWarehouse();
  const setData = useWarehouseStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "domain_id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateWarehouse({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useWarehouseColumns(handleEdit);

  const selectedRows = useWarehouseStore((state) => state.selectedRows);
  const setSelectedRows = useWarehouseStore((state) => state.setSelectedRows);

  const columnVisibility = useWarehouseStore((state) => state.columnVisibility);
  const setColumnVisibility = useWarehouseStore((state) => state.setColumnVisibility);

  const canEditWarehouse = useUserStore((state) => state.hasPermission("warehouses.update"));
  const canDuplicateWarehouse = useUserStore((state) =>
    state.hasPermission("warehouses.duplicate"),
  );
  const canViewWarehouse = useUserStore((state) => state.hasPermission("warehouses.view"));
  const canArchiveWarehouse = useUserStore((state) => state.hasPermission("warehouses.archive"));
  const canDeleteWarehouse = useUserStore((state) => state.hasPermission("warehouses.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = (rows: Warehouse[]) => {
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

  const warehouseTableOptions = {
    state: { rowSelection },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Warehouse) => row.id!,
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
      canEditAction={canEditWarehouse}
      canDuplicateAction={canDuplicateWarehouse}
      canViewAction={canViewWarehouse}
      canArchiveAction={canArchiveWarehouse}
      canDeleteAction={canDeleteWarehouse}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={warehouseTableOptions}
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

export default WarehouseTable;

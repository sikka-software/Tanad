import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useTruckColumns from "./truck.columns";
import { useUpdateTruck } from "./truck.hooks";
import useTruckStore from "./truck.store";
import { Truck, TruckUpdateData } from "./truck.type";

const TrucksTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Truck>) => {
  const t = useTranslations();

  const { mutate: updateTruck } = useUpdateTruck();
  const setData = useTruckStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateTruck({ id: rowId, data: { [columnId]: value } as TruckUpdateData });
  };

  const columns = useTruckColumns(handleEdit);

  const selectedRows = useTruckStore((state) => state.selectedRows);
  const setSelectedRows = useTruckStore((state) => state.setSelectedRows);

  const columnVisibility = useTruckStore((state) => state.columnVisibility);
  const setColumnVisibility = useTruckStore((state) => state.setColumnVisibility);

  const canEditTruck = useUserStore((state) => state.hasPermission("trucks.update"));
  const canDuplicateTruck = useUserStore((state) => state.hasPermission("trucks.duplicate"));
  const canViewTruck = useUserStore((state) => state.hasPermission("trucks.view"));
  const canArchiveTruck = useUserStore((state) => state.hasPermission("trucks.archive"));
  const canDeleteTruck = useUserStore((state) => state.hasPermission("trucks.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Truck[]) => {
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

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const truckTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Truck) => row.id,
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
      canEditAction={canEditTruck}
      canDuplicateAction={canDuplicateTruck}
      canViewAction={canViewTruck}
      canArchiveAction={canArchiveTruck}
      canDeleteAction={canDeleteTruck}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={truckTableOptions}
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

export default TrucksTable;

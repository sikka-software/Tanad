import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useVehicleColumns from "./vehicle.columns";
import { useUpdateVehicle } from "./vehicle.hooks";
import useVehicleStore from "./vehicle.store";
import { Vehicle, VehicleUpdateData } from "./vehicle.type";

const VehiclesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Vehicle>) => {
  const t = useTranslations();
  const { mutate: updateVehicle } = useUpdateVehicle();
  const setData = useVehicleStore((state) => state.setData);

  const handleEdit = createHandleEdit<Vehicle, VehicleUpdateData>(setData, updateVehicle, data);

  const columns = useVehicleColumns(handleEdit);
  const selectedRows = useVehicleStore((state) => state.selectedRows);
  const setSelectedRows = useVehicleStore((state) => state.setSelectedRows);

  const columnVisibility = useVehicleStore((state) => state.columnVisibility);
  const setColumnVisibility = useVehicleStore((state) => state.setColumnVisibility);

  const canEditVehicle = useUserStore((state) => state.hasPermission("vehicles.update"));
  const canDuplicateVehicle = useUserStore((state) => state.hasPermission("vehicles.duplicate"));
  const canViewVehicle = useUserStore((state) => state.hasPermission("vehicles.view"));
  const canArchiveVehicle = useUserStore((state) => state.hasPermission("vehicles.archive"));
  const canDeleteVehicle = useUserStore((state) => state.hasPermission("vehicles.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Vehicle[]) => {
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

  const vehicleTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Vehicle) => row.id,
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
      canEditAction={canEditVehicle}
      canDuplicateAction={canDuplicateVehicle}
      canViewAction={canViewVehicle}
      canArchiveAction={canArchiveVehicle}
      canDeleteAction={canDeleteVehicle}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={vehicleTableOptions}
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

export default VehiclesTable;

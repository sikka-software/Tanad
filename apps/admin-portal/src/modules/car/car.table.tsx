import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useCarColumns from "./car.columns";
import { useUpdateCar } from "./car.hooks";
import useCarStore from "./car.store";
import { Car } from "./car.type";

const CarsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Car>) => {
  const t = useTranslations();
  const { mutate: updateCar } = useUpdateCar();
  const setData = useCarStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateCar({ id: rowId, data: { [columnId]: value } });
  };

  const columns = useCarColumns(handleEdit);
  const selectedRows = useCarStore((state) => state.selectedRows);
  const setSelectedRows = useCarStore((state) => state.setSelectedRows);

  const columnVisibility = useCarStore((state) => state.columnVisibility);
  const setColumnVisibility = useCarStore((state) => state.setColumnVisibility);

  const canEditCar = useUserStore((state) => state.hasPermission("cars.update"));
  const canDuplicateCar = useUserStore((state) => state.hasPermission("cars.duplicate"));
  const canViewCar = useUserStore((state) => state.hasPermission("cars.view"));
  const canArchiveCar = useUserStore((state) => state.hasPermission("cars.archive"));
  const canDeleteCar = useUserStore((state) => state.hasPermission("cars.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Car[]) => {
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

  const carTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Car) => row.id,
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
      canEditAction={canEditCar}
      canDuplicateAction={canDuplicateCar}
      canViewAction={canViewCar}
      canArchiveAction={canArchiveCar}
      canDeleteAction={canDeleteCar}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={carTableOptions}
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

export default CarsTable;

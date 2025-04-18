import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Warehouse } from "@/types/warehouse.type";

import useWarehousesStore from "@/stores/warehouses.store";

const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const capacitySchema = z.number().min(0, "Must be >= 0").optional();
const notesSchema = z.string().optional();

interface WarehouseTableProps {
  data: Warehouse[];
  isLoading?: boolean;
  error?: Error | null;
}

const WarehouseTable = ({ data, isLoading, error }: WarehouseTableProps) => {
  const t = useTranslations();
  const { selectedRows, setSelectedRows, updateWarehouse } = useWarehousesStore();

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (selectedRows: Warehouse[]) => {
      const selectedIds = selectedRows.map((row) => row.id!);
      if (JSON.stringify(selectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(selectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  const handleRowSelectionUpdater = useCallback(
    (
      updater:
        | ((old: Record<string, boolean>) => Record<string, boolean>)
        | Record<string, boolean>,
    ) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
    [data, rowSelection, handleRowSelectionChange],
  );

  const columns: ExtendedColumnDef<Warehouse>[] = [
    { accessorKey: "name", header: t("Warehouses.form.name.label"), validationSchema: nameSchema },
    { accessorKey: "code", header: t("Warehouses.form.code.label"), validationSchema: codeSchema },
    {
      accessorKey: "address",
      header: t("Warehouses.form.address.label"),
      validationSchema: addressSchema,
    },
    { accessorKey: "city", header: t("Warehouses.form.city.label"), validationSchema: citySchema },
    {
      accessorKey: "state",
      header: t("Warehouses.form.state.label"),
      validationSchema: stateSchema,
    },
    {
      accessorKey: "zip_code",
      header: t("Warehouses.form.zip_code.label"),
      validationSchema: zipCodeSchema,
    },
    {
      accessorKey: "capacity",
      header: t("Warehouses.form.capacity.label"),
      validationSchema: capacitySchema,
    },
    {
      accessorKey: "notes",
      header: t("Warehouses.form.notes.label"),
      validationSchema: notesSchema,
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

  const warehouseTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Warehouse) => row.id!,
    onRowSelectionChange: handleRowSelectionUpdater,
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={warehouseTableOptions}
    />
  );
};

export default WarehouseTable;

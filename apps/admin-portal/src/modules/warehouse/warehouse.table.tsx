import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useWarehouseStore } from "@/modules/warehouse/warehouse.store";
import { Warehouse } from "@/modules/warehouse/warehouse.type";

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
  const updateWarehouse = useWarehouseStore((state) => state.updateWarehouse);
  const selectedRows = useWarehouseStore((state) => state.selectedRows);
  const setSelectedRows = useWarehouseStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse(rowId, { [columnId]: value });
  };

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
    state: {
      rowSelection,
    },
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
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={warehouseTableOptions}
    />
  );
};

export default WarehouseTable;

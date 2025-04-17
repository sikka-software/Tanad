import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import TableSkeleton from "@/ui/table-skeleton";

import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Warehouse } from "@/types/warehouse.type";

import useWarehousesStore from "@/stores/warehouses.store";

const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const capacitySchema = z.number().optional();
const notesSchema = z.string().optional();
const is_activeSchema = z.boolean();

interface WarehouseTableProps {
  data: Warehouse[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (rows: Warehouse[]) => void;
}

const WarehouseTable = ({ data, isLoading, error, onSelectedRowsChange }: WarehouseTableProps) => {
  const t = useTranslations("Warehouses");
  const { updateWarehouse, selectedRows, setSelectedRows } = useWarehousesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = (rows: Warehouse[]) => {
    setSelectedRows(rows.map((row) => row.id));
    onSelectedRowsChange?.(rows);
  };

  // Convert selected row IDs to a record format for the table
  const rowSelection = selectedRows.reduce((acc: Record<string, boolean>, id: string) => {
    acc[id] = true;
    return acc;
  }, {});

  const columns: ExtendedColumnDef<Warehouse>[] = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "code", header: t("form.code.label"), validationSchema: codeSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zip_code", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "capacity", header: t("form.capacity.label"), validationSchema: capacitySchema },
    {
      accessorKey: "is_active",
      header: t("form.is_active.label"),
      validationSchema: is_activeSchema,
    },
    { accessorKey: "notes", header: t("form.notes.label"), validationSchema: notesSchema },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      tableOptions={{
        state: {
          rowSelection,
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row: Warehouse) => row.id,
        onRowSelectionChange: (updater: any) => {
          const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
          const selectedRows = data.filter((row) => newSelection[row.id]);
          handleRowSelectionChange(selectedRows);
        },
      }}
    />
  );
};

export default WarehouseTable;

import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useWarehousesStore } from "@/stores/warehouses.store";
import { Warehouse } from "@/types/warehouse.type";

const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const capacitySchema = z.number().optional();
const notesSchema = z.string().optional();
const isActiveSchema = z.boolean();

interface WarehouseTableProps {
  data: Warehouse[];
  isLoading?: boolean;
  error?: Error | null;
}

const WarehouseTable = ({ data, isLoading, error }: WarehouseTableProps) => {
  const t = useTranslations("Warehouses");
  const { updateWarehouse } = useWarehousesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse(rowId, { [columnId]: value });
  };

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
      validationSchema: isActiveSchema,
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
  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default WarehouseTable;

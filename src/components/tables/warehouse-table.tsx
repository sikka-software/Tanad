import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const columns = [
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse(rowId, { [columnId]: value });
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        {t("errorLoadingWarehouses")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default WarehouseTable;

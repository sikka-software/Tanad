import React, { useCallback } from "react";

import { useTranslations } from "next-intl";

import { Row } from "@tanstack/react-table";
import { X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Department } from "@/types/department.type";

import { useBranches } from "@/hooks/useBranches";
import { useUpdateDepartment } from "@/hooks/useDepartments";
import { useOffices } from "@/hooks/useOffices";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useDepartmentsStore } from "@/stores/departments.store";

const nameSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const createdAtSchema = z.string().min(1, "Required");
const updatedAtSchema = z.string().min(1, "Required");

interface DepartmentsTableProps {
  data: Department[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (selectedRows: Department[]) => void;
}

const DepartmentsTable = ({
  data,
  isLoading,
  error,
  onSelectedRowsChange,
}: DepartmentsTableProps) => {
  const t = useTranslations("Departments");
  const { mutateAsync: updateDepartment } = useUpdateDepartment();
  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();
  const { selectedRows, setSelectedRows } = useDepartmentsStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateDepartment({ id: rowId, updates: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Department[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      const currentSelection = new Set(selectedRows);
      const newSelection = new Set(newSelectedIds);

      if (
        newSelection.size !== currentSelection.size ||
        !Array.from(newSelection).every((id) => currentSelection.has(id))
      ) {
        setSelectedRows(newSelectedIds);
        if (onSelectedRowsChange) {
          onSelectedRowsChange(rows);
        }
      }
    },
    [selectedRows, setSelectedRows, onSelectedRowsChange],
  );

  const getLocationName = (locationId: string) => {
    const office = offices?.find((o) => o.id === locationId);
    if (office) return office.name;

    const branch = branches?.find((b) => b.id === locationId);
    if (branch) return branch.name;

    const warehouse = warehouses?.find((w) => w.id === locationId);
    if (warehouse) return warehouse.name;

    return locationId;
  };

  const handleRemoveLocation = async (row: Row<Department>, locationId: string) => {
    const locationIds = row.original.locations || [];
    const updatedLocations = locationIds.filter((id: string) => id !== locationId);
    await updateDepartment({ id: row.original.id, updates: { locations: updatedLocations } });
  };

  const columns: ExtendedColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: t("form.name.label"),
      validationSchema: nameSchema,
      className: "min-w-[200px]",
    },
    {
      accessorKey: "description",
      header: t("form.description.label"),
      validationSchema: descriptionSchema,
      className: "min-w-[250px]",
    },
    {
      accessorKey: "locations",
      header: t("form.locations.label"),
      validationSchema: locationSchema,
      className: "min-w-[200px]",
      cell: ({ row }) => {
        const locationIds = row.original.locations || [];

        if (locationIds.length === 0) {
          return t("form.locations.noLocations");
        } else if (locationIds.length === 1) {
          return getLocationName(locationIds[0]);
        } else {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-4 !p-0 !text-xs">
                  {t("form.locations.multipleLocations", { count: locationIds.length })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {locationIds.map((locationId) => (
                  <DropdownMenuItem key={locationId} className="flex justify-between">
                    <span>{getLocationName(locationId)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLocation(row, locationId);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: t("form.createdAt.label"),
      validationSchema: createdAtSchema,
      className: "min-w-[180px]",
    },
    {
      accessorKey: "updatedAt",
      header: t("form.updatedAt.label"),
      validationSchema: updatedAtSchema,
      className: "min-w-[180px]",
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

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={{
        state: {
          rowSelection,
        },
        enableRowSelection: true,
      }}
    />
  );
};

export default DepartmentsTable;

import { Row } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
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

import { useBranches } from "@/modules/branch/branch.hooks";
import { useUpdateDepartment } from "@/modules/department/department.hooks";
import useDepartmentStore from "@/modules/department/department.store";
import { Department } from "@/modules/department/department.type";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";

const nameSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const created_atSchema = z.string().min(1, "Required");
const updated_atSchema = z.string().min(1, "Required");

interface DepartmentsTableProps {
  data: Department[];
  isLoading?: boolean;
  error?: Error | null;
  onActionClicked: (action: string, rowId: string) => void;
}

const DepartmentsTable = ({ data, isLoading, error, onActionClicked }: DepartmentsTableProps) => {
  const t = useTranslations();
  const { mutateAsync: updateDepartment } = useUpdateDepartment();

  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();

  const selectedRows = useDepartmentStore((state) => state.selectedRows);
  const setSelectedRows = useDepartmentStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: t("Departments.form.name.label"),
      validationSchema: nameSchema,
      className: "min-w-[200px]",
    },
    {
      accessorKey: "description",
      header: t("Departments.form.description.label"),
      validationSchema: descriptionSchema,
      className: "min-w-[250px]",
    },
    {
      accessorKey: "locations",
      header: t("Departments.form.locations.label"),
      validationSchema: locationSchema,
      className: "min-w-[200px]",
      cell: ({ row }) => {
        const locationIds = row.original.locations || [];

        console.log("Department data:", row.original);
        console.log("Location IDs:", locationIds);
        
        if (locationIds.length === 0) {
          return t("Departments.form.locations.noLocations");
        } else if (locationIds.length === 1) {
          return getLocationName(locationIds[0]);
        } else {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-4 !p-0 !text-xs">
                  {t("Departments.form.locations.multipleLocations", { count: locationIds.length })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {locationIds.map((location_id) => (
                  <DropdownMenuItem key={location_id} className="flex justify-between">
                    <span>{getLocationName(location_id)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLocation(row, location_id);
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
      accessorKey: "created_at",
      header: t("Departments.form.created_at.label"),
      validationSchema: created_atSchema,
      className: "min-w-[180px]",
    },
    {
      accessorKey: "updated_at",
      header: t("Departments.form.updated_at.label"),
      validationSchema: updated_atSchema,
      className: "min-w-[180px]",
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateDepartment({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Department[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  const getLocationName = (location_id: string) => {
    const office = offices?.find((o) => o.id === location_id);
    if (office) return office.name;

    const branch = branches?.find((b) => b.id === location_id);
    if (branch) return branch.name;

    const warehouse = warehouses?.find((w) => w.id === location_id);
    if (warehouse) return warehouse.name;

    return location_id;
  };

  const handleRemoveLocation = async (row: Row<Department>, location_id: string) => {
    const locationIds = row.original.locations || [];
    const updatedLocations = locationIds.filter((id: string) => id !== location_id);
    await updateDepartment({ id: row.original.id, data: { locations: updatedLocations } });
  };

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const departmentTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Department) => row.id!,
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
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      onEdit={handleEdit}
      onActionClicked={onActionClicked}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={departmentTableOptions}
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

export default DepartmentsTable;

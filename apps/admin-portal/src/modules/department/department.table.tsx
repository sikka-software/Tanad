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

import { useOffices } from "@/office/office.hooks";

import { useBranches } from "@/branch/branch.hooks";

import { useUpdateDepartment } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";
import { Department } from "@/department/department.type";

import { useWarehouses } from "@/warehouse/warehouse.hooks";

import useUserStore from "@/stores/use-user-store";

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

  const canEditDepartment = useUserStore((state) => state.hasPermission("departments.update"));
  const canDuplicateDepartment = useUserStore((state) =>
    state.hasPermission("departments.duplicate"),
  );
  const canViewDepartment = useUserStore((state) => state.hasPermission("departments.view"));
  const canArchiveDepartment = useUserStore((state) => state.hasPermission("departments.archive"));
  const canDeleteDepartment = useUserStore((state) => state.hasPermission("departments.delete"));

  const selectedRows = useDepartmentStore((state) => state.selectedRows);
  const setSelectedRows = useDepartmentStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: t("Departments.form.name.label"),
      validationSchema: z.string().min(1, t("Departments.form.name.required")),
      className: "min-w-[200px]",
    },
    {
      accessorKey: "description",
      header: t("Departments.form.description.label"),
      validationSchema: z.string().min(1, t("Departments.form.description.required")),
      className: "min-w-[250px]",
    },
    {
      accessorKey: "locations",
      header: t("Departments.form.locations.label"),
      validationSchema: z.array(z.string()).min(1, t("Departments.form.locations.required")),
      className: "min-w-[200px]",
      cell: ({ row }) => {
        const locations = row.original.locations || [];

        if (locations.length === 0) {
          return t("Departments.form.locations.noLocations");
        } else if (locations.length === 1) {
          return getLocationName(locations[0].location_id);
        } else {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-4 !p-0 !text-xs">
                  {t("Departments.form.locations.multipleLocations", { count: locations.length })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {locations.map((location) => (
                  <DropdownMenuItem key={location.location_id} className="flex justify-between">
                    <span>{getLocationName(location.location_id)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLocation(row, location.location_id);
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
      validationSchema: z.string().min(1, t("Departments.form.created_at.required")),
      className: "min-w-[180px]",
    },
    {
      accessorKey: "updated_at",
      header: t("Departments.form.updated_at.label"),
      validationSchema: z.string().min(1, t("Departments.form.updated_at.required")),
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
    const locations = row.original.locations || [];
    const updatedLocations = locations.filter((location) => location.location_id !== location_id);
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
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditDepartment}
      canDuplicateAction={canDuplicateDepartment}
      canViewAction={canViewDepartment}
      canArchiveAction={canArchiveDepartment}
      canDeleteAction={canDeleteDepartment}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={departmentTableOptions}
      onActionClicked={onActionClicked}
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

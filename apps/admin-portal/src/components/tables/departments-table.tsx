import React from "react";

import { useTranslations } from "next-intl";

import { X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useBranches } from "@/hooks/useBranches";
import { useOffices } from "@/hooks/useOffices";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useDepartmentsStore } from "@/stores/departments.store";
import { Department } from "@/types/department.type";

const nameSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const createdAtSchema = z.string().min(1, "Required");
const updatedAtSchema = z.string().min(1, "Required");

interface DepartmentsTableProps {
  data: Department[];
  isLoading?: boolean;
  error?: Error | null;
}

const DepartmentsTable = ({ data, isLoading, error }: DepartmentsTableProps) => {
  const t = useTranslations("Departments");
  const { updateDepartment } = useDepartmentsStore();
  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateDepartment(rowId, { [columnId]: value });
  };

  const getLocationName = (locationId: string) => {
    const office = offices?.find((o) => o.id === locationId);
    if (office) return office.name;

    const branch = branches?.find((b) => b.id === locationId);
    if (branch) return branch.name;

    const warehouse = warehouses?.find((w) => w.id === locationId);
    if (warehouse) return warehouse.name;

    return locationId;
  };

  const columns: ExtendedColumnDef<Department>[] = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    {
      accessorKey: "description",
      header: t("form.description.label"),
      validationSchema: descriptionSchema,
    },
    {
      accessorKey: "locations",
      header: t("form.locations.label"),
      validationSchema: locationSchema,
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
                <Button variant="ghost" className="h-8 px-2 py-1">
                  {/* {locationIds.length}{" "} */}
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
                        const updatedLocations = locationIds.filter((id) => id !== locationId);
                        updateDepartment(row.original.id, { locations: updatedLocations });
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
    },
    {
      accessorKey: "updatedAt",
      header: t("form.updatedAt.label"),
      validationSchema: updatedAtSchema,
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

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default DepartmentsTable;

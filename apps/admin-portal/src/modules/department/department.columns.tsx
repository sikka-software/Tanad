import useUserStore from "@root/src/stores/use-user-store";
import { Row } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useBranches } from "../branch/branch.hooks";
import { useOffices } from "../office/office.hooks";
import { useWarehouses } from "../warehouse/warehouse.hooks";
import { useUpdateDepartment } from "./department.hooks";
import { Department } from "./department.type";

const useDepartmentColumns = () => {
  const t = useTranslations();
  const { data: offices } = useOffices();
  const { data: branches } = useBranches();
  const { data: warehouses } = useWarehouses();
  const { mutate: updateDepartment } = useUpdateDepartment();

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

  return columns;
};

export default useDepartmentColumns;

import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/components/tables/select-cell";

import TimestampCell from "@/tables/timestamp-cell";

import { VehicleStatus } from "@/types/common.type";

import { Truck } from "@/truck/truck.type";

const useTruckColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Truck>[] = [
    {
      accessorKey: "name",
      header: t("Trucks.form.name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "code",
      header: t("Trucks.form.code.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "make",
      header: t("Vehicles.form.make.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "model",
      header: t("Vehicles.form.model.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "year",
      header: t("Vehicles.form.year.label"),
      validationSchema: z.number().min(0, "Required"),
    },
    {
      accessorKey: "color",
      header: t("Vehicles.form.color.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "vin",
      header: t("Vehicles.form.vin.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_country",
      header: t("Vehicles.form.license_country.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_plate",
      header: t("Vehicles.form.license_plate.label"),
      validationSchema: z.string().min(1, "Required"),
    },

    {
      accessorKey: "created_at", maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at", maxSize: 95,
      enableEditing: false,

      header: t("Metadata.updated_at.label"),
      validationSchema: z.string().min(1, t("Metadata.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    //status
    {
      accessorKey: "status",
      header: t("Vehicles.form.status.label"),
      validationSchema: z.string().min(1, t("Vehicles.form.status.required")),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={VehicleStatus.map((status) => ({
            label: t(`Vehicles.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default useTruckColumns;

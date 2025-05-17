import { useTranslations } from "next-intl";

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
    },
    {
      accessorKey: "code",
      header: t("Trucks.form.code.label"),
    },
    {
      accessorKey: "make",
      header: t("Vehicles.form.make.label"),
    },
    {
      accessorKey: "model",
      header: t("Vehicles.form.model.label"),
    },
    {
      accessorKey: "year",
      header: t("Vehicles.form.year.label"),
    },
    {
      accessorKey: "color",
      header: t("Vehicles.form.color.label"),
    },
    {
      accessorKey: "vin",
      header: t("Vehicles.form.vin.label"),
    },
    {
      accessorKey: "license_country",
      header: t("Vehicles.form.license_country.label"),
    },
    {
      accessorKey: "license_plate",
      header: t("Vehicles.form.license_plate.label"),
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      header: t("Vehicles.form.status.label"),
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

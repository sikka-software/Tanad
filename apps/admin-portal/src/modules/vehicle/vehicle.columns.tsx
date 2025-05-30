import { useTranslations } from "next-intl";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { VehicleStatus } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";
import { Vehicle } from "@/vehicle/vehicle.type";

const useVehicleColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Vehicle>[] = [
    {
      accessorKey: "name",
      header: t("Vehicles.form.name.label"),
    },
    {
      accessorKey: "code",
      header: t("Vehicles.form.code.label"),
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
      accessorKey: "ownership_status",
      header: t("Vehicles.form.ownership_status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "ownership_status", value)}
          cellValue={getValue()}
          options={[
            { label: t("Vehicles.form.ownership_status.financed"), value: "financed" },
            { label: t("Vehicles.form.ownership_status.owned"), value: "owned" },
            { label: t("Vehicles.form.ownership_status.rented"), value: "rented" },
          ]}
        />
      ),
    },
    {
      accessorKey: "payment_cycle",
      header: t("PaymentCycles.label"),
    },
    {
      accessorKey: "monthly_payment",
      header: t("PaymentCycles.monthly_payment.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
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

export default useVehicleColumns;

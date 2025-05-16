import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/components/tables/status-cell";

import CurrencyCell from "@/tables/currency-cell";
import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { VehicleStatus } from "@/types/common.type";

import { Car } from "@/car/car.type";
import useUserStore from "@/stores/use-user-store";

const useCarColumns = (handleEdit?: (rowId: string, columnId: string, value: unknown) => void) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Car>[] = [
    {
      accessorKey: "name",
      header: t("Cars.form.name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "code",
      header: t("Cars.form.code.label"),
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

export default useCarColumns;

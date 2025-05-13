import CurrencyCell from "@root/src/components/tables/currency-cell";
import SelectCell from "@root/src/components/tables/select-cell";
import useUserStore from "@root/src/stores/use-user-store";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Car } from "./car.type";

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
      accessorKey: "monthly_payment",
      header: t("Cars.form.monthly_payment.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
  ];
  return columns;
};

export default useCarColumns;

import CurrencyCell from "@/components/tables/currency-cell";
import SelectCell from "@/components/tables/select-cell";
import StatusCell from "@/components/tables/status-cell";
import useUserStore from "@/stores/use-user-store";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Domain } from "./domain.type";

const useDomainColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const columns: ExtendedColumnDef<Domain>[] = [
    {
      accessorKey: "domain_name",
      header: t("Domains.form.domain_name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "registrar",
      header: t("Domains.form.registrar.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "monthly_cost",
      header: t("Domains.form.monthly_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "annual_cost",
      header: t("Domains.form.annual_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "payment_cycle",
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "payment_cycle", value)}
          cellValue={getValue()}
          options={[
            { label: t("Domains.form.payment_cycle.monthly"), value: "monthly" },
            { label: t("Domains.form.payment_cycle.annual"), value: "annual" },
          ]}
        />
      ),
      header: t("Domains.form.payment_cycle.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("Domains.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("Domains.form.status.active"), value: "active" },
              { label: t("Domains.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];
  return columns;
};

export default useDomainColumns;

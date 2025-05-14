import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
import LinkCell from "@/tables/link-cell";
import SelectCell from "@/tables/select-cell";
import StatusCell from "@/tables/status-cell";

import useUserStore from "@/stores/use-user-store";

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
      noPadding: true,
      cell: (cell) => (
        <LinkCell
          value={cell.getValue() as string}
          onBlur={(e) => handleEdit?.(cell.row.id, "domain_name", e.target.value)}
          onClick={() => window.open(`https://${cell.getValue() as string}`, "_blank")}
        />
      ),
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

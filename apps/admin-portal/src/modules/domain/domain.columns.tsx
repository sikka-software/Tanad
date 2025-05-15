import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import IconButton from "@/ui/icon-button";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
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
      endIcon: ({ domain_name }) => (
        <IconButton
          size="icon_sm"
          variant="ghost"
          className="absolute -end-0.5 -top-1.5 z-10 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          onClick={() => window.open(`https://${domain_name}`, "_blank")}
          icon={<SquareArrowOutUpRight className="size-4" />}
        />
      ),
    },
    {
      accessorKey: "registrar",
      header: t("Domains.form.registrar.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "monthly_payment",
      header: t("PaymentCycles.monthly_payment.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "annual_payment",
      header: t("PaymentCycles.annual_payment.label"),
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
            { label: t("PaymentCycles.monthly"), value: "monthly" },
            { label: t("PaymentCycles.annual"), value: "annual" },
          ]}
        />
      ),
      header: t("PaymentCycles.label"),
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

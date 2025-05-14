import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/components/tables/currency-cell";
import SelectCell from "@/components/tables/select-cell";
import StatusCell from "@/components/tables/status-cell";

import { SERVER_OS, SERVER_PROVIDERS } from "@/lib/constants";

import useUserStore from "@/stores/use-user-store";

import { Server } from "./server.type";

const useServerColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Server>[] = [
    { accessorKey: "name", header: t("Servers.form.name.label") },
    {
      accessorKey: "ip_address",
      header: t("Servers.form.ip_address.label"),
    },
    {
      accessorKey: "location",
      header: t("Servers.form.location.label"),
    },
    {
      accessorKey: "provider",
      header: t("Servers.form.provider.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "provider", value)}
          cellValue={getValue()}
          options={SERVER_PROVIDERS}
          renderSelected={(item) => <div>{t(item.label)}</div>}
          renderOption={(item) => <div>{t(item.label)}</div>}
        />
      ),
    },
    {
      accessorKey: "os",
      header: t("Servers.form.os.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "os", value)}
          cellValue={getValue()}
          options={SERVER_OS}
        />
      ),
    },
    {
      accessorKey: "monthly_cost",
      header: t("Servers.form.monthly_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "annual_cost",
      header: t("Servers.form.annual_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "payment_cycle",
      noPadding: true,
      enableEditing: false,
      header: t("Servers.form.payment_cycle.label"),
      validationSchema: z.string().min(1, "Required"),
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "payment_cycle", value)}
          cellValue={getValue()}
          options={[
            { label: t("Servers.form.payment_cycle.monthly"), value: "monthly" },
            { label: t("Servers.form.payment_cycle.annual"), value: "annual" },
          ]}
        />
      ),
    },
    { accessorKey: "tags", header: t("Servers.form.tags.label") },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("Servers.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("Servers.form.status.active"), value: "active" },
              { label: t("Servers.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useServerColumns;

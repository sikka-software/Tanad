import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
import SelectCell from "@/tables/select-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { SERVER_OS, SERVER_PROVIDERS } from "@/lib/constants";

import { Server } from "@/server/server.type";
import useUserStore from "@/stores/use-user-store";

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
      header: t("PaymentCycles.label"),
      validationSchema: z.string().min(1, "Required"),
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
    },
    { accessorKey: "tags", header: t("Servers.form.tags.label") },

    {
      accessorKey: "created_at",
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      enableEditing: false,

      header: t("Metadata.updated_at.label"),
      validationSchema: z.string().min(1, t("Metadata.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("CommonStatus.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("CommonStatus.active"), value: "active" },
              { label: t("CommonStatus.inactive"), value: "inactive" },
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

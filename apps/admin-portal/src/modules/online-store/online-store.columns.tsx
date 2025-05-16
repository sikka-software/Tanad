import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import IconButton from "@/ui/icon-button";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/tables/select-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { E_COMMERCE_PLATFORMS } from "@/lib/constants";

import { OnlineStore } from "./online-store.type";

const useOnlineStoreColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<OnlineStore>[] = [
    {
      accessorKey: "domain_name",
      header: t("OnlineStores.form.domain_name.label"),
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
      accessorKey: "platform",
      header: t("OnlineStores.form.platform.label"),
      validationSchema: z.string().min(1, "Required"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "platform", value)}
          cellValue={getValue()}
          options={E_COMMERCE_PLATFORMS}
          renderSelected={(item) => <div>{t(item.label)}</div>}
          renderOption={(item) => <div>{t(item.label)}</div>}
        />
      ),
    },

    {
      accessorKey: "created_at",
      enableEditing: false,
      header: t("Forms.created_at.label"),
      validationSchema: z.string().min(1, t("Forms.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      enableEditing: false,

      header: t("Forms.updated_at.label"),
      validationSchema: z.string().min(1, t("Forms.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("OnlineStores.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("OnlineStores.form.status.active"), value: "active" },
              { label: t("OnlineStores.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useOnlineStoreColumns;

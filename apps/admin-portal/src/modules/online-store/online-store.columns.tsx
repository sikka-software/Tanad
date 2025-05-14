import { useTranslations } from "next-intl";
import { z } from "zod";

import SelectCell from "@/components/tables/select-cell";
import StatusCell from "@/components/tables/status-cell";
import { ExtendedColumnDef } from "@/components/ui/sheet-table";

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
      validationSchema: z.string().min(1, "Required"),
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

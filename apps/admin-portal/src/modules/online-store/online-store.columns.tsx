import StatusCell from "@root/src/components/tables/status-cell";
import { E_COMMERCE_PLATFORMS } from "@root/src/lib/constants";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { OnlineStore } from "./online-store.type";

const useOnlineStoreColumns = (
  handleEdit: (rowId: string, columnId: string, value: unknown) => void,
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
      cellType: "select",
      header: t("OnlineStores.form.platform.label"),
      validationSchema: z.string().min(1, "Required"),
      options: E_COMMERCE_PLATFORMS,
    },
    {
      accessorKey: "notes",
      header: t("OnlineStores.form.notes.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("OnlineStores.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
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
            onStatusChange={async (value) => handleEdit(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useOnlineStoreColumns;

import SelectCell from "@root/src/components/tables/select-cell";
import StatusCell from "@root/src/components/tables/status-cell";
import { SERVER_OS, SERVER_PROVIDERS } from "@root/src/lib/constants";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Server } from "./server.type";

const useServerColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

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
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "provider", value)}
          cellValue={getValue()}
          options={SERVER_PROVIDERS}
        />
      ),
    },
    {
      accessorKey: "os",
      header: t("Servers.form.os.label"),
      noPadding: true,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "os", value)}
          cellValue={getValue()}
          options={SERVER_OS}
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

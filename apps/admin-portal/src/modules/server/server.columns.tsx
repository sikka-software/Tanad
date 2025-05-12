import { SERVER_OS, SERVER_PROVIDERS } from "@root/src/lib/constants";
import { useTranslations } from "next-intl";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Server } from "./server.type";

const useServerColumns = () => {
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
      cellType: "select",
      options: SERVER_PROVIDERS,
    },
    {
      accessorKey: "os",
      header: t("Servers.form.os.label"),
      cellType: "select",
      options: SERVER_OS,
    },
    { accessorKey: "tags", header: t("Servers.form.tags.label") },
    { accessorKey: "notes", header: t("Servers.form.notes.label") },
    {
      accessorKey: "status",
      maxSize: 80,
      cellType: "status",
      options: [
        { label: t("Servers.form.status.active"), value: "active" },
        { label: t("Servers.form.status.inactive"), value: "inactive" },
      ],
      header: t("Servers.form.status.label"),
    },
  ];

  return columns;
};

export default useServerColumns;

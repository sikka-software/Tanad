import { SquareArrowOutUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import IconButton from "@/ui/icon-button";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/tables/status-cell";

import { Website } from "@/website/website.type";

const useWebsiteColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const locale = useLocale();

  const columns: ExtendedColumnDef<Website>[] = [
    {
      accessorKey: "domain_name",
      header: t("Websites.form.domain_name.label"),
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
      accessorKey: "created_at",
      header: t("Websites.form.created_at.label"),
      enableEditing: false,
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? new Date(date).toLocaleDateString(locale) : "-";
      },
    },
    {
      accessorKey: "updated_at",
      header: t("Websites.form.updated_at.label"),
      enableEditing: false,
      cell: ({ row }) => {
        const date = row.original.updated_at;
        return date ? new Date(date).toLocaleDateString(locale) : "-";
      },
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("Websites.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("Websites.form.status.active"), value: "active" },
              { label: t("Websites.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useWebsiteColumns;

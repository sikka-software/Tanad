import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import IconButton from "@/ui/icon-button";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Website } from "@/website/website.type";

const useWebsiteColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

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
      enableEditing: false,

      header: t("Forms.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      enableEditing: false,

      header: t("Forms.updated_at.label"),
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

export default useWebsiteColumns;

import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import IconButton from "@/ui/icon-button";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Company } from "@/company/company.type";

const useCompanyColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: t("Companies.form.name.label"),
    },
    {
      accessorKey: "industry",
      header: t("Companies.form.industry.label"),
    },
    {
      accessorKey: "email",
      header: t("Companies.form.email.label"),
    },
    {
      accessorKey: "phone",
      header: t("Companies.form.phone.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "website",
      header: t("Companies.form.website.label"),
      endIcon: ({ website }) => {
        if (!website) return null;
        return (
          <IconButton
            size="icon_sm"
            variant="ghost"
            className="absolute -end-1 top-1/2 z-10 -translate-y-1/2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            onClick={() => window.open(`https://${website}`, "_blank")}
            icon={<SquareArrowOutUpRight className="size-4" />}
          />
        );
      },
    },

    {
      accessorKey: "city",
      header: t("Forms.city.label"),
    },
    {
      accessorKey: "region",
      header: t("Forms.region.label"),
    },
    {
      accessorKey: "zip_code",
      header: t("Forms.zip_code.label"),
    },
    {
      accessorKey: "size",
      header: t("Companies.form.size.label"),
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
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

export default useCompanyColumns;

import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

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
      validationSchema: z.string().min(1, t("Companies.form.name.required")),
    },
    {
      accessorKey: "industry",
      header: t("Companies.form.industry.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "email",
      header: t("Companies.form.email.label"),
      validationSchema: z.string().email(t("Companies.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Companies.form.phone.label"),
      cell: ({ row }) => {
        return <span dir="ltr"> {row.original.phone}</span>;
      },
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "website",
      header: t("Companies.form.website.label"),
      endIcon: ({ website }) => (
        <IconButton
          size="icon_sm"
          variant="ghost"
          className="absolute -end-0.5 -top-1.5 z-10 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          onClick={() => window.open(`https://${website}`, "_blank")}
          icon={<SquareArrowOutUpRight className="size-4" />}
        />
      ),
    },
    {
      accessorKey: "address",
      header: t("Forms.address.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "city",
      header: t("Forms.city.label"),
      validationSchema: z.string().optional(),
    },

    {
      accessorKey: "region",
      header: t("Forms.region.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "zip_code",
      header: t("Forms.zip_code.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "size",
      header: t("Companies.form.size.label"),
      validationSchema: z.number().min(0, t("Companies.form.size.invalid")),
    },

    {
      accessorKey: "created_at", maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at", maxSize: 95,
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

export default useCompanyColumns;

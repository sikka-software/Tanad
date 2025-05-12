import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Website } from "./website.type";

const useWebsiteColumns = () => {
  const t = useTranslations();
  const locale = useLocale();

  const columns: ExtendedColumnDef<Website>[] = [
    {
      accessorKey: "domain_name",
      header: t("Websites.form.domain_name.label"),
      validationSchema: z.string().min(1, t("Websites.form.domain_name.required")),
    },

    {
      accessorKey: "notes",
      header: t("Websites.form.notes.label"),
      validationSchema: z.string().nullable(),
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
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Websites.form.status.active"), value: "active" },
        { label: t("Websites.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  return columns;
};

export default useWebsiteColumns;

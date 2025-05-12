import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Client } from "./client.type";

const useCompanyColumns = () => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: t("Clients.form.name.label"),
      validationSchema: z.string().min(1, t("Clients.form.name.required")),
    },
    {
      accessorKey: "email",
      header: t("Clients.form.email.label"),
      validationSchema: z.string().email(t("Clients.form.email.invalid")),
      cell: ({ row }) => <span dir="ltr">{row.original.email}</span>,
    },
    {
      accessorKey: "phone",
      header: t("Clients.form.phone.label"),
      validationSchema: z.string().min(1, t("Clients.form.phone.required")),
      cell: ({ row }) => <span dir="ltr">{row.original.phone}</span>,
    },
    {
      accessorKey: "company_name",

      header: t("Clients.form.company.label", { defaultValue: "Company" }),
      cell: ({ row }) => {
        const company = row.original.company;
        if (company && typeof company === "object" && "name" in company) {
          return (company as any).name || "-";
        }
        return "-";
      },
      enableEditing: false,
    },

    {
      accessorKey: "city",
      header: t("Forms.city.label"),
      validationSchema: z.string().min(1, t("Forms.city.required")),
    },
    {
      accessorKey: "region",
      header: t("Forms.region.label"),
      validationSchema: z.string().min(1, t("Forms.region.required")),
    },

    {
      accessorKey: "status",
      maxSize: 80,

      header: t("Clients.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Clients.form.status.active"), value: "active" },
        { label: t("Clients.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  return columns;
};

export default useCompanyColumns;

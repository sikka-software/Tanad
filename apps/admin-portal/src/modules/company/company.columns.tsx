import { useTranslations } from "next-intl";
import { z } from "zod";

import StatusCell from "@/components/tables/status-cell";
import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Company } from "./company.type";

const useCompanyColumns = (
  handleEdit: (rowId: string, columnId: string, value: unknown) => void,
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
      validationSchema: z.string().url(t("Companies.form.website.invalid")),
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
      accessorKey: "status",
      maxSize: 80,
      header: t("Companies.form.status.label"),
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
              { label: t("Companies.form.status.active"), value: "active" },
              { label: t("Companies.form.status.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit(rowId, "status", value)}
          />
        );
      },
    },
  ];

  return columns;
};

export default useCompanyColumns;

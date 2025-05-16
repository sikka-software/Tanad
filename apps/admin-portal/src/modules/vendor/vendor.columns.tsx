import { useTranslations } from "next-intl";
import { z } from "zod";

import StatusCell from "@/components/tables/status-cell";
import TimestampCell from "@/components/tables/timestamp-cell";
import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Vendor } from "./vendor.type";

const useVendorColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: t("Vendors.form.name.label"),
      validationSchema: z.string().min(1, t("Vendors.form.name.required")),
    },
    {
      accessorKey: "company",
      header: t("Vendors.form.company.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "email",
      header: t("Vendors.form.email.label"),
      validationSchema: z
        .string()
        .email(t("Vendors.form.email.invalid"))
        .min(1, t("Vendors.form.email.required")),
    },
    {
      accessorKey: "phone",
      header: t("Vendors.form.phone.label"),
      validationSchema: z.string().optional(),
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
      accessorKey: "zip_code",
      header: t("Forms.zip_code.label"),
      validationSchema: z.string().min(1, t("Forms.zip_code.required")),
    },
    {
      accessorKey: "products",
      header: t("Vendors.form.products.label"),
      validationSchema: z.string().optional(),
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

export default useVendorColumns;

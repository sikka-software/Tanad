import { useTranslations } from "next-intl";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/components/tables/status-cell";
import TimestampCell from "@/components/tables/timestamp-cell";

import { Vendor } from "./vendor.type";

const useVendorColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: t("Vendors.form.name.label"),
    },
    {
      accessorKey: "company",
      header: t("Vendors.form.company.label"),
    },
    {
      accessorKey: "email",
      header: t("Vendors.form.email.label"),
    },
    {
      accessorKey: "phone",
      header: t("Vendors.form.phone.label"),
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
      accessorKey: "products",
      header: t("Vendors.form.products.label"),
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

export default useVendorColumns;

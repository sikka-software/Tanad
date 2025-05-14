import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Vendor } from "./vendor.type";

const useVendorColumns = () => {
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
  ];

  return columns;
};

export default useVendorColumns;

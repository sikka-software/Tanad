import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Vendor } from "./vendor.type";

const useVendorColumns = () => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: t("form.name.label"),
      validationSchema: z.string().min(1, t("form.name.required")),
    },
    {
      accessorKey: "company",
      header: t("form.company.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "email",
      header: t("form.email.label"),
      validationSchema: z.string().email(t("form.email.invalid")).min(1, t("form.email.required")),
    },
    {
      accessorKey: "phone",
      header: t("form.phone.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "address",
      header: t("Forms.address.label"),
      validationSchema: z.string().min(1, t("Forms.address.required")),
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
      header: t("form.products.label"),
      validationSchema: z.string().optional(),
    },
  ];

  return columns;
};

export default useVendorColumns;

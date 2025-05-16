import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import TimestampCell from "@/tables/timestamp-cell";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { Product } from "@/product/product.type";

import useUserStore from "@/stores/use-user-store";

const useProductColumns = () => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("Products.form.name.label"),
      validationSchema: z.string().min(1, t("Products.form.name.required")),
    },
    {
      accessorKey: "description",
      header: t("Products.form.description.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "price",
      header: t("Products.form.price.label"),
      validationSchema: z.number().min(0, t("Products.form.price.required")),
      cell: (props: CellContext<Product, unknown>) => (
        <span className="flex flex-row items-center gap-1 text-sm font-medium">
          {MoneyFormatter(props.row.original.price)}
          {getCurrencySymbol(currency || "sar").symbol}
        </span>
      ),
    },
    {
      accessorKey: "sku",
      header: t("Products.form.sku.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "stock_quantity",
      header: t("Products.form.stock_quantity.label"),
      cell: (props: CellContext<Product, unknown>) => (
        <span className="flex flex-row items-center gap-1 text-sm font-medium">
          {props.row.original.stock_quantity?.toLocaleString()}
        </span>
      ),
      validationSchema: z.number().min(0, t("Products.form.stock_quantity.required")),
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
  ];

  return columns;
};

export default useProductColumns;

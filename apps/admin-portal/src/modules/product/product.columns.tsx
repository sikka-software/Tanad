import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { MoneyFormatter } from "@/components/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import { getCurrencySymbol } from "@/lib/currency-utils";

import useUserStore from "@/stores/use-user-store";

import { Product } from "./product.type";

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
  ];

  return columns;
};

export default useProductColumns;

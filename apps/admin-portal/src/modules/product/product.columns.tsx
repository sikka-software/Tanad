import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import TimestampCell from "@/tables/timestamp-cell";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { Product } from "@/product/product.type";

const useProductColumns = () => {
  const t = useTranslations();
  const currency = useAppCurrencySymbol().symbol;

  const columns: ExtendedColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("Products.form.name.label"),
    },
    {
      accessorKey: "description",
      header: t("Products.form.description.label"),
    },
    {
      accessorKey: "price",
      header: t("Products.form.price.label"),
      cell: (props: CellContext<Product, unknown>) => (
        <span className="flex flex-row items-center gap-1 text-sm font-medium">
          {MoneyFormatter(props.row.original.price)}
          {currency}
        </span>
      ),
    },
    {
      accessorKey: "sku",
      header: t("Products.form.sku.label"),
    },
    {
      accessorKey: "stock_quantity",
      header: t("Products.form.stock_quantity.label"),
      cell: (props: CellContext<Product, unknown>) => (
        <span className="flex flex-row items-center gap-1 text-sm font-medium">
          {props.row.original.stock_quantity?.toLocaleString()}
        </span>
      ),
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
  ];

  return columns;
};

export default useProductColumns;

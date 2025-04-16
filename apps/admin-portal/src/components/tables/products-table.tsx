import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Product } from "@/types/product.type";

import { useProductsStore } from "@/stores/products.store";

const nameSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().optional();
const priceSchema = z.number().min(0, "Must be >= 0");
const skuSchema = z.string().optional();
const stockQuantitySchema = z.number().min(0, "Must be >= 0").optional();

interface ProductsTableProps {
  data: Product[];
  isLoading?: boolean;
  error?: Error | null;
}

const ProductsTable = ({ data, isLoading, error }: ProductsTableProps) => {
  const { updateProduct } = useProductsStore();
  const t = useTranslations();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateProduct(rowId, { [columnId]: value });
  };

  const columns: ExtendedColumnDef<Product>[] = [
    { accessorKey: "name", header: t("Products.form.name.label"), validationSchema: nameSchema },
    {
      accessorKey: "description",
      header: t("Products.form.description.label"),
      validationSchema: descriptionSchema,
    },
    { accessorKey: "price", header: t("Products.form.price.label"), validationSchema: priceSchema },
    { accessorKey: "sku", header: t("Products.form.sku.label"), validationSchema: skuSchema },
    {
      accessorKey: "stock_quantity",
      header: t("Products.form.stock_quantity.label"),
      validationSchema: stockQuantitySchema,
    },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default ProductsTable;

import React from "react";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useProductsStore } from "@/stores/products.store";
import { Product } from "@/types/product.type";

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateProduct(rowId, { [columnId]: value });
  };

  const columns: ExtendedColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name", validationSchema: nameSchema },
    { accessorKey: "description", header: "Description", validationSchema: descriptionSchema },
    { accessorKey: "price", header: "Price", validationSchema: priceSchema },
    { accessorKey: "sku", header: "SKU", validationSchema: skuSchema },
    {
      accessorKey: "stock_quantity",
      header: "Stock Quantity",
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

import React from "react";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductsStore } from "@/stores/products.store";
import { Product } from "@/types/product.type";

const nameSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().optional();
const priceSchema = z.number().min(0, "Must be >= 0");
const skuSchema = z.string().optional();
const stockQuantitySchema = z.number().min(0, "Must be >= 0").optional();

const columns = [
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

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        Error loading products: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default ProductsTable;

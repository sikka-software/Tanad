import React, { useState } from "react";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";

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
  { accessorKey: "stockQuantity", header: "Stock Quantity", validationSchema: stockQuantitySchema },
];

const initialData = [
  {
    id: "1",
    name: "Sample Product 1",
    description: "A sample product description",
    price: 99.99,
    sku: "PROD001",
    stockQuantity: 100,
  },
  {
    id: "2",
    name: "Sample Product 2",
    description: "Another sample product",
    price: 149.99,
    sku: "PROD002",
    stockQuantity: 50,
  },
];

type RowData = {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stockQuantity?: number;
};

const ProductsTable = () => {
  const [data, setData] = useState<RowData[]>(initialData);

  /**
   * onEdit callback: updates local state if the new value is valid.
   */
  const handleEdit = <K extends keyof RowData>(rowId: string, columnId: K, value: RowData[K]) => {
    setData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)),
    );

    console.log(`State updated [row id=${rowId}, column=${columnId}, value=${value}]`, value);
  };

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default ProductsTable;

import React, { useState } from "react";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";

const materialNameSchema = z.string().min(1, "Required");
const cftSchema = z.number().nonnegative().optional();
const rateSchema = z.number().min(0, "Must be >= 0");
const amountSchema = z.number().min(0, "Must be >= 0");

const columns = [
  { accessorKey: "materialName", header: "Material Name", validationSchema: materialNameSchema },
  { accessorKey: "cft", header: "CFT", validationSchema: cftSchema },
  { accessorKey: "rate", header: "Rate", validationSchema: rateSchema },
  { accessorKey: "amount", header: "Amount", validationSchema: amountSchema },
];

const initialData = [
  { id: 1, materialName: "Material A", cft: 0.1, rate: 100, amount: 10 },
  { id: 2, materialName: "Material B", cft: 0.2, rate: 200, amount: 40 },
];

type RowData = (typeof initialData)[number];

const ProductsTable = () => {
  const [data, setData] = useState(initialData);

  /**
   * onEdit callback: updates local state if the new value is valid. (Normal usage)
   */
  const handleEdit = <K extends keyof RowData>(
    rowId: string, // Unique identifier for the row
    columnId: K, // Column key
    value: RowData[K], // New value for the cell
  ) => {
    setData((prevData) =>
      prevData.map(
        (row) =>
          String(row.id) === rowId
            ? { ...row, [columnId]: value } // Update the row if the ID matches
            : row, // Otherwise, return the row unchanged
      ),
    );

    console.log(`State updated [row id=${rowId}, column=${columnId}, value=${value}]`, value);
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      disabledColumns={["amount"]} // Example: Disable editing for "amount" col
      showHeader={true}
    />
  );
};

export default ProductsTable;

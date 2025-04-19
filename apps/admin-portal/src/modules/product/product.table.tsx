import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useProductStore } from "@/modules/product/product.store";
import { Product } from "@/modules/product/product.type";

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
  const t = useTranslations();
  const updateProduct = useProductStore((state) => state.updateProduct);
  const selectedRows = useProductStore((state) => state.selectedRows);
  const setSelectedRows = useProductStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateProduct(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Product[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      const currentSelection = new Set(selectedRows);
      const newSelection = new Set(newSelectedIds);

      if (
        newSelection.size !== currentSelection.size ||
        !Array.from(newSelection).every((id) => currentSelection.has(id))
      ) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const productTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Product) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={productTableOptions}
    />
  );
};

export default ProductsTable;

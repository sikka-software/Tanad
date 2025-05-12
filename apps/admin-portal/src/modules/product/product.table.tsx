import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { MoneyFormatter } from "@/components/ui/currency-input";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateProduct } from "@/product/product.hooks";
import useProductStore from "@/product/product.store";
import { Product } from "@/product/product.type";

import useUserStore from "@/stores/use-user-store";

import useProductColumns from "./product.columns";

const ProductsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Product>) => {
  const t = useTranslations();

  const columns = useProductColumns();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const selectedRows = useProductStore((state) => state.selectedRows);
  const setSelectedRows = useProductStore((state) => state.setSelectedRows);

  const columnVisibility = useProductStore((state) => state.columnVisibility);
  const setColumnVisibility = useProductStore((state) => state.setColumnVisibility);

  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const canEditProduct = useUserStore((state) => state.hasPermission("products.update"));
  const canDuplicateProduct = useUserStore((state) => state.hasPermission("products.duplicate"));
  const canViewProduct = useUserStore((state) => state.hasPermission("products.view"));
  const canArchiveProduct = useUserStore((state) => state.hasPermission("products.archive"));
  const canDeleteProduct = useUserStore((state) => state.hasPermission("products.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateProduct({ id: rowId, data: { [columnId]: value } });
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
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditProduct}
      canDuplicateAction={canDuplicateProduct}
      canViewAction={canViewProduct}
      canArchiveAction={canArchiveProduct}
      canDeleteAction={canDeleteProduct}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={productTableOptions}
      onActionClicked={onActionClicked}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default ProductsTable;

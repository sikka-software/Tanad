import CurrencyCell from "@root/src/components/tables/currency-cell";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import { ComboboxAdd } from "@root/src/components/ui/comboboxes/combobox-add";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useEmployees } from "@/employee/employee.hooks";

import useUserStore from "@/stores/use-user-store";

import { useUpdatePurchase } from "./purchase.hooks";
import usePurchaseStore from "./purchase.store";
import { Purchase } from "./purchase.type";

const PurchasesTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Purchase>) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutate: updatePurchase } = useUpdatePurchase();
  const selectedRows = usePurchaseStore((state) => state.selectedRows);
  const setSelectedRows = usePurchaseStore((state) => state.setSelectedRows);

  const canEditPurchase = useUserStore((state) => state.hasPermission("purchases.update"));
  const canDuplicatePurchase = useUserStore((state) => state.hasPermission("purchases.duplicate"));
  const canViewPurchase = useUserStore((state) => state.hasPermission("purchases.view"));
  const canArchivePurchase = useUserStore((state) => state.hasPermission("purchases.archive"));
  const canDeletePurchase = useUserStore((state) => state.hasPermission("purchases.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Purchase>[] = [
    {
      accessorKey: "purchase_number",
      header: t("Purchases.form.purchase_number.label"),
      validationSchema: z.string().min(1, t("Purchases.form.purchase_number.required")),
    },
    {
      accessorKey: "description",
      header: t("Purchases.form.description.label"),
      validationSchema: z.string().min(1, t("Purchases.form.description.required")),
    },
    {
      accessorKey: "amount",
      header: t("Purchases.form.amount.label"),
      validationSchema: z.number().min(1, t("Purchases.form.amount.required")),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "category",
      header: t("Purchases.form.category.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "due_date",
      header: t("Purchases.form.due_date.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "status",
      header: t("Purchases.form.status.label"),
      validationSchema: z.string().nullable(),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    const purchase = data.find((p) => p.id === rowId);
    if (!purchase) return;
    await updatePurchase({
      id: purchase.id,
      data: {
        id: purchase.id,
        [columnId]: value,
      },
    });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Purchase[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
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

  const purchaseTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Purchase) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
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
      canEditAction={canEditPurchase}
      canDuplicateAction={canDuplicatePurchase}
      canViewAction={canViewPurchase}
      canArchiveAction={canArchivePurchase}
      canDeleteAction={canDeletePurchase}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={purchaseTableOptions}
      onActionClicked={onActionClicked}
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

export default PurchasesTable;

import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useVendorColumns from "./vendor.columns";
import { useUpdateVendor } from "./vendor.hooks";
import useVendorStore from "./vendor.store";
import { Vendor, VendorUpdateData } from "./vendor.type";

const VendorsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Vendor>) => {
  const t = useTranslations("Vendors");

  const { mutate: updateVendor } = useUpdateVendor();
  const setData = useVendorStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateVendor({ id: rowId, data: { [columnId]: value } as VendorUpdateData });
  };
  const columns = useVendorColumns(handleEdit);

  const selectedRows = useVendorStore((state) => state.selectedRows);
  const setSelectedRows = useVendorStore((state) => state.setSelectedRows);

  const columnVisibility = useVendorStore((state) => state.columnVisibility);
  const setColumnVisibility = useVendorStore((state) => state.setColumnVisibility);

  const canEditVendor = useUserStore((state) => state.hasPermission("vendors.update"));
  const canDuplicateVendor = useUserStore((state) => state.hasPermission("vendors.duplicate"));
  const canViewVendor = useUserStore((state) => state.hasPermission("vendors.view"));
  const canArchiveVendor = useUserStore((state) => state.hasPermission("vendors.archive"));
  const canDeleteVendor = useUserStore((state) => state.hasPermission("vendors.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Vendor[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
    );
  }
  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const vendorTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Vendor) => row.id!,
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
      canEditAction={canEditVendor}
      canDuplicateAction={canDuplicateVendor}
      canViewAction={canViewVendor}
      canArchiveAction={canArchiveVendor}
      canDeleteAction={canDeleteVendor}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={vendorTableOptions}
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

export default VendorsTable;

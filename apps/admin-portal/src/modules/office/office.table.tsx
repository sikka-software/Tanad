import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import useOfficeColumns from "@/office/office.columns";
import { useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { Office, OfficeUpdateData } from "@/office/office.type";

import useUserStore from "@/stores/use-user-store";

const OfficesTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
  sorting,
  onSortingChange,
}: ModuleTableProps<Office>) => {
  const t = useTranslations();

  const { mutate: updateOffice } = useUpdateOffice();

  const setData = useOfficeStore((state) => state.setData);

  const handleEdit = createHandleEdit<Office, OfficeUpdateData>(setData, updateOffice, data);

  const columns = useOfficeColumns(handleEdit);

  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);

  const columnVisibility = useOfficeStore((state) => state.columnVisibility);
  const setColumnVisibility = useOfficeStore((state) => state.setColumnVisibility);

  const canEditOffice = useUserStore((state) => state.hasPermission("offices.update"));
  const canDuplicateOffice = useUserStore((state) => state.hasPermission("offices.duplicate"));
  const canViewOffice = useUserStore((state) => state.hasPermission("offices.view"));
  const canArchiveOffice = useUserStore((state) => state.hasPermission("offices.archive"));
  const canDeleteOffice = useUserStore((state) => state.hasPermission("offices.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Office[]) => {
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

  const officeTableOptions = {
    state: { rowSelection },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Office) => row.id!,
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
      canEditAction={canEditOffice}
      canDuplicateAction={canDuplicateOffice}
      canViewAction={canViewOffice}
      canArchiveAction={canArchiveOffice}
      canDeleteAction={canDeleteOffice}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={officeTableOptions}
      onActionClicked={onActionClicked}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      sorting={sorting}
      onSortingChange={onSortingChange}
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

export default OfficesTable;

import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useServerStore from "@/modules/server/server.store";
import { Server } from "@/modules/server/server.type";
import useUserStore from "@/stores/use-user-store";

import useServerColumns from "./server.columns";
import { useUpdateServer } from "./server.hooks";

const ServersTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Server>) => {
  const t = useTranslations();
  const { mutate: updateServer } = useUpdateServer();
  const selectedRows = useServerStore((state) => state.selectedRows);
  const setSelectedRows = useServerStore((state) => state.setSelectedRows);

  const columns = useServerColumns();
  const columnVisibility = useServerStore((state) => state.columnVisibility);
  const setColumnVisibility = useServerStore((state) => state.setColumnVisibility);

  const canEditServer = useUserStore((state) => state.hasPermission("servers.update"));
  const canDuplicateServer = useUserStore((state) => state.hasPermission("servers.duplicate"));
  const canViewServer = useUserStore((state) => state.hasPermission("servers.view"));
  const canArchiveServer = useUserStore((state) => state.hasPermission("servers.archive"));
  const canDeleteServer = useUserStore((state) => state.hasPermission("servers.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "server_id") return;
    await updateServer({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Server[]) => {
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

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const serverTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Server) => row.id,
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
      canEditAction={canEditServer}
      canDuplicateAction={canDuplicateServer}
      canViewAction={canViewServer}
      canArchiveAction={canArchiveServer}
      canDeleteAction={canDeleteServer}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={serverTableOptions}
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

export default ServersTable;

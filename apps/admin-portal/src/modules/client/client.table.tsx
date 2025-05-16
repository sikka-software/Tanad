import { useTranslations } from "next-intl";
import { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateClient } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";
import { Client } from "@/client/client.type";

import useUserStore from "@/stores/use-user-store";

import useClientColumns from "./client.columns";

const ClientsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Client>) => {
  const t = useTranslations();

  const setData = useClientStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateClient({ id: rowId, data: { [columnId]: value } });
  };

  const columns = useClientColumns(handleEdit);

  const { mutate: updateClient } = useUpdateClient();
  const selectedRows = useClientStore((state) => state.selectedRows);
  const setSelectedRows = useClientStore((state) => state.setSelectedRows);

  const columnVisibility = useClientStore((state) => state.columnVisibility);
  const setColumnVisibility = useClientStore((state) => state.setColumnVisibility);

  const canEditClient = useUserStore((state) => state.hasPermission("clients.update"));
  const canDuplicateClient = useUserStore((state) => state.hasPermission("clients.duplicate"));
  const canViewClient = useUserStore((state) => state.hasPermission("clients.view"));
  const canArchiveClient = useUserStore((state) => state.hasPermission("clients.archive"));
  const canDeleteClient = useUserStore((state) => state.hasPermission("clients.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Client[]) => {
      const newSelectedIds = rows.map((row: Client) => row.id!);
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

  const clientTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Client) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditClient}
      canDuplicateAction={canDuplicateClient}
      canViewAction={canViewClient}
      canArchiveAction={canArchiveClient}
      canDeleteAction={canDeleteClient}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={clientTableOptions}
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

export default ClientsTable;

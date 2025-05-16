import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useOnlineStoreColumns from "./online-store.columns";
import { useUpdateOnlineStore } from "./online-store.hooks";
import useOnlineStoreStore from "./online-store.store";
import { OnlineStore } from "./online-store.type";

const OnlineStoresTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<OnlineStore>) => {
  const t = useTranslations();
  const { mutate: updateOnlineStore } = useUpdateOnlineStore();
  const setData = useOnlineStoreStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateOnlineStore({ id: rowId, data: { [columnId]: value } });
  };

  const columns = useOnlineStoreColumns(handleEdit);

  const selectedRows = useOnlineStoreStore((state) => state.selectedRows);
  const setSelectedRows = useOnlineStoreStore((state) => state.setSelectedRows);

  const columnVisibility = useOnlineStoreStore((state) => state.columnVisibility);
  const setColumnVisibility = useOnlineStoreStore((state) => state.setColumnVisibility);

  const canEditOnlineStore = useUserStore((state) => state.hasPermission("online_stores.update"));
  const canDuplicateOnlineStore = useUserStore((state) =>
    state.hasPermission("online_stores.duplicate"),
  );
  const canViewOnlineStore = useUserStore((state) => state.hasPermission("online_stores.view"));
  const canArchiveOnlineStore = useUserStore((state) =>
    state.hasPermission("online_stores.archive"),
  );
  const canDeleteOnlineStore = useUserStore((state) => state.hasPermission("online_stores.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: OnlineStore[]) => {
      const newSelectedIds = rows.map((row) => row.id);
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

  const onlineStoreTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: OnlineStore) => row.id,
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
      canEditAction={canEditOnlineStore}
      canDuplicateAction={canDuplicateOnlineStore}
      canViewAction={canViewOnlineStore}
      canArchiveAction={canArchiveOnlineStore}
      canDeleteAction={canDeleteOnlineStore}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={onlineStoreTableOptions}
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

export default OnlineStoresTable;

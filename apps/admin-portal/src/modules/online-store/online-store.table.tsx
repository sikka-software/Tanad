import { E_COMMERCE_PLATFORMS } from "@root/src/lib/constants";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import CurrencyCell from "@/components/tables/currency-cell";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

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
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutate: updateOnlineStore } = useUpdateOnlineStore();
  const selectedRows = useOnlineStoreStore((state) => state.selectedRows);
  const setSelectedRows = useOnlineStoreStore((state) => state.setSelectedRows);

  const canEditOnlineStore = useUserStore((state) => state.hasPermission("online_stores.update"));
  const canDuplicateOnlineStore = useUserStore((state) =>
    state.hasPermission("online_stores.duplicate"),
  );
  const canViewOnlineStore = useUserStore((state) => state.hasPermission("online_stores.view"));
  const canArchiveOnlineStore = useUserStore((state) =>
    state.hasPermission("online_stores.archive"),
  );
  const canDeleteOnlineStore = useUserStore((state) => state.hasPermission("online_stores.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<OnlineStore>[] = [
    {
      accessorKey: "domain_name",
      header: t("OnlineStores.form.domain_name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "platform",
      cellType: "select",
      header: t("OnlineStores.form.platform.label"),
      validationSchema: z.string().min(1, "Required"),
      options: E_COMMERCE_PLATFORMS,
    },
    {
      accessorKey: "notes",
      header: t("OnlineStores.form.notes.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "status",
      header: t("OnlineStores.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("OnlineStores.form.status.active"), value: "active" },
        { label: t("OnlineStores.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "domain_id") return;
    await updateOnlineStore({ id: rowId, data: { [columnId]: value } });
  };

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
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
      canEditAction={canEditOnlineStore}
      canDuplicateAction={canDuplicateOnlineStore}
      canViewAction={canViewOnlineStore}
      canArchiveAction={canArchiveOnlineStore}
      canDeleteAction={canDeleteOnlineStore}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={onlineStoreTableOptions}
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

export default OnlineStoresTable;

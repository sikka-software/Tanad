import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useServerStore from "@/modules/server/server.store";
import { Server } from "@/modules/server/server.type";
import useUserStore from "@/stores/use-user-store";

import { useUpdateServer } from "./server.hooks";

const nameSchema = z.string().min(1, "Required");
const ipAddressSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const providerSchema = z.string().min(1, "Required");
const osSchema = z.string().min(1, "Required");
const statusSchema = z.string().min(1, "Required");
const tagsSchema = z.array(z.string()).min(1, "Required");
const notesSchema = z.string().min(1, "Required");

const ServersTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Server>) => {
  const t = useTranslations();
  const { mutate: updateServer } = useUpdateServer();
  const selectedRows = useServerStore((state) => state.selectedRows);
  const setSelectedRows = useServerStore((state) => state.setSelectedRows);

  const canEditServer = useUserStore((state) => state.hasPermission("servers.update"));
  const canDuplicateServer = useUserStore((state) => state.hasPermission("servers.duplicate"));
  const canViewServer = useUserStore((state) => state.hasPermission("servers.view"));
  const canArchiveServer = useUserStore((state) => state.hasPermission("servers.archive"));
  const canDeleteServer = useUserStore((state) => state.hasPermission("servers.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Server>[] = [
    { accessorKey: "name", header: t("Servers.form.name.label"), validationSchema: nameSchema },
    {
      accessorKey: "ip_address",
      header: t("Servers.form.ip_address.label"),
      validationSchema: ipAddressSchema,
    },
    {
      accessorKey: "location",
      header: t("Servers.form.location.label"),
      validationSchema: locationSchema,
    },
    {
      accessorKey: "provider",
      header: t("Servers.form.provider.label"),
      validationSchema: providerSchema,
    },
    { accessorKey: "os", header: t("Servers.form.os.label"), validationSchema: osSchema },
    {
      accessorKey: "status",
      header: t("Servers.form.status.label"),
      validationSchema: statusSchema,
    },
    { accessorKey: "tags", header: t("Servers.form.tags.label"), validationSchema: tagsSchema },
    { accessorKey: "notes", header: t("Servers.form.notes.label"), validationSchema: notesSchema },
    {
      accessorKey: "user_id",
      header: t("Servers.form.user_id.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "enterprise_id",
      header: t("Servers.form.enterprise_id.label"),
      validationSchema: z.string().min(1, "Required"),
    },
  ];

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
      canEditAction={canEditServer}
      canDuplicateAction={canDuplicateServer}
      canViewAction={canViewServer}
      canArchiveAction={canArchiveServer}
      canDeleteAction={canDeleteServer}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={serverTableOptions}
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

export default ServersTable;

"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import React from "react";
import { z } from "zod";

import { Badge } from "@/ui/badge";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { predefinedRoles } from "../role/role.options";
import { useUpdateUser } from "./user.hooks";
import useEnterpriseUsersStore from "./user.store";
import { UserType } from "./user.type";

export default function UsersTable({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<UserType>) {
  const t = useTranslations();
  const { mutate: updateUser } = useUpdateUser();

  const canEditUser = useUserStore((state) => state.hasPermission("users.update"));
  const canDuplicateUser = useUserStore((state) => state.hasPermission("users.duplicate"));
  const canViewUser = useUserStore((state) => state.hasPermission("users.view"));
  const canArchiveUser = useUserStore((state) => state.hasPermission("users.archive"));
  const canDeleteUser = useUserStore((state) => state.hasPermission("users.delete"));

  const selectedRows = useEnterpriseUsersStore((state) => state.selectedRows);
  const setSelectedRows = useEnterpriseUsersStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<UserType>[] = [
    {
      accessorKey: "email",
      header: t("Users.form.email.label"),
      validationSchema: z
        .string()
        .email(t("Users.form.email.invalid"))
        .min(1, t("Users.form.email.required")),
    },
    {
      accessorKey: "role",
      header: t("Users.form.role.label"),
      cell: ({ row }) => {
        const role = row.original.role;
        return <Badge variant="outline">{predefinedRoles(t, role)?.name || role}</Badge>;
      },
      validationSchema: z.string().min(1, t("Users.form.role.required")),
    },
    {
      accessorKey: "created_at", maxSize: 95,
      header: t("Users.form.created_at.label"),
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date) return null;
        return new Date(date).toLocaleDateString();
      },
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateUser({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: UserType[]) => {
      const newSelectedIds = rows.map((row) => row.id);
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

  const userTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: UserType) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      setSelectedRows(selectedRows.map((row) => row.id!));
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
      canEditAction={canEditUser}
      canDuplicateAction={canDuplicateUser}
      canViewAction={canViewUser}
      canArchiveAction={canArchiveUser}
      canDeleteAction={canDeleteUser}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={userTableOptions}
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
}

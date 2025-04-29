"use client";

import {
  MoreHorizontal,
  Search,
  UserCog,
  Shield,
  User,
  UserX,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserForm } from "./user.form";
import { useDeleteUser, useUpdateUser, useUsers } from "./user.hooks";
import useEnterpriseUsersStore from "./user.store";

// Define user types
export type UserType = {
  id: string;
  email: string;
  role: "superadmin" | "accounting" | "hr";
  enterprise_id: string;
  created_at: string;
};

interface UsersTableProps {
  users: UserType[];
  isLoading?: boolean;
  error?: Error | null;
  onActionClicked: (action: string, rowId: string) => void;
}

const emailSchema = z.string().email("Invalid email").min(1, "Required");
const roleSchema = z.string().min(1, "Required");

export default function UsersTable({ users, isLoading, error, onActionClicked }: UsersTableProps) {
  const t = useTranslations();

  const selectedRows = useEnterpriseUsersStore((state) => state.selectedRows);
  const setSelectedRows = useEnterpriseUsersStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<UserType>[] = [
    { accessorKey: "email", header: t("Users.form.email.label"), validationSchema: emailSchema },
    { accessorKey: "role", header: t("Users.form.role.label"), validationSchema: roleSchema },
    {
      accessorKey: "created_at",
      header: t("Users.form.created_at.label"),
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date) return null;
        return new Date(date).toLocaleDateString();
      },
    },
  ];

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const tableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: UserType) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = users.filter((row) => newSelection[row.id!]);
      setSelectedRows(selectedRows.map((row) => row.id!));
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={users}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      onRowSelectionChange={(rows: UserType[]) => setSelectedRows(rows.map((row) => row.id!))}
      tableOptions={tableOptions}
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

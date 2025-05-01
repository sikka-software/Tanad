import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useBranchStore from "@/branch/branch.store";
import { Branch } from "@/branch/branch.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateBranch } from "./branch.hooks";

const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const phoneSchema = z.string().nullable();
const emailSchema = z.string().email().nullable();
const managerSchema = z.string().nullable();
const isActiveSchema = z.boolean();

const BranchesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Branch>) => {
  const t = useTranslations();
  const { mutate: updateBranch } = useUpdateBranch();
  const selectedRows = useBranchStore((state) => state.selectedRows);
  const setSelectedRows = useBranchStore((state) => state.setSelectedRows);

  const canEditBranch = useUserStore((state) => state.hasPermission("branches.update"));
  const canDuplicateBranch = useUserStore((state) => state.hasPermission("branches.duplicate"));
  const canViewBranch = useUserStore((state) => state.hasPermission("branches.view"));
  const canArchiveBranch = useUserStore((state) => state.hasPermission("branches.archive"));
  const canDeleteBranch = useUserStore((state) => state.hasPermission("branches.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Branch>[] = [
    { accessorKey: "name", header: t("Branches.form.name.label"), validationSchema: nameSchema },
    { accessorKey: "code", header: t("Branches.form.code.label"), validationSchema: codeSchema },
    {
      accessorKey: "address",
      header: t("Branches.form.address.label"),
      validationSchema: addressSchema,
    },
    { accessorKey: "city", header: t("Branches.form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("Branches.form.state.label"), validationSchema: stateSchema },
    {
      accessorKey: "zip_code",
      header: t("Branches.form.zip_code.label"),
      validationSchema: zipCodeSchema,
    },
    { accessorKey: "phone", header: t("Branches.form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "email", header: t("Branches.form.email.label"), validationSchema: emailSchema },
    {
      accessorKey: "manager",
      header: t("Branches.form.manager.label"),
      validationSchema: managerSchema,
    },
    {
      accessorKey: "is_active",
      header: t("Branches.form.is_active.label"),
      cell: ({ row }) => (row.getValue("is_active") ? t("active") : t("inactive")),
      validationSchema: isActiveSchema,
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "branch_id") return;
    await updateBranch({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Branch[]) => {
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

  const branchTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Branch) => row.id,
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
      canEditAction={canEditBranch}
      canDuplicateAction={canDuplicateBranch}
      canViewAction={canViewBranch}
      canArchiveAction={canArchiveBranch}
      canDeleteAction={canDeleteBranch}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={branchTableOptions}
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

export default BranchesTable;

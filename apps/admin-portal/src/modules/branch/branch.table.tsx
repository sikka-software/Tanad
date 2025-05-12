import SheetTable from "@root/src/components/ui/sheet-table";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useBranchColumns from "./branch.columns";
import { useUpdateBranch } from "./branch.hooks";
import useBranchStore from "./branch.store";
import { Branch } from "./branch.type";

const BranchesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Branch>) => {
  const t = useTranslations();

  const { mutate: updateBranch } = useUpdateBranch();

  const setData = useBranchStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateBranch({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useBranchColumns(handleEdit);

  const selectedRows = useBranchStore((state) => state.selectedRows);
  const setSelectedRows = useBranchStore((state) => state.setSelectedRows);

  const columnVisibility = useBranchStore((state) => state.columnVisibility);
  const setColumnVisibility = useBranchStore((state) => state.setColumnVisibility);

  const canEditBranch = useUserStore((state) => state.hasPermission("branches.update"));
  const canDuplicateBranch = useUserStore((state) => state.hasPermission("branches.duplicate"));
  const canViewBranch = useUserStore((state) => state.hasPermission("branches.view"));
  const canArchiveBranch = useUserStore((state) => state.hasPermission("branches.archive"));
  const canDeleteBranch = useUserStore((state) => state.hasPermission("branches.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
      enableColumnSizing={true}
      canEditAction={canEditBranch}
      canDuplicateAction={canDuplicateBranch}
      canViewAction={canViewBranch}
      canArchiveAction={canArchiveBranch}
      canDeleteAction={canDeleteBranch}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={branchTableOptions}
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

export default BranchesTable;

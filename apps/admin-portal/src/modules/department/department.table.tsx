import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateDepartment } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";
import { Department } from "@/department/department.type";

import useUserStore from "@/stores/use-user-store";

import useDepartmentColumns from "./department.columns";

const DepartmentsTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Department>) => {
  const t = useTranslations();

  const columns = useDepartmentColumns();

  const { mutateAsync: updateDepartment } = useUpdateDepartment();

  const setData = useDepartmentStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateDepartment({ id: rowId, data: { [columnId]: value } });
  };

  const canEditDepartment = useUserStore((state) => state.hasPermission("departments.update"));
  const canDuplicateDepartment = useUserStore((state) =>
    state.hasPermission("departments.duplicate"),
  );
  const canViewDepartment = useUserStore((state) => state.hasPermission("departments.view"));
  const canArchiveDepartment = useUserStore((state) => state.hasPermission("departments.archive"));
  const canDeleteDepartment = useUserStore((state) => state.hasPermission("departments.delete"));

  const selectedRows = useDepartmentStore((state) => state.selectedRows);
  const setSelectedRows = useDepartmentStore((state) => state.setSelectedRows);

  const columnVisibility = useDepartmentStore((state) => state.columnVisibility);
  const setColumnVisibility = useDepartmentStore((state) => state.setColumnVisibility);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Department[]) => {
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

  const departmentTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Department) => row.id!,
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
      canEditAction={canEditDepartment}
      canDuplicateAction={canDuplicateDepartment}
      canViewAction={canViewDepartment}
      canArchiveAction={canArchiveDepartment}
      canDeleteAction={canDeleteDepartment}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={departmentTableOptions}
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

export default DepartmentsTable;

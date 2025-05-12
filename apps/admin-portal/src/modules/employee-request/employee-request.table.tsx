import { useTranslations } from "next-intl";
import React from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateEmployeeRequest } from "@/employee-request/employee-request.hooks";
import useEmployeeRequestsStore from "@/employee-request/employee-request.store";
import { EmployeeRequest } from "@/employee-request/employee-request.type";

import useUserStore from "@/stores/use-user-store";

import useEmployeeRequestColumns from "./employee-request.columns";

const EmployeeRequestsTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<EmployeeRequest>) => {
  const t = useTranslations();

  const columns = useEmployeeRequestColumns();
  const { mutate: updateEmployeeRequest } = useUpdateEmployeeRequest();
  const setSelectedRows = useEmployeeRequestsStore((state) => state.setSelectedRows);
  const selectedRows = useEmployeeRequestsStore((state) => state.selectedRows);

  const columnVisibility = useEmployeeRequestsStore((state) => state.columnVisibility);
  const setColumnVisibility = useEmployeeRequestsStore((state) => state.setColumnVisibility);

  const canEditEmployeeRequest = useUserStore((state) =>
    state.hasPermission("employee_requests.update"),
  );
  const canDuplicateEmployeeRequest = useUserStore((state) =>
    state.hasPermission("employee_requests.duplicate"),
  );
  const canViewEmployeeRequest = useUserStore((state) =>
    state.hasPermission("employee_requests.view"),
  );
  const canArchiveEmployeeRequest = useUserStore((state) =>
    state.hasPermission("employee_requests.archive"),
  );
  const canDeleteEmployeeRequest = useUserStore((state) =>
    state.hasPermission("employee_requests.delete"),
  );

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateEmployeeRequest({ id: rowId, updates: { [columnId]: value } });
  };

  const handleRowSelectionChange = (rows: EmployeeRequest[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    // Only update if the selection has actually changed
    const currentSelection = new Set(selectedRows);
    const newSelection = new Set(newSelectedIds);

    if (
      newSelection.size !== currentSelection.size ||
      !Array.from(newSelection).every((id) => currentSelection.has(id))
    ) {
      setSelectedRows(newSelectedIds);
    }
  };

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const employeeRequestTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: EmployeeRequest) => row.id!,
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
      canEditAction={canEditEmployeeRequest}
      canDuplicateAction={canDuplicateEmployeeRequest}
      canViewAction={canViewEmployeeRequest}
      canArchiveAction={canArchiveEmployeeRequest}
      canDeleteAction={canDeleteEmployeeRequest}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={employeeRequestTableOptions}
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

export default EmployeeRequestsTable;

import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useJobs } from "@/job/job.hooks";

import { useDepartments } from "@/department/department.hooks";

import { useUpdateEmployee } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import { Employee, EmployeeUpdateData } from "@/employee/employee.types";

import useUserStore from "@/stores/use-user-store";

import useEmployeeColumns from "./employee.columns";

const EmployeesTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Employee>) => {
  const t = useTranslations();
  const { data: departments } = useDepartments();
  const { mutateAsync: updateEmployee } = useUpdateEmployee();

  // Create a memoized handleEdit function
  const handleEdit = useCallback(
    // TODO: add optimistic update
    (rowId: string, columnId: string, value: unknown) => {
      let updates: EmployeeUpdateData = {};

      if (columnId === "department_id") {
      } else if (columnId === "status") {
        updates.status = value as "active" | "inactive" | "on_leave" | "terminated";
      } else {
        // For other fields, directly update
        updates = { [columnId]: value };
      }

      // Track this update in our pending updates
      setPendingUpdates((prev) => ({
        ...prev,
        [rowId]: { ...(prev[rowId] || {}), ...updates },
      }));

      // Immediately apply to our current data view
      setCurrentData((current) =>
        current.map((employee) => (employee.id === rowId ? { ...employee, ...updates } : employee)),
      );

      // Send to the server
      updateEmployee(
        { id: rowId, updates },
        {
          onSuccess: () => {
            // On success, clear this item from pending updates
            setPendingUpdates((prev) => {
              const { [rowId]: _, ...rest } = prev;
              return rest;
            });
          },
          onError: () => {
            // On error, revert this specific update
            setPendingUpdates((prev) => {
              const { [rowId]: _, ...rest } = prev;
              return rest;
            });

            // Also revert our current data view for this row
            setCurrentData((current) =>
              current.map((employee) =>
                employee.id === rowId
                  ? data.find((e) => e.id === rowId) || employee // Revert to original
                  : employee,
              ),
            );
          },
        },
      );
    },
    [data, departments, updateEmployee],
  );

  const columns = useEmployeeColumns(handleEdit);

  const selectedRows = useEmployeeStore((state) => state.selectedRows);
  const setSelectedRows = useEmployeeStore((state) => state.setSelectedRows);

  const columnVisibility = useEmployeeStore((state) => state.columnVisibility);
  const setColumnVisibility = useEmployeeStore((state) => state.setColumnVisibility);

  const canEditEmployee = useUserStore((state) => state.hasPermission("employees.update"));
  const canDuplicateEmployee = useUserStore((state) => state.hasPermission("employees.duplicate"));
  const canViewEmployee = useUserStore((state) => state.hasPermission("employees.view"));
  const canArchiveEmployee = useUserStore((state) => state.hasPermission("employees.archive"));
  const canDeleteEmployee = useUserStore((state) => state.hasPermission("employees.delete"));

  const [currentData, setCurrentData] = useState<Employee[]>(data);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, EmployeeUpdateData>>({});

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const handleRowSelectionChange = useCallback(
    (rows: Employee[]) => {
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

  const employeeTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Employee) => row.id!,
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
      canEditAction={canEditEmployee}
      canDuplicateAction={canDuplicateEmployee}
      canViewAction={canViewEmployee}
      canArchiveAction={canArchiveEmployee}
      canDeleteAction={canDeleteEmployee}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={employeeTableOptions}
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

export default EmployeesTable;

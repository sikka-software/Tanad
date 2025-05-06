import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useDepartments } from "@/department/department.hooks";

import { useUpdateEmployee } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import { Employee } from "@/employee/employee.types";

import useUserStore from "@/stores/use-user-store";

const EmployeesTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Employee>) => {
  const t = useTranslations();
  const { data: departments } = useDepartments();
  const { mutateAsync: updateEmployee } = useUpdateEmployee();
  const selectedRows = useEmployeeStore((state) => state.selectedRows);
  const setSelectedRows = useEmployeeStore((state) => state.setSelectedRows);

  const canEditEmployee = useUserStore((state) => state.hasPermission("employees.update"));
  const canDuplicateEmployee = useUserStore((state) => state.hasPermission("employees.duplicate"));
  const canViewEmployee = useUserStore((state) => state.hasPermission("employees.view"));
  const canArchiveEmployee = useUserStore((state) => state.hasPermission("employees.archive"));
  const canDeleteEmployee = useUserStore((state) => state.hasPermission("employees.delete"));

  const [currentData, setCurrentData] = useState<Employee[]>(data);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Employee>>>({});

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: t("Employees.form.first_name.label"),
      validationSchema: z.string().min(1, t("Employees.form.first_name.required")),
    },
    {
      accessorKey: "last_name",
      header: t("Employees.form.last_name.label"),
      validationSchema: z.string().min(1, t("Employees.form.last_name.required")),
    },
    {
      accessorKey: "email",
      header: t("Employees.form.email.label"),
      validationSchema: z.string().email(t("Employees.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Employees.form.phone.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "position",
      header: t("Employees.form.position.label"),
      validationSchema: z.string().min(1, t("Employees.form.position.required")),
    },
    {
      accessorKey: "department_id",
      header: t("Employees.form.department.label"),
      validationSchema: z.string().optional(),
      cellType: "select",
      options: departments?.map((department) => ({
        label: department.name,
        value: department.id,
      })),
      cell: ({ row }) => {
        const department = departments?.find((d) => d.id === row.original.department_id);
        return department?.name || "";
      },
    },
    {
      accessorKey: "status",
      header: t("Employees.form.status.label"),
      validationSchema: z.enum(["active", "inactive", "on_leave", "terminated", "resigned"]),
      cellType: "select",
      options: [
        { label: t("Employees.form.status.active"), value: "active" },
        { label: t("Employees.form.status.inactive"), value: "inactive" },
        { label: t("Employees.form.status.on_leave"), value: "on_leave" },
        { label: t("Employees.form.status.terminated"), value: "terminated" },
        { label: t("Employees.form.status.resigned"), value: "resigned" },
      ],
    },
  ];

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

  // Create a memoized handleEdit function
  const handleEdit = useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      let updates: Partial<Employee> = {};

      if (columnId === "department_id") {
        // For department changes, handle department_id and department name
        const department_id = value as string;
        const department = departments?.find((d) => d.id === department_id);

        if (department) {
          updates = {
            department_id: department_id,
            department: department.name, // Set both department_id and department name
          };
        } else {
          updates = {
            department_id: null,
            department: null,
          };
        }
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
      canEditAction={canEditEmployee}
      canDuplicateAction={canDuplicateEmployee}
      canViewAction={canViewEmployee}
      canArchiveAction={canArchiveEmployee}
      canDeleteAction={canDeleteEmployee}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={employeeTableOptions}
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

export default EmployeesTable;

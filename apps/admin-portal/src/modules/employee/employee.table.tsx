import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useDepartments } from "@/modules/department/department.hooks";
import { useUpdateEmployee } from "@/modules/employee/employee.hooks";
import { useEmployeesStore } from "@/modules/employee/employee.store";
import { Employee } from "@/modules/employee/employee.types";

const nameSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const phoneSchema = z.string().optional();
const positionSchema = z.string().min(1, "Required");
const departmentSchema = z.string().optional();
const statusSchema = z.enum(["active", "inactive", "on_leave"]);

interface EmployeesTableProps {
  data: Employee[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (selectedRows: Employee[]) => void;
}

const EmployeesTable = ({ data, isLoading, error, onSelectedRowsChange }: EmployeesTableProps) => {
  const t = useTranslations();
  const { data: departments } = useDepartments();
  const { mutateAsync: updateEmployee } = useUpdateEmployee();
  const selectedRows = useEmployeesStore((state) => state.selectedRows);
  const setSelectedRows = useEmployeesStore((state) => state.setSelectedRows);
  const [currentData, setCurrentData] = useState<Employee[]>(data);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Employee>>>({});

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: t("Employees.form.first_name.label"),
      validationSchema: nameSchema,
    },
    {
      accessorKey: "last_name",
      header: t("Employees.form.last_name.label"),
      validationSchema: nameSchema,
    },
    {
      accessorKey: "email",
      header: t("Employees.form.email.label"),
      validationSchema: emailSchema,
    },
    {
      accessorKey: "phone",
      header: t("Employees.form.phone.label"),
      validationSchema: phoneSchema,
    },
    {
      accessorKey: "position",
      header: t("Employees.form.position.label"),
      validationSchema: positionSchema,
    },
    {
      accessorKey: "department_id",
      header: t("Employees.form.department.label"),
      validationSchema: departmentSchema,
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
      validationSchema: statusSchema,
      cellType: "select",
      options: [
        { label: t("Employees.form.status.active"), value: "active" },
        { label: t("Employees.form.status.inactive"), value: "inactive" },
        { label: t("Employees.form.status.on_leave"), value: "on_leave" },
        { label: t("Employees.form.status.terminated"), value: "terminated" },
      ],
    },
  ];

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const handleRowSelectionChange = useCallback(
    (rows: Employee[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      const currentSelection = new Set(selectedRows);
      const newSelection = new Set(newSelectedIds);

      if (
        newSelection.size !== currentSelection.size ||
        !Array.from(newSelection).every((id) => currentSelection.has(id))
      ) {
        setSelectedRows(newSelectedIds);
        if (onSelectedRowsChange) {
          onSelectedRowsChange(rows);
        }
      }
    },
    [selectedRows, setSelectedRows, onSelectedRowsChange],
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
      data={currentData.length > 0 ? currentData : data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={employeeTableOptions}
    />
  );
};

export default EmployeesTable;

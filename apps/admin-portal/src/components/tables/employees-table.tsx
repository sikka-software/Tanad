import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useDepartments } from "@/hooks/useDepartments";
import { useEmployeesStore } from "@/stores/employees.store";
import { Employee } from "@/types/employee.type";

const nameSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const phoneSchema = z.string().optional();
const positionSchema = z.string().min(1, "Required");
const departmentSchema = z.string().optional();

const EmployeesTable = ({ data, isLoading, error }: EmployeesTableProps) => {
  const t = useTranslations();
  const { updateEmployee } = useEmployeesStore();
  const { data: departments } = useDepartments();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "department") {
      // When editing department, we need to update the departmentId
      const departmentId = value as string;
      await updateEmployee(rowId, { departmentId });
    } else {
      await updateEmployee(rowId, { [columnId]: value });
    }
  };

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
      accessorKey: "department",
      header: t("Employees.form.department.label"),
      validationSchema: departmentSchema,
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

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

interface EmployeesTableProps {
  data: Employee[];
  isLoading?: boolean;
  error?: Error | null;
}

export default EmployeesTable;

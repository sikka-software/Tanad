import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const columns = [
    { accessorKey: "name", header: t("Employees.form.name.label"), validationSchema: nameSchema },
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateEmployee(rowId, { [columnId]: value });
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        {t("General.error")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

interface EmployeesTableProps {
  data: Employee[];
  isLoading?: boolean;
  error?: Error | null;
}

export default EmployeesTable;

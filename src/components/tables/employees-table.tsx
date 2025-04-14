import React from "react";

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

const columns = [
  { accessorKey: "name", header: "Name", validationSchema: nameSchema },
  { accessorKey: "email", header: "Email", validationSchema: emailSchema },
  { accessorKey: "phone", header: "Phone", validationSchema: phoneSchema },
  { accessorKey: "position", header: "Position", validationSchema: positionSchema },
  { accessorKey: "department", header: "Department", validationSchema: departmentSchema },
];

interface EmployeesTableProps {
  data: Employee[];
  isLoading?: boolean;
  error?: Error | null;
}

const EmployeesTable = ({ data, isLoading, error }: EmployeesTableProps) => {
  const { updateEmployee } = useEmployeesStore();

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
        Error loading employees: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default EmployeesTable;

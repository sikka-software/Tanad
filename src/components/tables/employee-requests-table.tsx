import React from "react";

import { useTranslations } from "next-intl";

import { format } from "date-fns";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
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
import { useEmployeeRequestsStore } from "@/stores/employee-requests.store";
import { EmployeeRequest } from "@/types/employee-request.type";

const titleSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().optional();
const notesSchema = z.string().optional();

interface EmployeeRequestsTableProps {
  data: EmployeeRequest[];
  isLoading?: boolean;
  error?: Error | null;
}

const EmployeeRequestsTable = ({ data, isLoading, error }: EmployeeRequestsTableProps) => {
  const t = useTranslations();
  const { updateRequest } = useEmployeeRequestsStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateRequest(rowId, { [columnId]: value });
  };

  const columns = [
    {
      accessorKey: "employeeName",
      header: t("EmployeeRequests.table.employee"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) => row.original.employeeName,
    },
    {
      accessorKey: "type",
      header: t("EmployeeRequests.table.type"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: t("EmployeeRequests.table.title"),
      validationSchema: titleSchema,
    },
    {
      accessorKey: "status",
      header: t("EmployeeRequests.table.status"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) => {
        const variant =
          row.original.status === "approved"
            ? "secondary"
            : row.original.status === "rejected"
              ? "destructive"
              : "default";
        return (
          <Badge variant={variant} className="capitalize">
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: t("EmployeeRequests.table.startDate"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.startDate ? format(new Date(row.original.startDate), "PP") : "-",
    },
    {
      accessorKey: "endDate",
      header: t("EmployeeRequests.table.endDate"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.endDate ? format(new Date(row.original.endDate), "PP") : "-",
    },
    {
      accessorKey: "amount",
      header: t("EmployeeRequests.table.amount"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.amount ? `$${row.original.amount.toFixed(2)}` : "-",
    },
    {
      accessorKey: "description",
      header: t("EmployeeRequests.table.description"),
      validationSchema: descriptionSchema,
    },
    {
      accessorKey: "notes",
      header: t("EmployeeRequests.table.notes"),
      validationSchema: notesSchema,
    },
  ];

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 8 }).map((_, colIndex) => (
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
      <div className="m-4 mb-0 max-w-md rounded bg-red-800 p-2 text-center text-white mx-auto">
        {t("General.error")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default EmployeeRequestsTable;

import React from "react";

import { useTranslations } from "next-intl";

import { format } from "date-fns";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
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

  const columns: ExtendedColumnDef<EmployeeRequest>[] = [
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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default EmployeeRequestsTable;

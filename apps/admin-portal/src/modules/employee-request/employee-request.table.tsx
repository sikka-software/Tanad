import { format } from "date-fns";
import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import { Badge } from "@/ui/badge";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { EmployeeRequest } from "@/modules/employee-request/employee-request.type";

import { useEmployeeRequestsStore } from "@/modules/employee-request/employee-request.store";

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
      accessorKey: "type",
      header: t("EmployeeRequests.form.type.label"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: t("EmployeeRequests.form.title.label"),
      validationSchema: titleSchema,
    },
    {
      accessorKey: "status",
      header: t("EmployeeRequests.form.status.label"),
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
      header: t("EmployeeRequests.form.date_range.start"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.startDate ? format(new Date(row.original.startDate), "PP") : "-",
    },
    {
      accessorKey: "endDate",
      header: t("EmployeeRequests.form.date_range.end"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.endDate ? format(new Date(row.original.endDate), "PP") : "-",
    },
    {
      accessorKey: "amount",
      header: t("EmployeeRequests.form.amount.label"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.amount ? `$${row.original.amount.toFixed(2)}` : "-",
    },
    {
      accessorKey: "description",
      header: t("EmployeeRequests.form.description.label"),
      validationSchema: descriptionSchema,
    },
    {
      accessorKey: "notes",
      header: t("EmployeeRequests.form.notes.label"),
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

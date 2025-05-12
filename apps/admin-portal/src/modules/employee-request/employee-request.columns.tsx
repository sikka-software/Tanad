import { Badge } from "@root/src/components/ui/badge";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { EmployeeRequest } from "./employee-request.type";

const useEmployeeRequestColumns = () => {
  const t = useTranslations();

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
      validationSchema: z.string().min(1, t("EmployeeRequests.form.title.required")),
    },

    {
      accessorKey: "start_date",
      header: t("EmployeeRequests.form.date_range.start"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.start_date ? format(new Date(row.original.start_date), "PP") : "-",
    },
    {
      accessorKey: "end_date",
      header: t("EmployeeRequests.form.date_range.end"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.end_date ? format(new Date(row.original.end_date), "PP") : "-",
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
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "notes",
      header: t("EmployeeRequests.form.notes.label"),
      validationSchema: z.string().nullable(),
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
  ];

  return columns;
};

export default useEmployeeRequestColumns;

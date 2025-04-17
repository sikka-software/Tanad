import { useTranslations } from "next-intl";

import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";

import { JobListing } from "@/types/job-listing.type";

interface JobListingsTableProps {
  data: JobListing[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (rows: JobListing[]) => void;
}

export default function JobListingsTable({
  data,
  isLoading,
  error,
  onSelectedRowsChange,
}: JobListingsTableProps) {
  const t = useTranslations("Jobs");

  const columns: ExtendedColumnDef<JobListing>[] = [
    {
      accessorKey: "title",
      header: t("form.title.label"),
    },
    {
      accessorKey: "description",
      header: t("form.description.label"),
    },
    {
      accessorKey: "status",
      header: t("form.status.label"),
    },
    {
      accessorKey: "created_at",
      header: t("form.created_at.label"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString();
      },
    },
  ];

  if (isLoading) {
    return <TableSkeleton columns={columns.map((col) => (col.accessorKey || col.id)!)} rows={5} />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <SheetTable
      data={data}
      columns={columns}
      enableRowSelection={true}
      onRowSelectionChange={onSelectedRowsChange}
      tableOptions={{
        state: {
          rowSelection: {},
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row) => row.id!,
      }}
    />
  );
}

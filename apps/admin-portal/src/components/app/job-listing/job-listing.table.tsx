import { useTranslations } from "next-intl";

import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import ErrorComponent from "@/components/ui/error-component";

import { JobListing } from "@/types/job-listing.type";
import useJobListingsStore from "@/stores/job-listings.store";

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
  const selectedRows = useJobListingsStore((state) => state.selectedRows);

  const rowSelection = selectedRows.reduce(
    (acc, id) => {
      acc[id] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

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
      accessorKey: "is_active",
      header: t("form.status.label"),
      cell: ({ row }) => (row.getValue("is_active") ? t("status.active") : t("status.inactive")),
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
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <SheetTable
      data={data}
      columns={columns}
      enableRowSelection
      onRowSelectionChange={onSelectedRowsChange}
      tableOptions={{
        state: {
          rowSelection,
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row) => row.id,
        onRowSelectionChange: (updater: any) => {
          const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
          const selectedRows = data.filter((row) => newSelection[row.id]);
          onSelectedRowsChange?.(selectedRows);
        },
      }}
    />
  );
}

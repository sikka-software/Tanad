import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useUpdateJobListing } from "./job-listing.hooks";
import { useJobListingsStore } from "./job-listing.store";
import { JobListing } from "./job-listing.type";

const titleSchema = z.string().min(1, "Required");
const descriptionSchema = z.string().min(1, "Required");
const is_activeSchema = z.boolean();
const slugSchema = z.string().min(1, "Required");

interface JobListingsTableProps {
  data: JobListing[];
  isLoading?: boolean;
  error?: Error | null;
}

const JobListingsTable = ({ data, isLoading, error }: JobListingsTableProps) => {
  const t = useTranslations();
  const { mutate: updateJobListing } = useUpdateJobListing();
  const selectedRows = useJobListingsStore((state) => state.selectedRows);
  const setSelectedRows = useJobListingsStore((state) => state.setSelectedRows);

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<JobListing>[] = [
    {
      accessorKey: "title",
      header: t("JobListings.form.title.label"),
      validationSchema: titleSchema,
    },
    {
      accessorKey: "description",
      header: t("JobListings.form.description.label"),
      validationSchema: descriptionSchema,
    },
    {
      accessorKey: "is_active",
      header: t("JobListings.form.is_active.label"),
      validationSchema: is_activeSchema,
    },
    { accessorKey: "slug", header: t("JobListings.form.slug.label"), validationSchema: slugSchema },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "job_listing_id") return;
    await updateJobListing({ id: rowId, jobListing: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: JobListing[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const jobListingTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: JobListing) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={jobListingTableOptions}
    />
  );
};

export default JobListingsTable;

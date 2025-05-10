import { cn } from "@root/src/lib/utils";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import { Badge } from "@/ui/badge";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateJobListing } from "./job-listing.hooks";
import useJobListingsStore from "./job-listing.store";
import { JobListingWithJobs } from "./job-listing.type";

const JobListingsTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<JobListingWithJobs>) => {
  const t = useTranslations();
  const { mutate: updateJobListing } = useUpdateJobListing();
  const selectedRows = useJobListingsStore((state) => state.selectedRows);
  const setSelectedRows = useJobListingsStore((state) => state.setSelectedRows);

  const canEditJobListing = useUserStore((state) => state.hasPermission("job_listings.update"));
  const canDuplicateJobListing = useUserStore((state) =>
    state.hasPermission("job_listings.duplicate"),
  );
  const canViewJobListing = useUserStore((state) => state.hasPermission("job_listings.view"));
  const canArchiveJobListing = useUserStore((state) => state.hasPermission("job_listings.archive"));
  const canDeleteJobListing = useUserStore((state) => state.hasPermission("job_listings.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<JobListingWithJobs>[] = [
    {
      accessorKey: "title",
      header: t("JobListings.form.title.label"),
      validationSchema: z.string().min(1, t("JobListings.form.title.required")),
    },
    {
      accessorKey: "description",
      header: t("JobListings.form.description.label"),
      validationSchema: z.string().min(1, t("JobListings.form.description.required")),
    },

    {
      accessorKey: "slug",
      header: t("JobListings.form.slug.label"),
      validationSchema: z.string().min(1, t("JobListings.form.slug.required")),
    },
    {
      accessorKey: "jobs_count",
      header: t("JobListings.jobs_count.label", { defaultMessage: "Jobs" }),
      enableEditing: false,
      cell: ({ row }) => row.original.jobs_count,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("JobListings.form.status.label"),
      validationSchema: z.boolean(),
      cellType: "status",
      options: [
        { value: "active", label: t("JobListings.form.status.active") },
        { value: "inactive", label: t("JobListings.form.status.inactive") },
      ],
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "job_listing_id") return;
    await updateJobListing({ id: rowId, jobListing: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: JobListingWithJobs[]) => {
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
    getRowId: (row: JobListingWithJobs) => row.id!,
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
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditJobListing}
      canDuplicateAction={canDuplicateJobListing}
      canViewAction={canViewJobListing}
      canArchiveAction={canArchiveJobListing}
      canDeleteAction={canDeleteJobListing}
      canPreviewAction={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={jobListingTableOptions}
      onActionClicked={onActionClicked}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
        preview: t("General.preview"),
      }}
    />
  );
};

export default JobListingsTable;

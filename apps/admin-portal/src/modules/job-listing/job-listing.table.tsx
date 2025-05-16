import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useJobListingColumns from "./job-listing.columns";
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
  const setData = useJobListingsStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateJobListing({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useJobListingColumns(handleEdit);

  const columnVisibility = useJobListingsStore((state) => state.columnVisibility);
  const setColumnVisibility = useJobListingsStore((state) => state.setColumnVisibility);

  const selectedRows = useJobListingsStore((state) => state.selectedRows);
  const setSelectedRows = useJobListingsStore((state) => state.setSelectedRows);

  const canEditJobListing = useUserStore((state) => state.hasPermission("job_listings.update"));
  const canDuplicateJobListing = useUserStore((state) =>
    state.hasPermission("job_listings.duplicate"),
  );
  const canViewJobListing = useUserStore((state) => state.hasPermission("job_listings.view"));
  const canArchiveJobListing = useUserStore((state) => state.hasPermission("job_listings.archive"));
  const canDeleteJobListing = useUserStore((state) => state.hasPermission("job_listings.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
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
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
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

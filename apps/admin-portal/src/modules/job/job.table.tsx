import { useTranslations } from "next-intl";
import React from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateJob } from "@/job/job.hooks";
import useJobsStore from "@/job/job.store";
import { Job } from "@/job/job.type";

import useUserStore from "@/stores/use-user-store";

import useJobColumns from "./job.columns";

const JobTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Job>) => {
  const t = useTranslations();
  const { mutate: updateJob } = useUpdateJob();
  const setData = useJobsStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateJob({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useJobColumns(handleEdit);

  const selectedRows = useJobsStore((state) => state.selectedRows);
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);

  const columnVisibility = useJobsStore((state) => state.columnVisibility);
  const setColumnVisibility = useJobsStore((state) => state.setColumnVisibility);

  const canEditJob = useUserStore((state) => state.hasPermission("jobs.update"));
  const canDuplicateJob = useUserStore((state) => state.hasPermission("jobs.duplicate"));
  const canViewJob = useUserStore((state) => state.hasPermission("jobs.view"));
  const canArchiveJob = useUserStore((state) => state.hasPermission("jobs.archive"));
  const canDeleteJob = useUserStore((state) => state.hasPermission("jobs.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = (rows: Job[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    // Only update if the selection has actually changed
    const currentSelection = new Set(selectedRows);
    const newSelection = new Set(newSelectedIds);

    if (
      newSelection.size !== currentSelection.size ||
      !Array.from(newSelection).every((id) => currentSelection.has(id))
    ) {
      setSelectedRows(newSelectedIds);
    }
  };

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const jobTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Job) => row.id!,
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
      canEditAction={canEditJob}
      canDuplicateAction={canDuplicateJob}
      canViewAction={canViewJob}
      canArchiveAction={canArchiveJob}
      canDeleteAction={canDeleteJob}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={jobTableOptions}
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
      }}
    />
  );
};

export default JobTable;

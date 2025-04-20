import { type CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import useJobsStore from "@/modules/job/job.store";
import { Job } from "@/modules/job/job.type";

import { useUpdateJob } from "./job.hooks";

const titleSchema = z.string().min(1, "Required");
const typeSchema = z.string().min(1, "Required");
const departmentSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const salarySchema = z.number().min(0, "Salary must be positive");
const is_activeSchema = z.boolean();

interface JobTableProps {
  data: Job[];
  isLoading?: boolean;
  error?: Error | null;
  onActionClicked: (action: string, rowId: string) => void;
}

const JobTable = ({ data, isLoading, error, onActionClicked }: JobTableProps) => {
  const t = useTranslations();
  const { mutateAsync: updateJob } = useUpdateJob();
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const selectedRows = useJobsStore((state) => state.selectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: t("Jobs.form.title.label"),
      validationSchema: titleSchema,
    },
    {
      accessorKey: "type",
      header: t("Jobs.form.type.label"),
      validationSchema: typeSchema,
    },
    {
      accessorKey: "department",
      header: t("Jobs.form.department.label"),
      validationSchema: departmentSchema,
    },
    {
      accessorKey: "location",
      header: t("Jobs.form.location.label"),
      validationSchema: locationSchema,
    },
    {
      accessorKey: "salary",
      header: t("Jobs.form.salary.label"),
      validationSchema: salarySchema,
      cell: (props: CellContext<Job, unknown>) =>
        props.row.original.salary ? `$${Number(props.row.original.salary).toFixed(2)}` : "N/A",
    },
    {
      accessorKey: "is_active",
      header: t("Jobs.form.is_active.label"),
      validationSchema: is_activeSchema,
      cell: (props: CellContext<Job, unknown>) => (props.row.original.is_active ? "Yes" : "No"),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateJob({ id: rowId, data: { [columnId]: value } });
  };

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
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
      id="job-table"
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      onActionClicked={onActionClicked}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={jobTableOptions}
    />
  );
};

export default JobTable;

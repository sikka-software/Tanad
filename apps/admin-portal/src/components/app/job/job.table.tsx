import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Job } from "@/types/job.type";

import { jobs } from "@/db/schema";
import { useJobsStore } from "@/stores/jobs.store";

const titleSchema = z.string().min(1, "Required");
const typeSchema = z.string().min(1, "Required");
const departmentSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const salarySchema = z.number().min(0, "Salary must be positive");
const descriptionSchema = z.string().optional();
const is_activeSchema = z.boolean();

interface JobTableProps {
  data: Job[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectedRowsChange?: (rows: Job[]) => void;
}

export function JobTable({ data, isLoading, error, onSelectedRowsChange }: JobTableProps) {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Job>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: "title",
      header: t("Job.form.title.label"),
      cell: ({ row }) => row.getValue("title"),
      validationSchema: titleSchema,
    },
    {
      accessorKey: "type",
      header: t("Job.form.type.label"),
      cell: ({ row }) => row.getValue("type"),
      validationSchema: typeSchema,
    },
    {
      accessorKey: "department",
      header: t("Job.form.department.label"),
      cell: ({ row }) => row.getValue("department"),
      validationSchema: departmentSchema,
    },
    {
      accessorKey: "location",
      header: t("Job.form.location.label"),
      cell: ({ row }) => row.getValue("location"),
      validationSchema: locationSchema,
    },
    {
      accessorKey: "salary",
      header: t("Job.form.salary.label"),
      cell: ({ row }) => row.getValue("salary"),
      validationSchema: salarySchema,
    },
    {
      accessorKey: "is_active",
      header: t("Job.form.is_active.label"),
      cell: ({ row }) => (row.getValue("is_active") ? "Yes" : "No"),
      validationSchema: is_activeSchema,
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

  return (
    <SheetTable
      data={data}
      columns={columns}
      onSelectedRowsChange={onSelectedRowsChange}
      enableRowSelection
      enableMultiRowSelection
      getRowId={(row) => row.id}
    />
  );
}

import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
import { useJobsStore } from "@/stores/jobs.store";
import { Job } from "@/types/job.type";

const titleSchema = z.string().min(1, "Required");
const typeSchema = z.string().min(1, "Required");
const departmentSchema = z.string().min(1, "Required");
const locationSchema = z.string().min(1, "Required");
const salarySchema = z.number().min(0, "Salary must be positive");
const descriptionSchema = z.string().optional();
const isActiveSchema = z.boolean();

interface JobsTableProps {
  data: Job[];
  isLoading?: boolean;
  error?: Error | null;
}

const JobsTable = ({ data, isLoading, error }: JobsTableProps) => {
  const t = useTranslations("Jobs");
  const { updateJob } = useJobsStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateJob(rowId, { [columnId]: value });
  };

  const columns: ExtendedColumnDef<Job>[] = [
    { accessorKey: "title", header: t("form.title.label"), validationSchema: titleSchema },
    { accessorKey: "type", header: t("form.type.label"), validationSchema: typeSchema },
    {
      accessorKey: "department",
      header: t("form.department.label"),
      validationSchema: departmentSchema,
    },
    { accessorKey: "location", header: t("form.location.label"), validationSchema: locationSchema },
    { accessorKey: "salary", header: t("form.salary.label"), validationSchema: salarySchema },
    {
      accessorKey: "description",
      header: t("form.description.label"),
      validationSchema: descriptionSchema,
    },
    {
      accessorKey: "isActive",
      header: t("form.is_active.label"),
      validationSchema: isActiveSchema,
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

export default JobsTable;

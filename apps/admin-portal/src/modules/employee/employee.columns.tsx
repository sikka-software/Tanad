import SelectCell from "@root/src/components/tables/select-cell";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { useJobs } from "../job/job.hooks";
import { Employee } from "./employee.types";

const useCompanyColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const { data: jobs } = useJobs();

  const columns: ExtendedColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: t("Employees.form.first_name.label"),
      validationSchema: z.string().min(1, t("Employees.form.first_name.required")),
    },
    {
      accessorKey: "last_name",
      header: t("Employees.form.last_name.label"),
      validationSchema: z.string().min(1, t("Employees.form.last_name.required")),
    },
    {
      accessorKey: "email",
      dir: "ltr",
      header: t("Employees.form.email.label"),
      validationSchema: z.string().email(t("Employees.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Employees.form.phone.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "job_id",
      header: t("Employees.form.job.label"),
      validationSchema: z.string().min(1, t("Employees.form.job.required")),
      cell: ({ row }) => {
        const jobId = row.original.job_id;
        const job = jobs?.find((j) => j.id === jobId);
        return job ? job.title : jobId || "-";
      },
    },
    {
      accessorKey: "nationality",
      header: t("Employees.form.nationality.label"),
      maxSize: 100,
      validationSchema: z.string().min(1, t("Employees.form.nationality.required")),
    },
    {
      accessorKey: "status",
      maxSize: 100,
      header: t("Employees.form.status.label"),
      validationSchema: z.enum(["active", "inactive", "on_leave", "terminated", "resigned"]),
      noPadding: true,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={[
            { label: t("Employees.form.status.active"), value: "active" },
            { label: t("Employees.form.status.inactive"), value: "inactive" },
            { label: t("Employees.form.status.on_leave"), value: "on_leave" },
            { label: t("Employees.form.status.terminated"), value: "terminated" },
            { label: t("Employees.form.status.resigned"), value: "resigned" },
          ]}
        />
      ),
    },
  ];

  return columns;
};

export default useCompanyColumns;

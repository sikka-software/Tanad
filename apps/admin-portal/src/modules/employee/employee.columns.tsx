import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import SelectCell from "@/components/tables/select-cell";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/components/ui/sheet-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useJobs } from "../job/job.hooks";
import { Employee, EmployeeStatus } from "./employee.types";

const useCompanyColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const locale = useLocale();

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
      // cell: ({ row }) => {
      //   const jobId = row.original.job_id;
      //   const job = jobs?.find((j) => j.id === jobId);
      //   return job ? job.title : jobId || "-";
      // },

      noPadding: true,

      cell: ({ row }) => {
        const employee = row.original;
        return (
          <ComboboxAdd
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={jobs || []}
            labelKey="title"
            valueKey="id"
            isLoading={jobsLoading}
            buttonClassName="bg-transparent"
            defaultValue={employee.job_id || ""}
            onChange={async (value) => {
              handleEdit?.(employee.id, "job_id", value);
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Offices.form.manager.no_employees"),
            }}
            addText={t("Pages.Employees.add")}
            ariaInvalid={false}
            renderOption={(option) => {
              return (
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span>{option.title}</span>
                    <span className="text-xs text-gray-500">{option.department}</span>
                  </div>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger>
                      <span className="text-xs text-gray-500">
                        {option.occupied_positions} / {option.total_positions}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("Jobs.form.occupied_positions.label") +
                        " / " +
                        t("Jobs.form.total_positions.label")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            }}
          />
        );
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
      header: t("Employees.form.status.label"),
      validationSchema: z.string().min(1, t("Employees.form.status.required")),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={EmployeeStatus.map((status) => ({
            label: t(`Employees.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default useCompanyColumns;

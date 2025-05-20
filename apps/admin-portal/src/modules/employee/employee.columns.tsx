import { CalendarDate, parseDate } from "@internationalized/date";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useDateFormatter } from "react-aria";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import CountryInput from "@/components/ui/inputs/country-input";
import { DateInput } from "@/components/ui/inputs/date-input";

import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { formatToYYYYMMDD, useFormatDate } from "@/lib/date-utils";
import { dateTableFilterFn } from "@/lib/table-filter-fns";

import { Employee, EmployeeStatus } from "@/employee/employee.types";

import { useJobs } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";

const useEmployeeColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const { data: jobs, isLoading: isFetchingJobs } = useJobs();
  const setIsJobDialogOpen = useJobStore((state) => state.setIsFormDialogOpen);
  const locale = useLocale();

  const dateFormatter = useDateFormatter();
  const columns: ExtendedColumnDef<Employee>[] = [
    {
      accessorKey: "first_name",
      header: t("Employees.form.first_name.label"),
    },
    {
      accessorKey: "last_name",
      header: t("Employees.form.last_name.label"),
    },
    {
      accessorKey: "email",
      dir: "ltr",
      header: t("Employees.form.email.label"),
    },
    {
      accessorKey: "phone",
      header: t("Employees.form.phone.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "birth_date",
      filterFn: dateTableFilterFn,
      header: t("Employees.form.birth_date.label"),
      noPadding: true,
      enableEditing: false,
      // cell: ({ row }) => useFormatDate(row.original.birth_date),
      cell: ({ row }) => {
        // Initialize local state from row.original.birth_date
        // row.original.birth_date is expected to be an ISO string ("YYYY-MM-DD") or null.
        const [birthDate, setBirthDate] = useState<CalendarDate | null>(() => {
          if (row.original.birth_date) {
            try {
              return parseDate(row.original.birth_date);
            } catch (error) {
              console.error("Failed to parse initial birth_date:", row.original.birth_date, error);
              return null; // Fallback if parsing fails
            }
          }
          return null;
        });
        const [gg, setGG] = useState<string | null>(
          row.original.birth_date ? dateFormatter.format(new Date(row.original.birth_date)) : null,
        );

        return (
          <DateInput
            isolated
            inCell
            placeholder={t("Employees.form.birth_date.placeholder")}
            value={typeof gg === "string" ? dateFormatter.format(new Date(gg)) : (gg ?? null)}
            // value={birthDate} // Bind to local CalendarDate state
            onChange={(newCalendarDate: CalendarDate | null) => {
              let newDate = dateFormatter.format(new Date(newCalendarDate?.toString() ?? ""));
              // Update local state when DateInput changes (typing or calendar pick)

              setGG(newDate);
              console.log("newCalendarDate", newCalendarDate);
              // setBirthDate(newCalendarDate);
            }}
            onBlur={() => {
              // When focus is lost, convert local CalendarDate to ISO string and call handleEdit
              const valueToStore = birthDate ? birthDate.toString() : null;
              console.log("valueToStore", valueToStore);
              // handleEdit?.(row.id, "birth_date", valueToStore);
            }}
            onSelect={(e) => {
              handleEdit?.(row.id, "birth_date", e?.toString() ?? null);
            }}
            // disabled={isEmployeeSaving}
          />
        );
      },
    },
    {
      accessorKey: "hire_date",
      header: t("Employees.form.hire_date.label"),
      cell: ({ row }) => useFormatDate(row.original.hire_date),
      filterFn: dateTableFilterFn,
    },
    {
      accessorKey: "job_id",
      header: t("Employees.form.job.label"),
      noPadding: true,
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <ComboboxAdd
            isolated
            dir={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={jobs || []}
            labelKey="title"
            valueKey="id"
            isLoading={isFetchingJobs}
            buttonClassName="bg-transparent"
            defaultValue={employee.job_id || ""}
            onChange={async (value) => {
              handleEdit?.(employee.id, "job_id", value);
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Pages.Jobs.search"),
              noItems: t("Pages.Jobs.no_jobs_found"),
            }}
            addText={t("Pages.Jobs.add")}
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
            onAddClick={() => {
              setIsJobDialogOpen(true);
            }}
          />
        );
      },
    },
    {
      accessorKey: "nationality",
      header: t("Employees.form.nationality.label"),
      maxSize: 100,
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const nationality = getValue() as string;
        return (
          <CountryInput
            value={nationality}
            onChange={(e) => handleEdit?.(row.id, "nationality", e)}
            inCell
            defaultValue={row.original.nationality || ""}
            isolated
            dir={locale === "ar" ? "rtl" : "ltr"}
            labelKey={locale === "ar" ? "arabic_label" : "label"}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Forms.country.search_placeholder"),
              noItems: t("Forms.country.no_items"),
            }}
          />
        );
      },
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
      filterFn: dateTableFilterFn,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
      filterFn: dateTableFilterFn,
    },
    {
      accessorKey: "status",
      header: t("Employees.form.status.label"),
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

export default useEmployeeColumns;

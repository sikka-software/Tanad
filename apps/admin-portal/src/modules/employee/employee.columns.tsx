import { parseDate, CalendarDate } from "@internationalized/date";
import { Row, FilterFn } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { ExtendedColumnDef } from "@/ui/sheet-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useFormatDate } from "@/lib/date-utils";

import { Employee, EmployeeStatus } from "@/employee/employee.types";

import { useJobs } from "@/job/job.hooks";

// Custom filter function for date columns
const dateTableFilterFn: FilterFn<Employee> = (
  row: Row<Employee>,
  columnId: string,
  filterValueWithOperator: { filterValue: string; operator: string; type: string },
) => {
  const { filterValue, operator, type } = filterValueWithOperator;
  const rowValue = row.getValue(columnId) as string | Date | null;

  if (operator === "is_empty") return !rowValue;
  if (operator === "is_not_empty") return !!rowValue;

  if (type !== "date" || !filterValue) {
    return false;
  }

  if (!rowValue) {
    return false;
  }

  let rowDate: CalendarDate;
  try {
    const jsDate = new Date(rowValue);
    if (isNaN(jsDate.getTime())) {
      return false;
    }
    rowDate = parseDate(
      `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}`,
    );
  } catch (e) {
    return false;
  }

  let filterCalendarDate: CalendarDate;
  try {
    filterCalendarDate = parseDate(filterValue);
  } catch (e) {
    return false;
  }

  switch (operator) {
    case "equals":
      const isEqual = rowDate.compare(filterCalendarDate) === 0;
      return isEqual;
    case "before":
      const isBefore = rowDate.compare(filterCalendarDate) < 0;
      return isBefore;
    case "after":
      const isAfter = rowDate.compare(filterCalendarDate) > 0;
      return isAfter;
    case "is_empty":
      return !rowValue;
    case "is_not_empty":
      return !!rowValue;
    default:
      return false;
  }
};

const useEmployeeColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const { data: jobs, isLoading: isFetchingJobs } = useJobs();
  const locale = useLocale();

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
    },
    {
      accessorKey: "birth_date",
      header: t("Employees.form.birth_date.label"),
      cell: ({ row }) => useFormatDate(row.original.birth_date),
      filterFn: dateTableFilterFn,
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
              searchPlaceholder: t("Pages.Employees.search"),
              noItems: t("Pages.Jobs.no_jobs_found"),
            }}
            addText={t("Pages.Employees.add")}
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

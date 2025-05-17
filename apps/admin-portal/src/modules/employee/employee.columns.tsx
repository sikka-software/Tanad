import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";
import { Row, FilterFn } from "@tanstack/react-table";
import { parseDate, CalendarDate } from "@internationalized/date";

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
  // console.log(`[dateTableFilterFn TEMPORARY TEST] Reached for Row ID: ${row.id}, Column: ${columnId}`);
  // return true; // Always pass the filter for now

  // Previous logic restored
  const { filterValue, operator, type } = filterValueWithOperator;
  const rowValue = row.getValue(columnId) as string | Date | null;

  console.log(
    `[dateTableFilterFn] Col: ${columnId}, RowID: ${row.id}, Operator: ${operator}, Type: ${type}`,
    "\n  Raw Row Value:", rowValue,
    "\n  Filter Value (YYYY-MM-DD from popover):", filterValue
  );

  // Handle operators that don't require a filterValue first
  if (operator === "is_empty") return !rowValue;
  if (operator === "is_not_empty") return !!rowValue;

  // If type is not date, or if it is a date operation that requires a value but none is provided, bail out.
  if (type !== "date" || !filterValue) {
    console.log("[dateTableFilterFn] Bailing out: type not date or no filterValue for date op.");
    return false; 
  }

  // If row has no date, it can't match specific date filters like equals, before, after
  if (!rowValue) {
    console.log("[dateTableFilterFn] Bailing out: no rowValue.");
    return false;
  }

  let rowDate: CalendarDate;
  try {
    // Assuming rowValue is a string like "YYYY-MM-DD" or a full ISO string, or a Date object
    const jsDate = new Date(rowValue);
    if (isNaN(jsDate.getTime())) {
      console.log("[dateTableFilterFn] Invalid JSDate from rowValue:", rowValue);
      return false; // Invalid date in row
    }
    // Convert to CalendarDate by taking local parts to avoid timezone shifts in comparison logic
    rowDate = parseDate(`${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, '0')}-${String(jsDate.getDate()).padStart(2, '0')}`);
    console.log("[dateTableFilterFn] Parsed Row Date (CalendarDate):", rowDate?.toString());
  } catch (e) {
    console.error("[dateTableFilterFn] Error parsing row date for filtering:", rowValue, e);
    return false;
  }

  let filterCalendarDate: CalendarDate;
  try {
    filterCalendarDate = parseDate(filterValue); // filterValue is YYYY-MM-DD
    console.log("[dateTableFilterFn] Parsed Filter Date (CalendarDate):", filterCalendarDate?.toString());
  } catch (e) {
    console.error("[dateTableFilterFn] Error parsing filter date for filtering:", filterValue, e);
    return false;
  }

  switch (operator) {
    case "equals":
      const isEqual = rowDate.compare(filterCalendarDate) === 0;
      console.log("[dateTableFilterFn] Comparison 'equals':", isEqual);
      return isEqual;
    case "before":
      const isBefore = rowDate.compare(filterCalendarDate) < 0;
      console.log("[dateTableFilterFn] Comparison 'before':", isBefore);
      return isBefore;
    case "after":
      const isAfter = rowDate.compare(filterCalendarDate) > 0;
      console.log("[dateTableFilterFn] Comparison 'after':", isAfter);
      return isAfter;
    case "is_empty": // Should be handled by the check at the beginning
      return !rowValue;
    case "is_not_empty": // Should be handled by the check at the beginning
      return !!rowValue;
    default:
      console.log("[dateTableFilterFn] Unknown operator or no match:", operator);
      return false; // Default to false if operator is unknown or not handled yet
  }
};

const useCompanyColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const { data: jobs, isLoading: isFetchingJobs } = useJobs();
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
              noItems: t("Offices.form.manager.no_employees"),
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
      validationSchema: z.string().min(1, t("Employees.form.nationality.required")),
    },

    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
      filterFn: dateTableFilterFn,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      validationSchema: z.string().min(1, t("Metadata.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
      filterFn: dateTableFilterFn,
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

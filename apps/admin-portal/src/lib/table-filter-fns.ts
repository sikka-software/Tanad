import { parseDate, CalendarDate } from "@internationalized/date";
import { Row, FilterFn, RowData } from "@tanstack/react-table";

// This is the structure we expect from our FilterPopover/columnFilters setup
export interface CustomFilterValueWithOperator {
  filterValue: string;
  operator: string;
  type: string; // Though for this specific function, 'date' is implied
}

/**
 * Custom TanStack Table filter function for date columns.
 * Expects the filterValue to be an object of type CustomFilterValueWithOperator.
 */
export const dateTableFilterFn: FilterFn<any> = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValueWithOperator: CustomFilterValueWithOperator,
  // addMeta: (meta: FilterMeta) => void // addMeta is part of the standard signature if needed
): boolean => {
  const { filterValue, operator, type } = filterValueWithOperator;
  // Ensure rowValue can be a string, Date, or null/undefined for flexibility
  const rowValue = row.getValue(columnId) as string | Date | null | undefined;

  if (operator === "is_empty") return !rowValue;
  if (operator === "is_not_empty") return !!rowValue;

  // If type is explicitly provided and it's not 'date', or if critical values are missing,
  // this filter shouldn't apply or should fail.
  // However, this specific fn is for dates, so 'type' might be redundant if always used for date columns.
  if (type !== "date" || !filterValue) {
    return false;
  }

  if (!rowValue) {
    return false; // No row value to compare against
  }

  let rowCalendarDate: CalendarDate | null = null;
  try {
    const jsDate = new Date(rowValue); // Works for both Date objects and valid date strings
    if (isNaN(jsDate.getTime())) {
      return false; // Invalid date in the row
    }
    // Format to YYYY-MM-DD for parseDate, which expects this format
    rowCalendarDate = parseDate(
      `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}`,
    );
  } catch (e) {
    // console.error("Error parsing row date value:", rowValue, e);
    return false; // Error parsing row's date
  }

  let filterCalendarDate: CalendarDate | null = null;
  try {
    // filterValue is expected to be 'YYYY-MM-DD' from FilterPopover
    filterCalendarDate = parseDate(filterValue);
  } catch (e) {
    // console.error("Error parsing filter date value:", filterValue, e);
    return false; // Error parsing filter's date
  }

  if (!rowCalendarDate || !filterCalendarDate) {
    return false; // One of the dates couldn't be parsed
  }

  switch (operator) {
    case "equals":
      return rowCalendarDate.compare(filterCalendarDate) === 0;
    case "before":
      return rowCalendarDate.compare(filterCalendarDate) < 0;
    case "after":
      return rowCalendarDate.compare(filterCalendarDate) > 0;
    default:
      return false;
  }
};

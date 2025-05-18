import { CalendarDate } from "@internationalized/date";
import { format, isValid } from "date-fns";

import useUserStore from "@/stores/use-user-store";

export type DateFormatSetting = "ymd" | "dmy" | "mdy";

const dateFormatMap: Record<DateFormatSetting, string> = {
  ymd: "yyyy/MM/dd",
  dmy: "dd/MM/yyyy",
  mdy: "MM/dd/yyyy",
};

const DEFAULT_DATE_FORMAT: DateFormatSetting = "ymd"; // Default to YYYY/MM/DD

/**
 * Custom hook to format a date based on the user's date_format setting.
 * @param dateToFormat The date to format (Date object, string, or number).
 * @returns The formatted date string, or an empty string if the input date is invalid or not provided.
 */
export const useFormatDate = (dateToFormat: Date | string | number | null | undefined): string => {
  const userDateFormat = useUserStore((state) => state.profile?.user_settings.date_format);

  if (dateToFormat === null || typeof dateToFormat === "undefined") {
    return "";
  }

  const dateObj = new Date(dateToFormat);
  if (!isValid(dateObj)) {
    console.warn("useFormatDate: Invalid date provided", dateToFormat);
    return ""; // Or return original input, or throw error, based on desired behavior
  }

  const formatString =
    dateFormatMap[userDateFormat as DateFormatSetting] || dateFormatMap[DEFAULT_DATE_FORMAT];

  try {
    return format(dateObj, formatString);
  } catch (error) {
    console.error("useFormatDate: Error formatting date", error);
    // Fallback to a default format or return an error indicator
    return format(dateObj, dateFormatMap[DEFAULT_DATE_FORMAT]);
  }
};

/**
 * Utility function to get the date format string based on user settings.
 * This can be used outside of React components if needed, by passing the setting directly.
 * @param dateFormatSetting The user's date format setting.
 * @returns The date-fns compatible format string.
 */
export const getDateFormatString = (dateFormatSetting?: DateFormatSetting): string => {
  return (
    dateFormatMap[dateFormatSetting || DEFAULT_DATE_FORMAT] || dateFormatMap[DEFAULT_DATE_FORMAT]
  );
};

/**
 * Converts a given date value (CalendarDate, Date object, or string) to 'YYYY-MM-DD' format.
 * @param value The date value to format.
 * @returns The formatted date string (YYYY-MM-DD), or null if the input is invalid or null/undefined.
 */
export const formatToYYYYMMDD = (
  value: CalendarDate | Date | string | null | undefined,
): string | null => {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  // Check for @internationalized/date CalendarDate object
  // Ensure it's not a JS Date object which also might have toString
  if (
    typeof value === "object" &&
    "year" in value &&
    "month" in value &&
    "day" in value &&
    typeof (value as CalendarDate).toString === "function" &&
    !(value instanceof Date)
  ) {
    return (value as CalendarDate).toString(); // CalendarDate.toString() returns 'YYYY-MM-DD'
  }

  // Handle JavaScript Date object or a string that can be parsed into a Date
  let dateObj: Date;
  if (value instanceof Date) {
    dateObj = value;
  } else if (typeof value === "string") {
    dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
      console.warn(`formatToYYYYMMDD: Invalid date string provided: ${value}`);
      return null;
    }
  } else {
    // If it's an object but not CalendarDate or Date (e.g. the problematic raw object if it somehow gets here)
    // This case should ideally be caught by the CalendarDate check if 'toString' is present and correct.
    console.warn(`formatToYYYYMMDD: Unsupported date type: ${typeof value}`, value);
    return null;
  }

  // Format the Date object to YYYY-MM-DD using local date parts
  // to avoid timezone-related date shifts.
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

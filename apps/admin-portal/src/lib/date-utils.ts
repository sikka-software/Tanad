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

// useRelativeTime.ts
import { useRouter } from "next/router";
import { useMemo } from "react";

export function useRelativeTime(date: Date): string {
  const { locale } = useRouter();

  return useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // milliseconds
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let unit: Intl.RelativeTimeFormatUnit, value: number;

    if (years > 0) {
      unit = "year";
      value = -years;
    } else if (months > 0) {
      unit = "month";
      value = -months;
    } else if (days > 0) {
      unit = "day";
      value = -days;
    } else if (hours > 0) {
      unit = "hour";
      value = -hours;
    } else if (minutes > 0) {
      unit = "minute";
      value = -minutes;
    } else {
      unit = "second";
      value = -seconds;
    }

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return formatter.format(value, unit);
  }, [date, locale]);
}

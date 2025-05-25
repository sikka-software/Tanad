import { parseDate, CalendarDate } from "@internationalized/date";

import { FilterCondition } from "@/types/common.type";

export const applyFilters = <T>(
  data: T[],
  filterConditions: FilterCondition[],
  filterCaseSensitive: boolean,
) => {
  if (!filterConditions.length) return data;

  return data.filter((item) => {
    return filterConditions.reduce((pass, condition, index) => {
      let matches = false;
      const itemValue = item[condition.field as keyof T];
      const filterInputValue = condition.value;

      if (condition.operator === "is_empty") {
        matches = !itemValue;
      } else if (condition.operator === "is_not_empty") {
        matches = Boolean(itemValue);
      } else if (condition.type === "date") {
        if (!itemValue || !filterInputValue) {
          matches = false;
        } else {
          let itemCalendarDate: CalendarDate | null = null;
          try {
            const dateObj = new Date(itemValue as string | Date);
            if (!isNaN(dateObj.getTime())) {
              itemCalendarDate = parseDate(
                `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`,
              );
            }
          } catch (e) {
            // console.error("Error parsing item date:", itemValue, e);
          }

          let filterCalendarDate: CalendarDate | null = null;
          try {
            filterCalendarDate = parseDate(filterInputValue);
          } catch (e) {
            // console.error("Error parsing filter input date:", filterInputValue, e);
          }

          if (itemCalendarDate && filterCalendarDate) {
            switch (condition.operator) {
              case "equals":
                matches = itemCalendarDate.compare(filterCalendarDate) === 0;
                break;
              case "before":
                matches = itemCalendarDate.compare(filterCalendarDate) < 0;
                break;
              case "after":
                matches = itemCalendarDate.compare(filterCalendarDate) > 0;
                break;
            }
          } else {
            matches = false;
          }
        }
      } else if (typeof itemValue === "string") {
        const stringItemValue = String(itemValue);
        const compareItemValue = filterCaseSensitive
          ? stringItemValue
          : stringItemValue.toLowerCase();
        const compareFilter = filterCaseSensitive
          ? filterInputValue
          : filterInputValue.toLowerCase();

        switch (condition.operator) {
          case "equals":
            matches = compareItemValue === compareFilter;
            break;
          case "contains":
            matches = compareItemValue.includes(compareFilter);
            break;
          case "starts_with":
            matches = compareItemValue.startsWith(compareFilter);
            break;
          case "ends_with":
            matches = compareItemValue.endsWith(compareFilter);
            break;
        }
      } else if (typeof itemValue === "number") {
        const numFilterValue = Number(filterInputValue);
        if (!isNaN(numFilterValue)) {
          switch (condition.operator) {
            case "equals":
              matches = itemValue === numFilterValue;
              break;
            case "greater_than":
              matches = itemValue > numFilterValue;
              break;
            case "less_than":
              matches = itemValue < numFilterValue;
              break;
            case "between":
              const parts = filterInputValue.split(",").map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const [min, max] = parts;
                matches = itemValue >= min && itemValue <= max;
              } else {
                matches = false;
              }
              break;
          }
        } else {
          matches = false;
        }
      }

      return index === 0
        ? matches
        : condition.conjunction === "and"
          ? pass && matches
          : pass || matches;
    }, true);
  });
};

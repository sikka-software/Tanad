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
      const value = item[condition.field as keyof T];
      const filterValue = condition.value;

      if (condition.operator === "isEmpty") {
        matches = !value;
      } else if (condition.operator === "isNotEmpty") {
        matches = Boolean(value);
      } else if (typeof value === "string") {
        const stringValue = String(value);
        const compareValue = filterCaseSensitive ? stringValue : stringValue.toLowerCase();
        const compareFilter = filterCaseSensitive ? filterValue : filterValue.toLowerCase();

        switch (condition.operator) {
          case "equals":
            matches = compareValue === compareFilter;
            break;
          case "contains":
            matches = compareValue.includes(compareFilter);
            break;
          case "startsWith":
            matches = compareValue.startsWith(compareFilter);
            break;
          case "endsWith":
            matches = compareValue.endsWith(compareFilter);
            break;
        }
      } else if (typeof value === "number") {
        const numValue = Number(filterValue);
        switch (condition.operator) {
          case "equals":
            matches = value === numValue;
            break;
          case "greaterThan":
            matches = value > numValue;
            break;
          case "lessThan":
            matches = value < numValue;
            break;
          case "between":
            const [min, max] = filterValue.split(",").map(Number);
            matches = value >= min && value <= max;
            break;
        }
      } else if (value && typeof value === "object" && "getTime" in value) {
        const dateValue = new Date(value as unknown as Date);
        const filterDate = new Date(filterValue);
        switch (condition.operator) {
          case "equals":
            matches = dateValue.getTime() === filterDate.getTime();
            break;
          case "before":
            matches = dateValue < filterDate;
            break;
          case "after":
            matches = dateValue > filterDate;
            break;
          case "between":
            const [start, end] = filterValue.split(",").map((d) => new Date(d.trim()));
            matches = dateValue >= start && dateValue <= end;
            break;
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

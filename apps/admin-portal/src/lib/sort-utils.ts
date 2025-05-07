const models = [
  "clients",
  "vendors",
  "offices",
  "warehouses",
  "branches",
  "invoices",
  "products",
  "employees",
  "employee_requests",
  "salaries",
  "jobs",

  "companies",
  "departments",
  "job_listings",
  "expenses",
  "purchases",
  "quotes",
  "roles",
  "users",
  "domains",
  "servers",
  "websites",
  "online_stores",
];

interface SortOptions {
  caseSensitive?: boolean;
  nullsFirst?: boolean;
}

// Generic sort function that can be used for any model
function sortData<T>(
  items: T[],
  sortRules: { field: string; direction: string }[],
  options: SortOptions = {},
): T[] {
  if (!sortRules.length) {
    return items;
  }

  const { caseSensitive = false, nullsFirst = false } = options;

  return [...items].sort((a, b) => {
    for (const rule of sortRules) {
      const getNestedValue = (obj: T, path: string) => {
        return path.split(".").reduce((o: any, p) => o?.[p] ?? null, obj);
      };

      const aRawValue = getNestedValue(a, rule.field);
      const bRawValue = getNestedValue(b, rule.field);
      const aType = typeof aRawValue;
      const bType = typeof bRawValue;
      // Handle null/undefined/empty values
      const isANullish = aRawValue === null || aRawValue === undefined || aRawValue === "";
      const isBNullish = bRawValue === null || bRawValue === undefined || bRawValue === "";

      if (isANullish) {
        if (isBNullish) {
          continue; // Both are null/empty, try next rule
        }
        const result = nullsFirst ? -1 : 1;
        return result;
      }
      if (isBNullish) {
        const result = nullsFirst ? 1 : -1;
        return result;
      }

      let comparisonResult = 0;

      // Determine the type of the values and compare accordingly
      // If types don't match, convert both to strings
      if (aType !== bType) {
        const aStr = String(aRawValue);
        const bStr = String(bRawValue);
        const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
        const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

        if (aCompare < bCompare) comparisonResult = -1;
        if (aCompare > bCompare) comparisonResult = 1;

        if (comparisonResult !== 0) {
          comparisonResult = rule.direction === "asc" ? comparisonResult : -comparisonResult;
          return comparisonResult;
        }
        continue; // Types were different but string comparison was equal, try next rule
      }

      // Handle different types
      switch (aType) {
        case "number":
          const aDiff = (aRawValue as number) - (bRawValue as number);
          if (aDiff !== 0) {
            comparisonResult = rule.direction === "asc" ? aDiff : -aDiff;
          }
          break;

        case "boolean":
          if (aRawValue !== bRawValue) {
            comparisonResult = rule.direction === "asc" ? (aRawValue ? 1 : -1) : aRawValue ? -1 : 1;
          }
          break;

        case "string":
          const aStr = aRawValue as string;
          const bStr = bRawValue as string;
          const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
          const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

          if (aCompare < bCompare) comparisonResult = rule.direction === "asc" ? -1 : 1;
          if (aCompare > bCompare) comparisonResult = rule.direction === "asc" ? 1 : -1;
          break;

        default:
          const aVal = String(aRawValue);
          const bVal = String(bRawValue);
          if (aVal < bVal) comparisonResult = rule.direction === "asc" ? -1 : 1;
          if (aVal > bVal) comparisonResult = rule.direction === "asc" ? 1 : -1;
          break;
      }

      if (comparisonResult !== 0) {
        return comparisonResult; // Return immediately if a difference is found
      }
    }
    return 0; // Return 0 if all rules resulted in equality
  });
}

// The sorting factory to handle any of our models accurately and correctly.
/**
 * A factory function to sort an array of items based on specified sorting rules.
 *
 * @template T - The type of the items in the array.
 * @param model - The name of the model to validate against a predefined list of models.
 * @param items - The array of items to be sorted.
 * @param sortRules - An array of sorting rules, where each rule specifies a field and a direction ("asc" or "desc").
 * @param options - Optional sorting options to customize the behavior of the sorting process.
 * @returns A new array of items sorted according to the provided rules.
 * @throws {Error} If the provided model is not supported.
 *
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 35 },
 * ];
 *
 * const sortRules = [
 *   { field: 'age', direction: 'asc' },
 * ];
 *
 * const sortedItems = applySort('userModel', items, sortRules);
 * // Output: [
 * //   { name: 'Bob', age: 25 },
 * //   { name: 'Alice', age: 30 },
 * //   { name: 'Charlie', age: 35 },
 * // ]
 * ```
 */
export const applySort = <T>(
  model: string,
  items: T[],
  sortRules: { field: string; direction: string }[],
  options: SortOptions = {},
): T[] => {
  if (!models.includes(model)) {
    throw new Error(
      `Unsupported model: ${model}, please add it to the models array in src/lib/sort-utils.ts`,
    );
  }

  return sortData<T>(items, sortRules, options);
};

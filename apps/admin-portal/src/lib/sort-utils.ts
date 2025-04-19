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
  if (!sortRules.length) return items;

  const { caseSensitive = false, nullsFirst = false } = options;

  return [...items].sort((a, b) => {
    for (const rule of sortRules) {
      // Handle nested fields like company_details.name
      const getNestedValue = (obj: T, path: string) => {
        return path.split(".").reduce((o: any, p) => o?.[p] ?? null, obj);
      };

      const aRawValue = getNestedValue(a, rule.field);
      const bRawValue = getNestedValue(b, rule.field);

      // Handle null/undefined values
      if (aRawValue === null || aRawValue === undefined || aRawValue === "") {
        if (bRawValue === null || bRawValue === undefined || bRawValue === "") {
          continue; // Both are null/empty, try next rule
        }
        return nullsFirst ? -1 : 1;
      }
      if (bRawValue === null || bRawValue === undefined || bRawValue === "") {
        return nullsFirst ? 1 : -1;
      }

      // Determine the type of the values and compare accordingly
      const aType = typeof aRawValue;
      const bType = typeof bRawValue;

      // If types don't match, convert both to strings
      if (aType !== bType) {
        const aStr = String(aRawValue);
        const bStr = String(bRawValue);
        const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
        const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

        if (aCompare < bCompare) return rule.direction === "asc" ? -1 : 1;
        if (aCompare > bCompare) return rule.direction === "asc" ? 1 : -1;
        continue;
      }

      // Handle different types
      switch (aType) {
        case "number":
          const aDiff = (aRawValue as number) - (bRawValue as number);
          if (aDiff !== 0) return rule.direction === "asc" ? aDiff : -aDiff;
          break;

        case "boolean":
          if (aRawValue !== bRawValue) {
            return rule.direction === "asc" ? (aRawValue ? 1 : -1) : aRawValue ? -1 : 1;
          }
          break;

        case "string":
          const aStr = aRawValue as string;
          const bStr = bRawValue as string;
          const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
          const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

          if (aCompare < bCompare) return rule.direction === "asc" ? -1 : 1;
          if (aCompare > bCompare) return rule.direction === "asc" ? 1 : -1;
          break;

        default:
          // For dates or other types, convert to string
          const aVal = String(aRawValue);
          const bVal = String(bRawValue);
          if (aVal < bVal) return rule.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return rule.direction === "asc" ? 1 : -1;
          break;
      }
    }
    return 0;
  });
}

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
];

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
 * console.log(sortedItems);
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
    throw new Error(`Unsupported model: ${model}`);
  }

  return sortData<T>(items, sortRules, options);
};

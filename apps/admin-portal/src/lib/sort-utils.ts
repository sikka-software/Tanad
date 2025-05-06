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
    console.log('[sortData] No sort rules, returning original items.'); // Log: No rules
    return items;
  }
  console.log('[sortData] Applying sort rules:', JSON.stringify(sortRules), 'with options:', JSON.stringify(options)); // Log: Rules and options

  const { caseSensitive = false, nullsFirst = false } = options;

  return [...items].sort((a, b) => {
    console.log('--- [sortData] Comparing ---'); // Log: Start comparison
    console.log('  Item A:', JSON.stringify(a)); // Log: Item A
    console.log('  Item B:', JSON.stringify(b)); // Log: Item B

    for (const rule of sortRules) {
      console.log(`[sortData] Applying Rule: ${rule.field} (Direction: ${rule.direction})`); // <-- MODIFY LOG

      const getNestedValue = (obj: T, path: string) => {
        return path.split(".").reduce((o: any, p) => o?.[p] ?? null, obj);
      };

      const aRawValue = getNestedValue(a, rule.field);
      const bRawValue = getNestedValue(b, rule.field);
      const aType = typeof aRawValue;
      const bType = typeof bRawValue;
      console.log(`[sortData] Values: A='${aRawValue}' (type: ${aType}), B='${bRawValue}' (type: ${bType})`); // Log: Values and types

      // Handle null/undefined/empty values
      const isANullish = aRawValue === null || aRawValue === undefined || aRawValue === "";
      const isBNullish = bRawValue === null || bRawValue === undefined || bRawValue === "";

      if (isANullish) {
        if (isBNullish) {
          console.log('[sortData] Both values nullish, trying next rule.'); // Log: Both nullish
          continue; // Both are null/empty, try next rule
        }
        const result = nullsFirst ? -1 : 1;
        console.log(`[sortData] A is nullish, B is not. NullsFirst=${nullsFirst}. Result: ${result}`); // Log: A nullish
        return result;
      }
      if (isBNullish) {
        const result = nullsFirst ? 1 : -1;
        console.log(`[sortData] B is nullish, A is not. NullsFirst=${nullsFirst}. Result: ${result}`); // Log: B nullish
        return result;
      }

      let comparisonResult = 0;

      // Determine the type of the values and compare accordingly
      // If types don't match, convert both to strings
      if (aType !== bType) {
        console.log('[sortData] Mixed types detected, comparing as strings.'); // Log: Mixed types
        const aStr = String(aRawValue);
        const bStr = String(bRawValue);
        const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
        const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

        if (aCompare < bCompare) comparisonResult = -1;
        if (aCompare > bCompare) comparisonResult = 1;

        console.log(`[sortData] String comparison: a='${aCompare}', b='${bCompare}'. Intermediate result: ${comparisonResult}`); // Log: String comparison result
        if (comparisonResult !== 0) {
           comparisonResult = rule.direction === "asc" ? comparisonResult : -comparisonResult;
           console.log(`[sortData] Final result for rule (mixed types): ${comparisonResult}`); // Log: Final mixed type result
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
            // Normalize to -1 or 1 for logging consistency if needed, but aDiff preserves magnitude
             console.log(`[sortData] Number comparison result: ${comparisonResult > 0 ? 1 : (comparisonResult < 0 ? -1 : 0)} (raw diff: ${comparisonResult})`); // Log: Number result
          }
          break;

        case "boolean":
          if (aRawValue !== bRawValue) {
            comparisonResult = rule.direction === "asc" ? (aRawValue ? 1 : -1) : (aRawValue ? -1 : 1);
            console.log(`[sortData] Boolean comparison result: ${comparisonResult}`); // Log: Boolean result
          }
          break;

        case "string":
          const aStr = aRawValue as string;
          const bStr = bRawValue as string;
          const aCompare = caseSensitive ? aStr : aStr.toLowerCase();
          const bCompare = caseSensitive ? bStr : bStr.toLowerCase();

          if (aCompare < bCompare) comparisonResult = rule.direction === "asc" ? -1 : 1;
          if (aCompare > bCompare) comparisonResult = rule.direction === "asc" ? 1 : -1;
           console.log(`[sortData] String comparison: a='${aCompare}', b='${bCompare}'. Result: ${comparisonResult}`); // Log: String result
          break;

        default:
          // For dates or other types, convert to string
          console.log('[sortData] Default case (comparing as strings).'); // Log: Default case
          const aVal = String(aRawValue);
          const bVal = String(bRawValue);
          if (aVal < bVal) comparisonResult = rule.direction === "asc" ? -1 : 1;
          if (aVal > bVal) comparisonResult = rule.direction === "asc" ? 1 : -1;
          console.log(`[sortData] Default string comparison: a='${aVal}', b='${bVal}'. Result: ${comparisonResult}`); // Log: Default result
          break;
      }


      if (comparisonResult !== 0) {
         console.log(`--- [sortData] Final comparison result for rule (${rule.field} ${rule.direction}): ${comparisonResult} ---`); // <-- MODIFY LOG
         return comparisonResult; // Return immediately if a difference is found
      }
       console.log('[sortData] Values equal for this rule, trying next rule...'); // Log: Rule equal
    }
     console.log('[sortData] All rules evaluated to equal, returning 0.'); // Log: All rules equal
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
  console.log(`[applySort] Function called for model: ${model}. Items count: ${items?.length}. Rules:`, JSON.stringify(sortRules)); // <-- ADD LOG
  if (!models.includes(model)) {
    throw new Error(
      `Unsupported model: ${model}, please add it to the models array in src/lib/sort-utils.ts`,
    );
  }

  return sortData<T>(items, sortRules, options);
};

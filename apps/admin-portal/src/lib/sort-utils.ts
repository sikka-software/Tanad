import type { Client } from "@/types/client.type";

interface SortOptions {
  caseSensitive?: boolean;
  nullsFirst?: boolean;
}

export const sortClients = (
  clients: Client[],
  sortRules: { field: string; direction: string }[],
  options: SortOptions = {}
): Client[] => {
  if (!sortRules.length) return clients;

  const { caseSensitive = false, nullsFirst = false } = options;

  return [...clients].sort((a, b) => {
    for (const rule of sortRules) {
      // Handle nested fields like company_details.name
      const getNestedValue = (obj: Client, path: string) => {
        return path.split('.').reduce((o: any, p) => (o?.[p] ?? ''), obj);
      };
      
      const aRawValue = getNestedValue(a, rule.field);
      const bRawValue = getNestedValue(b, rule.field);

      // Handle null/undefined values
      if (aRawValue === null || aRawValue === undefined || aRawValue === '') {
        if (bRawValue === null || bRawValue === undefined || bRawValue === '') {
          continue; // Both are null/empty, try next rule
        }
        return nullsFirst ? -1 : 1;
      }
      if (bRawValue === null || bRawValue === undefined || bRawValue === '') {
        return nullsFirst ? 1 : -1;
      }

      // Convert to string and handle case sensitivity
      const aValue = String(aRawValue);
      const bValue = String(bRawValue);
      
      const aCompare = caseSensitive ? aValue : aValue.toLowerCase();
      const bCompare = caseSensitive ? bValue : bValue.toLowerCase();

      if (aCompare < bCompare) return rule.direction === "asc" ? -1 : 1;
      if (aCompare > bCompare) return rule.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

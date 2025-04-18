import type { Client } from "@/types/client.type";

export const sortClients = (
  clients: Client[],
  sortRules: { field: string; direction: string }[],
): Client[] => {
  if (!sortRules.length) return clients;

  return [...clients].sort((a, b) => {
    for (const rule of sortRules) {
      // Handle nested fields like company_details.name
      const getNestedValue = (obj: Client, path: string) => {
        return path.split('.').reduce((o: any, p) => (o?.[p] ?? ''), obj);
      };
      
      const aValue = String(getNestedValue(a, rule.field)).toLowerCase();
      const bValue = String(getNestedValue(b, rule.field)).toLowerCase();

      if (aValue < bValue) return rule.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return rule.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

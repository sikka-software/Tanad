import type { Client } from "@/types/client.type";

export const sortClients = (
  clients: Client[],
  sortRules: { field: string; direction: string }[],
): Client[] => {
  if (!sortRules.length) return clients;

  return [...clients].sort((a, b) => {
    for (const rule of sortRules) {
      const field = rule.field as keyof Client;
      const aValue = String(a[field]).toLowerCase();
      const bValue = String(b[field]).toLowerCase();

      if (aValue < bValue) return rule.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return rule.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

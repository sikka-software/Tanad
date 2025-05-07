import type { Database } from "@/lib/database.types";

export type Role = Database["public"]["Tables"]["roles"]["Row"] & {
  permissions: string[];
};
export type RoleCreateData = Database["public"]["Tables"]["roles"]["Insert"] & {
  permissions?: string[];
};
export type RoleUpdateData = Database["public"]["Tables"]["roles"]["Update"] & {
  permissions?: string[];
};

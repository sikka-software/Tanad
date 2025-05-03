import type { Database } from "@/lib/database.types";

export type Role = Database["public"]["Tables"]["roles"]["Row"];
// Base type from schema (columns in the 'roles' table)

// Type returned by hooks, including joined permissions
export interface RoleWithPermissions extends Role {
  permissions: string[];
  // is_system is already part of Role
}

// Create data type - includes fields for roles table + permissions for join table
export interface RoleCreateData extends Pick<Role, "name" | "description"> {
  permissions?: string[];
  // is_system is not directly created, defaults to false
}

// Update data type - similar structure, all optional
export interface RoleUpdateData extends Partial<Role> {
  permissions?: string[];
}

import type { roles } from "@/db/schema";

// Base type from schema (columns in the 'roles' table)
export type Role = typeof roles.$inferSelect; // Now includes id, name, description, is_system

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
export interface RoleUpdateData extends Partial<Pick<Role, "name" | "description">> {
  permissions?: string[];
  // is_system is generally not updatable directly
}

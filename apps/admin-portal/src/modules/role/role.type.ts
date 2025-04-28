import type { roles } from "@/db/schema";

// Base type from schema
export type Role = typeof roles.$inferSelect;

// Create data type
export type RoleCreateData = Pick<Role, "name" | "description" | "permissions" | "enterprise_id">;

// Update data type
export type RoleUpdateData = Partial<RoleCreateData>;

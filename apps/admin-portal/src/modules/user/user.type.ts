import type { InferModel } from "drizzle-orm";

import type { profiles } from "@/db/schema";

// Base type from schema
export type User = InferModel<typeof profiles>;

// Create data type
export type UserCreateData = Pick<User, "email" | "role" | "enterprise_id" | "first_name" | "last_name">;

// Update data type
export type UserUpdateData = Partial<UserCreateData>;

// Form data type
export interface UserFormData {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
}

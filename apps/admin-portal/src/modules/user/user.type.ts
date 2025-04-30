import type { InferModel } from "drizzle-orm";

import type { profiles } from "@/db/schema";

// Base type from schema
export type User = InferModel<typeof profiles>;

// Create data type - Define properties explicitly
export interface UserCreateData {
  email: string;
  password: string;
  role_id: string; // Assuming role is passed as ID
  enterprise_id: string;
  first_name?: string; // Make names optional based on previous context
  last_name?: string; // Make names optional based on previous context
  full_name?: string; // Add full_name if needed for profile creation
}

// Update data type
export type UserUpdateData = Partial<UserCreateData>; // Can remain partial

// Form data type
export interface UserFormData {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
}

import type { Database } from "@/lib/database.types";

export type ActivityLogActionType = Database["public"]["Enums"]["activity_log_action_type"];
export type ActivityTargetType = Database["public"]["Enums"]["activity_target_type"];

// Base type for ActivityLog matching the database schema
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"] & {
  // We'll likely join user info, so add potential fields
  user_email?: string | null;
  user_full_name?: string | null;
};

// Type for creating an ActivityLog (usually handled by triggers, but useful for reference)
export type ActivityLogCreateData = Database["public"]["Tables"]["activity_logs"]["Insert"];

// Type for updating (not typically needed for logs, but good practice)
export type ActivityLogUpdateData = Database["public"]["Tables"]["activity_logs"]["Update"];

// Type for the data fetched by the list service, potentially with joined user info
export interface ActivityLogListData extends ActivityLog {
  // Add explicit fields expected from the joined query
  user_email: string | null;
  user_full_name: string | null;
}

// Type for data returned by the API list endpoint
export type ActivityLogDisplay = ActivityLog & {
  user_email?: string; // Example if API joins profile
};

// No Create/Update needed for logs via service

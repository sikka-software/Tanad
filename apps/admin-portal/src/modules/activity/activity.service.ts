import { subHours, subDays, startOfDay, endOfDay } from "date-fns";

import { createClient } from "@/utils/supabase/component";

import type { ActivityFilters } from "./activity.store";
import type { ActivityLogListData, ActivityLog } from "./activity.type";

// Import filters type

// Define the type returned by the RPC function based on its definition
type ActivityLogRpcResult = {
  id: string;
  enterprise_id: string;
  user_id: string;
  action_type: ActivityLog["action_type"]; // Assuming ActivityLog type has these
  target_type: ActivityLog["target_type"];
  target_id: string | null;
  target_name: string | null;
  details: any | null; // jsonb
  created_at: string; // timestamp with time zone
  user_email: string | null;
  user_full_name: string | null;
};

export class ActivityService {
  private static readonly TABLE_NAME = "activity_logs";

  /**
   * List all activity log records for the user's enterprise using an RPC function.
   * Applies filtering and pagination client-side after fetching all logs via RPC.
   */
  static async list(
    page = 1,
    pageSize = 20,
    filters?: ActivityFilters, // Add filters parameter
  ): Promise<ActivityLogListData[]> {
    const supabase = createClient();

    // 1. Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error("ActivityService.list: Error fetching session or no user found", sessionError);
      throw new Error("User session not found.");
    }
    const user_id = session.user.id;

    // 2. Get the user's enterprise_id from memberships
    const { data: membership, error: enterpriseError } = await supabase
      .from("memberships")
      .select("enterprise_id")
      .eq("profile_id", user_id)
      .maybeSingle();

    if (enterpriseError) {
      console.error("ActivityService.list: Error fetching enterprise ID:", enterpriseError);
      throw new Error("Failed to retrieve enterprise association.");
    }
    if (!membership?.enterprise_id) {
      console.warn("ActivityService.list: User is not associated with an enterprise.");
      return []; // Or throw an error, depending on expected behavior
      // throw new Error("User is not associated with an enterprise.");
    }
    const enterprise_id = membership.enterprise_id;

    // 3. Call the RPC function with the fetched enterprise_id
    // Fetches ALL logs for the enterprise.
    const { data, error } = await supabase.rpc("get_activity_logs_with_user_email", {
      p_enterprise_id: enterprise_id,
    });

    if (error) {
      console.error("ActivityService.list error calling RPC:", error);
      throw error;
    }

    // Explicitly type the data returned from Supabase RPC
    const rpcData = (data || []) as ActivityLogRpcResult[];

    // Manually map the RPC result data to the expected ActivityLogListData format
    let formattedData = rpcData.map((log: ActivityLogRpcResult) => ({
      ...log,
      user_full_name: log.user_full_name ?? null,
      target_id: log.target_id ?? undefined,
      target_name: log.target_name ?? undefined,
      details: log.details ?? undefined,
    })) as ActivityLogListData[];

    // 4. Apply client-side filtering
    if (filters) {
      const { searchQuery, date, eventType, user, timeRange } = filters;

      formattedData = formattedData.filter((log) => {
        const logDate = new Date(log.created_at);

        // Date filter (if specific date is selected)
        if (date) {
          const start = startOfDay(date);
          const end = endOfDay(date);
          if (logDate < start || logDate > end) return false;
        }

        // Time range filter (if specific date is NOT selected)
        if (!date && timeRange !== "all") {
          let startDate: Date;
          const now = new Date();
          switch (timeRange) {
            case "1h":
              startDate = subHours(now, 1);
              break;
            case "24h":
              startDate = subHours(now, 24);
              break;
            case "7d":
              startDate = subDays(now, 7);
              break;
            case "30d":
              startDate = subDays(now, 30);
              break;
            case "90d":
              startDate = subDays(now, 90);
              break;
            default:
              startDate = new Date(0); // Effectively no start date limit
          }
          if (logDate < startDate) return false;
        }

        // Event type filter
        if (eventType !== "all" && log.action_type?.toLowerCase() !== eventType.toLowerCase()) {
          return false;
        }

        console.log("useuuuuuur", user);
        console.log("log.user_id", log);
        console.log("is included? user.includes(log.user_id)", user.includes(log.user_id));
        // User filter (using the user ID array)
        if (user && user.length > 0 && !user.includes(log.user_id)) {
          return false; // If user filter is set and log's user is not in the selected list, exclude it
        }

        // Search query filter (searches across multiple fields)
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          const searchableFields = [
            log.user_full_name,
            log.user_email,
            log.action_type,
            log.target_type,
            log.target_name,
            log.target_id,
            // Add details if it's string searchable, be careful with performance
            // typeof log.details === 'string' ? log.details : '',
          ];
          if (!searchableFields.some((field) => field?.toLowerCase().includes(lowerQuery))) {
            return false;
          }
        }

        return true; // Log passes all filters
      });
    }

    // 5. Apply client-side pagination to the filtered data
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return formattedData.slice(start, end);
  }

  /**
   * Get a single activity log record.
   */
  static async get(id: string): Promise<ActivityLog> {
    const supabase = createClient();
    const { data, error } = await supabase.from(this.TABLE_NAME).select("*").eq("id", id).single();

    if (error) {
      console.error("ActivityService.get error:", error);
      throw error;
    }
    return data;
  }

  // --- Other standard service methods (Create, Update, Delete, BulkDelete, Duplicate) ---
  // Activity logs are typically append-only and often generated by triggers,
  // so these methods might not be directly used by the UI but are included
  // for consistency or potential future administrative actions.

  static async delete(id: string): Promise<void> {
    const supabase = createClient();
    // Be cautious deleting logs. Usually requires specific permissions.
    const { error } = await supabase.from(this.TABLE_NAME).delete().eq("id", id);

    if (error) {
      console.error("ActivityService.delete error:", error);
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    const supabase = createClient();
    // Be cautious deleting logs. Usually requires specific permissions.
    const { error } = await supabase.from(this.TABLE_NAME).delete().in("id", ids);

    if (error) {
      console.error("ActivityService.bulkDelete error:", error);
      throw error;
    }
  }

  // Create, Update, Duplicate are less applicable to immutable logs
  // but stubs can be added if needed for administrative tasks.
}

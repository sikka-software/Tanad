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

const TABLE_NAME = "activity_logs";

/**
 * List all activity log records for the user's enterprise using an RPC function.
 * Applies filtering and pagination client-side after fetching all logs via RPC.
 */
export async function listActivities(
  page = 1,
  pageSize = 20,
  filters?: ActivityFilters, // Add filters parameter
): Promise<{ logs: ActivityLogListData[]; totalCount: number }> {
  const supabase = createClient();

  // 1. Get the current user's session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    console.error("listActivities: Error fetching session or no user found", sessionError);
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
    console.error("listActivities: Error fetching enterprise ID:", enterpriseError);
    throw new Error("Failed to retrieve enterprise association.");
  }
  if (!membership?.enterprise_id) {
    console.warn("listActivities: User is not associated with an enterprise.");
    return { logs: [], totalCount: 0 }; // Or throw an error, depending on expected behavior
    // throw new Error("User is not associated with an enterprise.");
  }
  const enterprise_id = membership.enterprise_id;

  // 3. Call the RPC function with the fetched enterprise_id
  // Fetches ALL logs for the enterprise.
  const { data, error } = await supabase.rpc("get_activity_logs_with_user_email", {
    p_enterprise_id: enterprise_id,
  });

  if (error) {
    console.error("listActivities error calling RPC:", error);
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
    const { searchQuery, eventType, user, dateRange } = filters;

    formattedData = formattedData.filter((log) => {
      const logDate = new Date(log.created_at);

      // Add logging for date comparison
      const fromDate = dateRange?.from ? startOfDay(dateRange.from) : null;
      const toDate = dateRange?.to ? endOfDay(dateRange.to) : null;
      console.log(
        `Filtering Log ID: ${log.id}, Log Date: ${logDate.toISOString()}, Filter From: ${fromDate?.toISOString() || "N/A"}, Filter To: ${toDate?.toISOString() || "N/A"}`,
      );

      // Date range filter
      if (fromDate) {
        console.log(
          `Comparing: ${logDate.toISOString()} < ${fromDate.toISOString()} = ${logDate < fromDate}`,
        );
        if (logDate < fromDate) return false;
      }
      if (toDate) {
        console.log(
          `Comparing: ${logDate.toISOString()} > ${toDate.toISOString()} = ${logDate > toDate}`,
        );
        if (logDate > toDate) return false;
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

  const totalCount = formattedData.length; // Get total count after filtering

  // 5. Apply client-side pagination to the filtered data
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedLogs = formattedData.slice(start, end);

  return { logs: paginatedLogs, totalCount }; // Return new structure
}

/**
 * Get a single activity log record.
 */
export async function getActivity(id: string): Promise<ActivityLog> {
  const supabase = createClient();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).single();

  if (error) {
    console.error("getActivity error:", error);
    throw error;
  }
  return data;
}

/**
 * Fetch all activity logs for the enterprise, apply filters, and return for export.
 */
export async function exportActivities(
  filters?: ActivityFilters, // Add filters parameter
): Promise<ActivityLogListData[]> {
  const supabase = createClient();

  // 1. Get the current user's session (same as list method)
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    console.error("exportActivities: Error fetching session or no user found", sessionError);
    throw new Error("User session not found.");
  }
  const user_id = session.user.id;

  // 2. Get the user's enterprise_id (same as list method)
  const { data: membership, error: enterpriseError } = await supabase
    .from("memberships")
    .select("enterprise_id")
    .eq("profile_id", user_id)
    .maybeSingle();

  if (enterpriseError) {
    console.error("exportActivities: Error fetching enterprise ID:", enterpriseError);
    throw new Error("Failed to retrieve enterprise association.");
  }
  if (!membership?.enterprise_id) {
    console.warn("exportActivities: User is not associated with an enterprise.");
    return [];
  }
  const enterprise_id = membership.enterprise_id;

  // 3. Call the RPC function (same as list method)
  const { data, error } = await supabase.rpc("get_activity_logs_with_user_email", {
    p_enterprise_id: enterprise_id,
  });

  if (error) {
    console.error("exportActivities error calling RPC:", error);
    throw error;
  }

  const rpcData = (data || []) as ActivityLogRpcResult[];

  // Manually map the RPC result data (same as list method)
  let formattedData = rpcData.map((log: ActivityLogRpcResult) => ({
    ...log,
    user_full_name: log.user_full_name ?? null,
    target_id: log.target_id ?? undefined,
    target_name: log.target_name ?? undefined,
    details: log.details ?? undefined,
  })) as ActivityLogListData[];

  // 4. Apply client-side filtering (same as list method)
  if (filters) {
    const { searchQuery, eventType, user, dateRange } = filters;

    formattedData = formattedData.filter((log) => {
      const logDate = new Date(log.created_at);
      const fromDate = dateRange?.from ? startOfDay(dateRange.from) : null;
      const toDate = dateRange?.to ? endOfDay(dateRange.to) : null;

      if (fromDate && logDate < fromDate) return false;
      if (toDate && logDate > toDate) return false;
      if (eventType !== "all" && log.action_type?.toLowerCase() !== eventType.toLowerCase()) {
        return false;
      }
      if (user && user.length > 0 && !user.includes(log.user_id)) {
        return false;
      }
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const searchableFields = [
          log.user_full_name,
          log.user_email,
          log.action_type,
          log.target_type,
          log.target_name,
          log.target_id,
        ];
        if (!searchableFields.some((field) => field?.toLowerCase().includes(lowerQuery))) {
          return false;
        }
      }
      return true;
    });
  }

  // 5. Return ALL filtered data (no pagination)
  return formattedData;
}

// --- New Method ---
/**
 * Fetches activity log counts grouped by date for a given period using RPC.
 */
export async function getActivityCountsByDate(
  startDate: Date,
  endDate: Date,
): Promise<{ date: string; count: number }[]> {
  const supabase = createClient();

  // 1. Get enterprise ID
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    console.error("getActivityCountsByDate: Error fetching session or no user found", sessionError);
    throw new Error("User session not found.");
  }
  const user_id = session.user.id;

  const { data: membership, error: enterpriseError } = await supabase
    .from("memberships")
    .select("enterprise_id")
    .eq("profile_id", user_id)
    .maybeSingle();

  if (enterpriseError) {
    console.error("getActivityCountsByDate: Error fetching enterprise ID:", enterpriseError);
    throw new Error("Failed to retrieve enterprise association.");
  }
  if (!membership?.enterprise_id) {
    console.warn("getActivityCountsByDate: User is not associated with an enterprise.");
    return []; // Return empty if no enterprise
  }
  const enterprise_id = membership.enterprise_id;

  // 2. Call the RPC function
  const { data, error } = await supabase.rpc("get_daily_activity_counts", {
    p_enterprise_id: enterprise_id,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    console.error("getActivityCountsByDate RPC error:", error);
    throw error;
  }

  // 3. Map the result (ensure date is string YYYY-MM-DD, count is number)
  return (data || []).map((row: { activity_date: string; activity_count: number }) => ({
    date: row.activity_date, // Assuming this is YYYY-MM-DD string from the 'date' type in PG
    count: Number(row.activity_count), // Ensure count is a number
  }));
}

import type { ActivityLog } from "@/modules/activity/activity.type";

const API_BASE_URL = "/api/resource/activity";

// Fetches all activity logs (consider pagination in API/service if needed)
export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      console.error("Failed to fetch activity logs:", response.statusText);
      // Optionally throw an error or return a default value
      throw new Error(`Failed to fetch activity logs: ${response.statusText}`);
      // return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error; // Re-throw the error to be caught by the caller
    // return [];
  }
}

// Note: Activity logs are typically read-only from the frontend.
// Create, Update, Delete operations are usually handled server-side (triggers/actions).
// Therefore, service methods for CUD are omitted here.

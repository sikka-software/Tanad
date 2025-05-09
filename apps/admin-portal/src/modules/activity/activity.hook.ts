import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  listActivities,
  getActivity,
  exportActivities,
  // Assuming you might want a hook for this, e.g., for triggering download
  getActivityCountsByDate,
} from "./activity.service";
// For filter types
import type { ActivityFilters, useActivityLogStore } from "./activity.store";
import type { ActivityLog, ActivityLogListData } from "./activity.type";

export const activityLogKeys = {
  all: ["activityLogs"] as const,
  lists: () => [...activityLogKeys.all, "list"] as const,
  list: (filters?: ActivityFilters, page?: number, pageSize?: number) =>
    [
      ...activityLogKeys.lists(),
      { filters: { ...filters }, page, pageSize }, // Spread filters to ensure new object for query key changes
    ] as const,
  details: () => [...activityLogKeys.all, "detail"] as const,
  detail: (id: string) => [...activityLogKeys.details(), id] as const,
  countsByDate: (startDate?: Date, endDate?: Date) =>
    [...activityLogKeys.all, "countsByDate", { startDate, endDate }] as const,
};

// Hook to fetch a paginated list of activity logs
export function useActivityLogs(page: number, pageSize: number, filters?: ActivityFilters) {
  return useQuery<{ logs: ActivityLogListData[]; totalCount: number }, Error>({
    queryKey: activityLogKeys.list(filters, page, pageSize),
    queryFn: () => listActivities(page, pageSize, filters),
    placeholderData: (
      previousData: { logs: ActivityLogListData[]; totalCount: number } | undefined,
    ) => previousData,
    // keepPreviousData: true, // TanStack Query v5 uses placeholderData
  });
}

// Hook to fetch a single activity log by ID
export function useActivityLog(id: string) {
  return useQuery<ActivityLog, Error>({
    queryKey: activityLogKeys.detail(id),
    queryFn: () => getActivity(id),
    enabled: !!id, // Only run query if ID is provided
  });
}

// Hook to fetch activity counts grouped by date
export function useActivityCountsByDate(startDate?: Date, endDate?: Date) {
  return useQuery<{ date: string; count: number }[], Error>({
    queryKey: activityLogKeys.countsByDate(startDate, endDate),
    queryFn: () => {
      if (!startDate || !endDate) {
        return Promise.resolve([]); // Or handle error/state appropriately
      }
      return getActivityCountsByDate(startDate, endDate);
    },
    enabled: !!startDate && !!endDate, // Only run if both dates are provided
  });
}

// Hook for triggering export - this might just call the service method
// and then handle the file download logic, not a typical data mutation/query
export function useExportActivityLogs() {
  const t = useTranslations();
  // This hook doesn't use useMutation directly if it's just for triggering a download
  // It could, if the export process is a long-running task you want to track

  const exportLogs = async (filters?: ActivityFilters) => {
    try {
      toast.info(t("ActivityLogs.info.export_started")); // Assuming key
      const data = await exportActivities(filters);
      // Here, you would typically convert `data` (CSV, JSON, etc.) to a blob and trigger download
      // For example, to download as JSON:
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2),
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `activity_logs_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      toast.success(t("ActivityLogs.success.export_completed")); // Assuming key
    } catch (error: any) {
      console.error("Export failed:", error);
      toast.error(t("General.error_occurred"), {
        description: error.message || t("ActivityLogs.error.export_failed"),
      });
    }
  };

  return { exportLogs };
}

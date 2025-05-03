"use client";

import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { useRelativeTime } from "@/hooks/use-relative-time";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ActivityService } from "./activity.service";
import { useActivityLogStore } from "./activity.store";
import type { ActivityLogListData } from "./activity.type";

interface ActivityLogTableProps {
  // Removed eventType as filtering is not implemented in service yet
}

export function ActivityLogTable({}: ActivityLogTableProps) {
  const t = useTranslations();
  const { openDialog, filters } = useActivityLogStore();
  const [activityLogs, setActivityLogs] = useState<ActivityLogListData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [hasNextPage, setHasNextPage] = useState(true);
  const localizedTimeDistance = (item: ActivityLogListData) => {
    const format = useFormatter();

    // 1. Get the timestamp.
    const createdAt = item.created_at; // e.g., "2025-05-03T17:41:17.000Z" or a timestamp number

    // 2. Ensure it's a Date object.
    //    If createdAt is already a Date object, you can skip wrapping it.
    //    If it's a string (like ISO 8601), new Date() usually works.
    //    If it's a number (milliseconds since epoch), new Date() works too.
    //    If it's a different string format, you might need parsing (e.g., with date-fns).
    const createdAtDate = new Date(createdAt);

    // 3. Check if the date is valid before formatting
    const isValidDate = !isNaN(createdAtDate.getTime());

    // 4. Format the date relatively using the formatter
    //    next-intl's format.relativeTime handles calculating the difference
    //    and selecting the appropriate unit (seconds, minutes, hours, etc.)
    //    and formatting it according to the active locale (e.g., 'ar').
    const relativeTimeString = isValidDate ? format.relativeTime(createdAtDate) : "Invalid Date"; // Fallback for invalid dates
    return relativeTimeString;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching logs with filters:", JSON.stringify(filters, null, 2));
        const data = await ActivityService.list(page, itemsPerPage, filters);
        setActivityLogs(data);
        setHasNextPage(data.length === itemsPerPage);
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [page, filters]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };
  const format = useFormatter();
  const now = new Date();

  const getActionBadgeVariant = (
    actionType: string | null,
  ): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (actionType?.toUpperCase()) {
      case "CREATE":
        return "default";
      case "UPDATE":
        return "default";
      case "DELETE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const badgeColor = (actionType: string | null): string => {
    console.log(actionType);
    switch (actionType?.toUpperCase()) {
      case "CREATED":
        return "bg-green-300 dark:bg-green-900";
      case "UPDATED":
        return "bg-blue-300 dark:bg-blue-900";
      case "DELETED":
        return "bg-red-300 dark:bg-red-900";
      default:
        return "bg-gray-300 dark:bg-gray-900";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  Error loading activity logs: {error}
                </TableCell>
              </TableRow>
            ) : activityLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              activityLogs.map((item) => {
                const diffInSeconds = Math.floor(
                  (now.getTime() - new Date(item.created_at).getTime()) / 1000,
                );

                let value: number;
                let unit: Intl.RelativeTimeFormatUnit;

                if (diffInSeconds < 60) {
                  value = -diffInSeconds;
                  unit = "second";
                } else if (diffInSeconds < 3600) {
                  value = -Math.floor(diffInSeconds / 60);
                  unit = "minute";
                } else if (diffInSeconds < 86400) {
                  value = -Math.floor(diffInSeconds / 3600);
                  unit = "hour";
                } else {
                  value = -Math.floor(diffInSeconds / 86400);
                  unit = "day";
                }

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder-user.jpg`}
                            alt={item.user_full_name || item.user_email || "User"}
                          />
                          <AvatarFallback>
                            {(item.user_full_name || item.user_email || "U")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <div className="font-medium">
                            {item.user_full_name || "System/Unknown"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {item.user_email || "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={getActionBadgeVariant(item.action_type)}
                            className={badgeColor(item.action_type)}
                          >
                            {t(`General.${item.action_type?.toLowerCase() || "unknown"}`) ||
                              "Unknown"}
                          </Badge>
                          <ArrowRight className="text-muted-foreground h-3 w-3 rtl:rotate-180" />
                          <Badge variant="outline" className="text-xs capitalize">
                            {t(`General.${item.target_type?.toLowerCase() || "N/A"}`) || "N/A"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t(`ActivityLogs.action_description.${item.action_type.toLowerCase()}`, {
                            action: t(`General.${item.action_type.toLowerCase()}`),
                            target: t(`General.${item.target_type?.toLowerCase()}`) || "item",
                            name: item.target_name || item.target_id || "N/A",
                          })}
                          {/* {getActionPastTense(item.action_type)} */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate text-xs">
                      {/* {typeof item.details === 'string' ? item.details : JSON.stringify(item.details)} */}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span>{format.relativeTime(new Date(item.created_at))}</span>
                        {/* <span>{localizedTimeDistance(item)}</span> */}
                        <span className="text-muted-foreground text-[10px]">
                          {item.created_at ? format.dateTime(new Date(item.created_at), "PPpp") : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[50px] text-right">
                      <IconButton
                        icon={<Eye className="h-4 w-4" />}
                        label={t("General.preview")}
                        variant="ghost"
                        size="icon_sm"
                        onClick={() => openDialog(item)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {page > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage || isLoading}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

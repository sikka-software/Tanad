"use client";

import { ArrowRight, Eye } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { useDebounce } from "use-debounce";

import TablePagination from "@/components/table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import IconButton from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { useActivityLogs } from "./activity.hook";
import { useActivityLogStore } from "./activity.store";
import type { ActivityLogListData } from "./activity.type";

export function ActivityLogTable() {
  const t = useTranslations();
  const { openDialog, filters } = useActivityLogStore();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const format = useFormatter();
  const now = new Date();

  const [debouncedFilters] = useDebounce(filters, 500);

  const {
    data: activityLogResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useActivityLogs(page, itemsPerPage, debouncedFilters);

  const activityLogs = activityLogResponse?.logs || [];
  const totalLogs = activityLogResponse?.totalCount || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
            {isFetching ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableRow key={`skeleton-${index}-fetching`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-[42px] w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  {t("Activity.error_fetching")}: {error?.message || "Unknown error"}
                </TableCell>
              </TableRow>
            ) : activityLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  {t("Activity.no_activity_logs_found")}
                </TableCell>
              </TableRow>
            ) : (
              activityLogs.map((item: ActivityLogListData) => {
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
                          <Badge variant="outline" className="text-xs">
                            {t(`General.${item.target_type?.toLowerCase() || "N/A"}`) || "N/A"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t(`Activity.action_description.${item.action_type.toLowerCase()}`, {
                            action: t(`General.${item.action_type.toLowerCase()}`),
                            target: t(`General.${item.target_type?.toLowerCase()}`) || "item",
                            name: item.target_name || item.target_id || "N/A",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate text-xs">
                      {/* Details cell can be populated if needed */}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span>{format.relativeTime(new Date(item.created_at))}</span>
                        <span className="text-muted-foreground hidden text-[10px] lg:block">
                          {item.created_at
                            ? format.dateTime(new Date(item.created_at), "PPpp")
                            : "N/A"}
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
      {totalLogs > 0 && !isLoading && !isError && (
        <TablePagination
          currentPage={page}
          totalPages={Math.ceil(totalLogs / itemsPerPage)}
          onPageChange={handlePageChange}
          paginationItemsToDisplay={5}
        />
      )}
    </div>
  );
}

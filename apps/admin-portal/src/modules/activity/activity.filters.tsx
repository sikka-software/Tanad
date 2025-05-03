"use client";

import { format } from "date-fns";
import { CalendarIcon, Download, Filter, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

interface ActivityLogFiltersProps {
  // Removed unused eventType prop
}

export function ActivityLogFilters({}: ActivityLogFiltersProps) {
  // Removed prop from destructuring
  const t = useTranslations();
  const locale = useLocale();
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    setDate(undefined);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder={t("ActivityLogs.filters.search")}
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>{t("ActivityLogs.filters.filter")}</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : t("ActivityLogs.filters.pickDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("ActivityLogs.filters.export")}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("ActivityLogs.filters.eventType")}</label>
            <Select defaultValue="all" dir={locale === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger>
                <SelectValue placeholder={t("ActivityLogs.filters.selectEventType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ActivityLogs.filters.allEvents")}</SelectItem>
                <SelectItem value="login">{t("ActivityLogs.filters.login")}</SelectItem>
                <SelectItem value="logout">{t("ActivityLogs.filters.logout")}</SelectItem>
                <SelectItem value="create">{t("ActivityLogs.filters.create")}</SelectItem>
                <SelectItem value="update">{t("ActivityLogs.filters.update")}</SelectItem>
                <SelectItem value="delete">{t("ActivityLogs.filters.delete")}</SelectItem>
                <SelectItem value="deploy">{t("ActivityLogs.filters.deploy")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("ActivityLogs.filters.user")}</label>
            <Select defaultValue="all" dir={locale === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger>
                <SelectValue placeholder={t("ActivityLogs.filters.selectUser")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ActivityLogs.filters.allUsers")}</SelectItem>
                <SelectItem value="admin">{t("ActivityLogs.filters.administrators")}</SelectItem>
                <SelectItem value="dev">{t("ActivityLogs.filters.developers")}</SelectItem>
                <SelectItem value="viewer">{t("ActivityLogs.filters.viewers")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("ActivityLogs.filters.timeRange")}</label>
            <Select defaultValue="24h" dir={locale === "ar" ? "rtl" : "ltr"}>
              <SelectTrigger>
                <SelectValue placeholder={t("ActivityLogs.filters.selectTimeRange")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">{t("ActivityLogs.filters.lastHour")}</SelectItem>
                <SelectItem value="24h">{t("ActivityLogs.filters.last24Hours")}</SelectItem>
                <SelectItem value="7d">{t("ActivityLogs.filters.last7Days")}</SelectItem>
                <SelectItem value="30d">{t("ActivityLogs.filters.last30Days")}</SelectItem>
                <SelectItem value="90d">{t("ActivityLogs.filters.last90Days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end md:col-span-3">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              {t("ActivityLogs.filters.clearFilters")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

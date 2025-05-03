"use client";

import { format } from "date-fns";
import { CalendarIcon, Download, Filter, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import IconButton from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

import { ProfileType } from "@/stores/use-user-store";

import { useUsers } from "../user/user.hooks";
import { useActivityLogStore } from "./activity.store";

interface ActivityLogFiltersProps {}

export function ActivityLogFilters({}: ActivityLogFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { filters, setFilters, clearFilters } = useActivityLogStore();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const handleClearFilters = () => {
    clearFilters();
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
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <IconButton
                icon={<Filter className="h-4 w-4" />}
                label={t("General.filter")}
                variant="outline"
                className="size-9"
              />
            </PopoverTrigger>
            <PopoverContent
              className="w-screen max-w-sm p-0"
              align="end"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <div className="grid grid-cols-1 gap-4 rounded-md border p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("ActivityLogs.filters.event_type")}
                  </label>
                  <Select
                    value={filters.eventType}
                    onValueChange={(value) => setFilters({ eventType: value })}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("ActivityLogs.filters.select_event_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("ActivityLogs.filters.all_events")}</SelectItem>
                      <SelectItem value="created">{t("ActivityLogs.filters.create")}</SelectItem>
                      <SelectItem value="updated">{t("ActivityLogs.filters.update")}</SelectItem>
                      <SelectItem value="deleted">{t("ActivityLogs.filters.delete")}</SelectItem>
                      <SelectItem value="duplicated">
                        {t("ActivityLogs.filters.duplicate")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("ActivityLogs.filters.date_range")}</Label>
                  <DatePicker
                    placeholder={t("ActivityLogs.filters.select_date_range")}
                    date={filters.dateRange}
                    onSelect={(d) => {
                      if (d === undefined || (d && "from" in d)) {
                        setFilters({ dateRange: d });
                      }
                    }}
                    mode="range"
                    isolated
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("ActivityLogs.filters.user")}</label>
                  <MultiSelect
                    options={
                      users?.map((user) => ({
                        id: user.id,
                        component: (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.full_name}</span>
                            <span className="text-muted-foreground text-sm">{user.email}</span>
                          </div>
                        ),
                        label: user.email,
                        value: user.id,
                      })) || []
                    }
                    onValueChange={(selectedUserIds) => setFilters({ user: selectedUserIds })}
                    value={filters.user}
                    placeholder={t("ActivityLogs.filters.selectUser")}
                    className="w-full"
                    loading={isLoadingUsers}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    {t("ActivityLogs.filters.clearFilters")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <IconButton
            icon={<Download className="h-4 w-4" />}
            label={t("General.export")}
            variant="outline"
            className="size-9"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Document, Page, PDFDownloadLink, Text, pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  CalendarIcon,
  Download,
  Filter,
  Search,
  X,
  Loader2,
  ChevronDown,
  DownloadIcon,
  FileIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, Fragment, useMemo } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { downloadCSV } from "@/lib/csv-utils";
import { cn } from "@/lib/utils";

import { ProfileType } from "@/stores/use-user-store";

import { useUsers } from "../user/user.hooks";
import { ActivityLogPDFDocument } from "./activity.pdf";
import { exportActivities } from "./activity.service";
import { useActivityLogStore } from "./activity.store";
import type { ActivityLogListData } from "./activity.type";

interface ActivityLogFiltersProps {}

export function ActivityLogFilters({}: ActivityLogFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { filters, setFilters, clearFilters } = useActivityLogStore();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const [isProcessingExport, setIsProcessingExport] = useState(false);
  const [pdfData, setPdfData] = useState<ActivityLogListData[] | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleExportCSV = async () => {
    setPdfData(null);
    setIsProcessingExport(true);
    const toastId = toast.loading(t("Activity.export.loading"));
    try {
      const logsToExport = await exportActivities(filters);

      if (logsToExport.length === 0) {
        toast.info(t("Activity.export.noData"), { id: toastId });
        return;
      }

      const headers = [
        { label: t("Activity.export.headers.timestamp"), key: "created_at" },
        { label: t("Activity.export.headers.userEmail"), key: "user_email" },
        { label: t("Activity.export.headers.userName"), key: "user_full_name" },
        { label: t("Activity.export.headers.actionType"), key: "action_type" },
        { label: t("Activity.export.headers.targetType"), key: "target_type" },
        { label: t("Activity.export.headers.targetName"), key: "target_name" },
        { label: t("Activity.export.headers.targetId"), key: "target_id" },
        { label: t("Activity.export.headers.details"), key: "details" },
      ];

      const formattedData = logsToExport.map((log) => ({
        ...log,
        created_at: format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        details: typeof log.details === "object" ? JSON.stringify(log.details) : log.details,
      }));

      downloadCSV(
        formattedData,
        headers,
        `activity_logs_${format(new Date(), "yyyyMMddHHmmss")}.csv`,
      );
      toast.success(t("Activity.export.successCSV"), { id: toastId });
    } catch (error) {
      console.error("Failed to export activity logs as CSV:", error);
      toast.error(t("Activity.export.errorCSV"), { id: toastId });
    } finally {
      setIsProcessingExport(false);
    }
  };

  const handlePreparePDF = async () => {
    setPdfData(null);
    setIsProcessingExport(true);
    const toastId = toast.loading(t("Activity.export.preparingPDF"));
    try {
      const logsToExport = await exportActivities(filters);

      if (logsToExport.length === 0) {
        toast.info(t("Activity.export.noData"), { id: toastId });
        setPdfData([]);
        return;
      }

      setPdfData(logsToExport);
      toast.success(t("Activity.export.readyPDF"), { id: toastId, duration: 2000 });
    } catch (error) {
      console.error("Failed to prepare activity logs for PDF export:", error);
      toast.error(t("Activity.export.errorPDF"), { id: toastId });
      setPdfData(null);
    } finally {
      setTimeout(() => setIsProcessingExport(false), 500);
    }
  };

  const handleDownloadPdfClick = async () => {
    if (!pdfData || pdfData.length === 0 || isGeneratingLink) return;

    setIsGeneratingLink(true);
    const toastId = toast.loading(t("Activity.export.generatingPDF"));

    try {
      const docElement = <ActivityLogPDFDocument data={pdfData} title={t("Activity.pdfTitle")} />;
      const blob = await pdf(docElement).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity_logs_${format(new Date(), "yyyyMMddHHmmss")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("Activity.export.successPDF"), { id: toastId });
    } catch (error) {
      console.error("Failed to generate or download PDF:", error);
      toast.error(t("Activity.export.errorPDF"), { id: toastId });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder={t("Activity.filters.search")}
            className="w-full ps-8"
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
                  <label className="text-sm font-medium">{t("Activity.filters.event_type")}</label>
                  <Select
                    value={filters.eventType}
                    onValueChange={(value) => setFilters({ eventType: value })}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Activity.filters.select_event_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("Activity.filters.all_events")}</SelectItem>
                      <SelectItem value="created">{t("Activity.filters.create")}</SelectItem>
                      <SelectItem value="updated">{t("Activity.filters.update")}</SelectItem>
                      <SelectItem value="deleted">{t("Activity.filters.delete")}</SelectItem>
                      <SelectItem value="duplicated">{t("Activity.filters.duplicate")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("Activity.filters.date_range")}</Label>
                  <DatePicker
                    placeholder={t("Activity.filters.select_date_range")}
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
                  <label className="text-sm font-medium">{t("Activity.filters.user")}</label>
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
                    placeholder={t("Activity.filters.selectUser")}
                    className="w-full"
                    loading={isLoadingUsers}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="me-2 h-4 w-4" />
                    {t("Activity.filters.clearFilters")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={
                  isProcessingExport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )
                }
                label={t("General.export")}
                variant="outline"
                className="size-9"
                disabled={isProcessingExport}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={handleExportCSV}
                disabled={isProcessingExport}
                dir="ltr"
                style={{
                  direction: "ltr",
                }}
              >
                {t("Activity.export.exportAs", {
                  fileType: "CSV",
                })}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  if (pdfData && pdfData.length > 0 && !isGeneratingLink) {
                    handleDownloadPdfClick();
                  } else if (!pdfData && !isProcessingExport) {
                    handlePreparePDF();
                  }
                }}
                disabled={
                  isProcessingExport ||
                  isGeneratingLink ||
                  (pdfData !== null && pdfData.length === 0)
                }
                className={cn(
                  "relative",
                  (isProcessingExport ||
                    isGeneratingLink ||
                    (pdfData !== null && pdfData.length === 0)) &&
                    "cursor-not-allowed opacity-50",
                  !isProcessingExport &&
                    !isGeneratingLink &&
                    (pdfData === null || (pdfData && pdfData.length > 0)) &&
                    "cursor-pointer",
                )}
              >
                {isProcessingExport ? (
                  <span>{t("Activity.export.preparingPDFShort")}</span>
                ) : isGeneratingLink ? (
                  <span>{t("Activity.export.generatingPDF")}</span>
                ) : pdfData === null ? (
                  <span>
                    {t("Activity.export.exportAs", {
                      fileType: "PDF",
                    })}
                  </span>
                ) : pdfData.length === 0 ? (
                  <span className="text-muted-foreground">{t("Activity.export.noData")}</span>
                ) : (
                  <span>
                    {t("Activity.export.downloadPDF", {
                      fileType: "PDF",
                    })}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

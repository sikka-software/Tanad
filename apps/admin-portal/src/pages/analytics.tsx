import { ColumnDef } from "@tanstack/react-table";
import {
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { ChartConfig } from "@/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
// UI Components
import { Skeleton } from "@/ui/skeleton";

import { createClient } from "@/utils/supabase/component";

import { CrudChart } from "@/components/analytics/crud-chart";
// Store
// import { useMainStore } from "@/hooks/main.store"; // User removed this

import AnalyticsTable from "@/components/app/AnalyticsTable";
// import NoPuklas from "@/components/app/NoPuklas"; // User removed this
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { fakeAnalyticsData } from "@/lib/constants";

// Utils
// import { fetchPukla, fetchPuklasWithLinkCount } from "@/lib/operations"; // User removed this

import useUserStore from "@/stores/use-user-store";

import LinesChart from "../components/analytics/lines-chart";

export default function Analytics() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const { locale } = router;

  const [selectedModule, setSelectedModule] = useState<string>("branches");

  const [branchAnalyticsData, setBranchAnalyticsData] = useState<{
    chartData: any[];
    tableData: any[];
  }>({
    chartData: [],
    tableData: [],
  });
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (typeof window !== "undefined") {
      const savedDateRange = localStorage.getItem("analytics_date_range");
      if (savedDateRange) {
        const parsed = JSON.parse(savedDateRange);
        return {
          from: parseISO(parsed.from),
          to: parseISO(parsed.to),
        };
      }
      return {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      };
    }
  });

  useEffect(() => {
    if (date?.from && date?.to) {
      localStorage.setItem(
        "analytics_date_range",
        JSON.stringify({
          from: date.from.toISOString(),
          to: date.to.toISOString(),
        }),
      );
    }
  }, [date]);

  const branchChartConfig = {
    added: { label: t("Analytics.add_actions"), color: "#3b82f6" },
    updated: { label: t("Analytics.update_actions"), color: "#3b82f6" },
    removed: { label: t("Analytics.delete_actions"), color: "#ef4444" },
  } satisfies ChartConfig;

  const fetchAnalytics = async (from: Date, to: Date) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const daysDifference = differenceInDays(to, from);

    if (selectedModule === "branches") {
      const { data: branchDataRpc, error: branchError } = await supabase.rpc(
        "get_module_analytics_branch",
        {
          start_date: from.toISOString(),
          end_date: to.toISOString(),
          time_interval:
            daysDifference <= 1
              ? "hour"
              : daysDifference <= 7
                ? "day"
                : daysDifference <= 31
                  ? "week"
                  : "month",
        },
      );

      if (branchError) {
        console.error("Error fetching branch analytics:", branchError);
        setBranchAnalyticsData({ chartData: [], tableData: [] }); // Clear data on error
        return;
      }

      if (branchDataRpc) {
        const formattedBranchChartData = branchDataRpc.map((item: any) => ({
          label: format(new Date(item.period_start), "P"), // Format date for X-axis label
          added: item.branches_added,
          updated: item.branches_updated,
          removed: item.branches_removed,
        }));
        setBranchAnalyticsData({ chartData: formattedBranchChartData, tableData: branchDataRpc });
      }
    }
    // Add else if for other modules like 'jobs' here
  };

  useEffect(() => {
    if (date?.from && date?.to && selectedModule) {
      // Fetch when module or date changes
      fetchAnalytics(date.from, date.to);
    }
  }, [date, selectedModule]); // Added selectedModule to dependency array

  const getShortFormattedDate = (dateToFormat: Date) => {
    const month = dateToFormat.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day =
      locale === "ar" ? dateToFormat.getDate().toLocaleString("ar-SA") : format(dateToFormat, "d");
    const translatedMonth = t(`General.months.${month}`);
    const displayMonth = locale === "ar" ? translatedMonth : translatedMonth.slice(0, 3);
    return `${displayMonth} ${day}`;
  };

  const getFormattedDate = (dateToFormat: Date) => {
    const month = dateToFormat.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day =
      locale === "ar" ? dateToFormat.getDate().toLocaleString("ar-SA") : format(dateToFormat, "dd");
    const year =
      locale === "ar"
        ? dateToFormat.getFullYear().toLocaleString("ar-SA")
        : format(dateToFormat, "y");
    return `${t(`General.months.${month}`)} ${day}, ${year}`;
  };

  const getDateRangeTitle = () => {
    if (!date?.from || !date?.to) return t("Analytics.select_date_range_first");
    return `${getFormattedDate(date.from)} - ${getFormattedDate(date.to)}`;
  };

  return (
    <>
      <CustomPageMeta
        title={t("SEO.analytics.title")}
        description={t("SEO.analytics.description")}
      />
      <div
        className={
          "bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2"
        }
      >
        <div className="flex flex-1 items-center gap-4">
          <h2 className="text-xl font-medium">{t("Analytics.analytics_overview")}</h2>
          <CardDescription>{getDateRangeTitle()}</CardDescription>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("Analytics.select_module")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="branches">{t("Branches.title")}</SelectItem>
              <SelectItem value="jobs">{t("Jobs.title")}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={"w-full justify-start text-left font-normal md:w-[300px]"}
              >
                <CalendarIcon className="me-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {getFormattedDate(date.from)} - {getFormattedDate(date.to)}
                    </>
                  ) : (
                    getFormattedDate(date.from)
                  )
                ) : (
                  <span>{t("Analytics.select_date_range")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={locale === "ar" ? ar : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <main className="flex flex-row items-center justify-start gap-4 p-4">
        {/* <LinesChart
          title={t("Analytics.crud_analytics_title")}
          description={t("Analytics.crud_analytics_description")}
          data={branchAnalyticsData.chartData}
          config={branchChartConfig}
          xAxisKey="label"
          lines={[
            { dataKey: "added", name: t("Analytics.add_actions"), stroke: "#3b82f6" },
            { dataKey: "removed", name: t("Analytics.delete_actions"), stroke: "#ef4444" },
            { dataKey: "updated", name: t("Analytics.update_actions"), stroke: "#3b82f6" },
          ]}
        /> */}
        <CrudChart
          title={t("Analytics.crud_analytics_title")}
          description={t("Analytics.crud_analytics_description")}
          chartData={branchAnalyticsData.chartData}
          chartConfig={branchChartConfig}
          xAxisKey="label"
        />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

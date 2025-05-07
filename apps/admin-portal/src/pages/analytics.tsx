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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
// UI Components
import { Skeleton } from "@/ui/skeleton";

import { createClient } from "@/utils/supabase/component";

// Store
import { useMainStore } from "@/hooks/main.store";

import AnalyticsTable from "@/components/app/AnalyticsTable";
import NoPuklas from "@/components/app/NoPuklas";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { fakeAnalyticsData } from "@/lib/constants";
// Utils
import { fetchPukla, fetchPuklasWithLinkCount } from "@/lib/operations";

import useUserStore from "@/stores/use-user-store";

export default function Analytics() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const { profile } = useUserStore();
  const { locale } = router;

  let chartConfig = {
    desktop: { label: t("General.desktop"), color: "#2563eb" },
    mobile: { label: t("General.mobile"), color: "#60a5fa" },
  } satisfies ChartConfig;

  const branchChartConfig = {
    added: { label: t("Analytics.branches_added"), color: "#3b82f6" }, // Blue for added
    removed: { label: t("Analytics.branches_removed"), color: "#ef4444" }, // Red for removed
  } satisfies ChartConfig;

  // Define column definitions for click analytics table
  const clickTableColumns: ColumnDef<any>[] = [
    // Use 'any' for now, or a more specific type for click data
    {
      header: t("General.country"),
      accessorKey: "country",
      cell: ({ row }) => <div className="font-medium">{row.getValue("country")}</div>,
    },
    {
      header: t("General.city"),
      accessorKey: "city",
    },
    {
      header: t("General.mobile"),
      accessorKey: "mobile",
      cell: ({ row }) => <div className="text-right">{row.getValue("mobile")}</div>,
    },
    {
      header: t("General.desktop"),
      accessorKey: "desktop",
      cell: ({ row }) => <div className="text-right">{row.getValue("desktop")}</div>,
    },
    {
      header: t("General.total"),
      accessorKey: "total",
      cell: ({ row }) => <div className="text-right">{row.getValue("total")}</div>,
    },
  ];

  // Define column definitions for branch analytics table
  const branchTableColumns: ColumnDef<any>[] = [
    // Use 'any' for now, or a specific type for branch data
    {
      header: t("Analytics.period_start"),
      accessorKey: "period_start",
      cell: ({ row }) =>
        format(new Date(row.getValue("period_start")), "P pp", {
          locale: locale === "ar" ? ar : undefined,
        }),
    },
    {
      header: t("Analytics.branches_added"),
      accessorKey: "branches_added",
      cell: ({ row }) => <div className="text-right">{row.getValue("branches_added")}</div>,
    },
    {
      header: t("Analytics.branches_removed"),
      accessorKey: "branches_removed",
      cell: ({ row }) => <div className="text-right">{row.getValue("branches_removed")}</div>,
    },
  ];

  const [data, setData] = useState<{ chartData: any[]; tableData: any[] }>({
    chartData: [],
    tableData: [],
  });
  const [branchAnalyticsData, setBranchAnalyticsData] = useState<{
    chartData: any[];
    tableData: any[];
  }>({
    chartData: [],
    tableData: [],
  });
  const [date, setDate] = useState<DateRange | undefined>(() => {
    // Try to load saved date range during initialization
    if (typeof window !== "undefined") {
      const savedDateRange = localStorage.getItem("analytics_date_range");
      if (savedDateRange) {
        const parsed = JSON.parse(savedDateRange);
        return {
          from: parseISO(parsed.from),
          to: parseISO(parsed.to),
        };
      }
      // Fall back to default values if nothing is saved
      return {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      };
    }
  });

  // Save date range to localStorage when it changes
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

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchAnalytics(date.from, date.to);
    }
  }, [date]);

  const getShortFormattedDate = (date: Date) => {
    const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day = locale === "ar" ? date.getDate().toLocaleString("ar-SA") : format(date, "d");
    const translatedMonth = t(`General.months.${month}`);
    // Keep full month name for Arabic, shortened for English
    const displayMonth = locale === "ar" ? translatedMonth : translatedMonth.slice(0, 3);
    return `${displayMonth} ${day}`;
  };

  const getFormattedDate = (date: Date) => {
    const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day = locale === "ar" ? date.getDate().toLocaleString("ar-SA") : format(date, "dd");
    const year = locale === "ar" ? date.getFullYear().toLocaleString("ar-SA") : format(date, "y");
    return `${t(`General.months.${month}`)} ${day}, ${year}`;
  };

  const getDateRangeTitle = () => {
    if (!date?.from || !date?.to) return t("analytics");
    return `${getFormattedDate(date.from)} - ${getFormattedDate(date.to)}`;
  };

  const fetchAnalytics = async (from: Date, to: Date) => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate the difference in days between the start and end dates
    const daysDifference = differenceInDays(to, from);
    let chartData;

    // If range is 1 day or less, show hourly data

    // Fetch branch analytics
    const { data: branchData, error: branchError } = await supabase.rpc(
      "get_module_analytics_branch",
      {
        start_date: from.toISOString(),
        end_date: to.toISOString(),
        // Determine time_interval based on daysDifference, similar to clicks analytics
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
      return;
    }

    console.log("branch data", branchData);
    if (branchData) {
      const branchChartData = branchData.map((item: any) => ({
        label: format(new Date(item.period_start), "P"), // Format date for label
        added: item.branches_added,
        removed: item.branches_removed,
      }));
      // Assuming the table will show similar aggregated data or a list of branches
      // For now, let's use the same structure as chart data for the table, this might need adjustment
      setBranchAnalyticsData({ chartData: branchChartData, tableData: branchData });
    }
  };

  return (
    <>
      <CustomPageMeta
        title={t("SEO.analytics.title")}
        description={t("SEO.analytics.description")}
      />
      <main className="flex flex-col items-center justify-between gap-4 p-4">
        <div className="flex w-full flex-col gap-2">
          <Card className="w-full">
            <CardHeader className="flex flex-col justify-between md:flex-row">
              <div className="flex flex-col gap-2">
                <CardTitle>{t("Analytics.analytics_overview")}</CardTitle>
                <CardDescription>{getDateRangeTitle()}</CardDescription>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={"w-[300px] justify-start text-start font-normal"}
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
            </CardHeader>
            <CardContent className="">
              <ChartComponent data={data?.chartData || []} config={chartConfig} />
            </CardContent>
          </Card>
        </div>

        {/* Branch Analytics Section */}
        <div className="flex w-full flex-col gap-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("Analytics.branch_analytics_overview")}</CardTitle>
              <CardDescription>{getDateRangeTitle()}</CardDescription>
            </CardHeader>
            <CardContent>
              <BranchChartComponent
                data={branchAnalyticsData?.chartData || []}
                config={branchChartConfig}
              />
            </CardContent>
          </Card>
        </div>

        {profile?.subscribed_to === "pukla_enterprise" ? (
          <div className="flex w-full flex-col gap-2">
            <AnalyticsTable
              data={data?.tableData || []}
              columns={clickTableColumns} // Pass click table columns
            />
          </div>
        ) : (
          <div className="relative min-h-[300px] w-full">
            <Card className="relative z-[11] flex min-h-[300px] flex-col items-center justify-center bg-transparent">
              <CardHeader className="flex flex-col items-center justify-center gap-2">
                <CardTitle className="text-center">
                  {t("Billing.only_for_enterprise_users")}
                </CardTitle>
                <CardDescription className="text-center">
                  {t("Billing.upgrade_to_enterprise_for_advanced_analytics")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/billing">
                  <Button>{t("General.upgrade")}</Button>
                </Link>
              </CardContent>
            </Card>
            <div className="bg-background absolute top-0 z-[10] h-full w-full [mask-image:linear-gradient(to_top,white,70%,transparent)]"></div>

            <AnalyticsTable
              className="absolute top-0 h-full !min-h-full w-full opacity-30"
              hidePagination
              fake
              columns={clickTableColumns} // Pass click table columns for fake data display
              data={fakeAnalyticsData}
            />
          </div>
        )}
      </main>
    </>
  );
}

export function ChartComponent({ data, config }: { data: any[]; config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="max-h-[300px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill={config.desktop.color} radius={4} />
        <Bar dataKey="mobile" fill={config.mobile.color} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function BranchChartComponent({ data, config }: { data: any[]; config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="max-h-[300px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="added" fill={config.added.color} radius={4} />
        <Bar dataKey="removed" fill={config.removed.color} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

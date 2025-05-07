import { differenceInDays, endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { CardDescription } from "@/ui/card";
import { ChartConfig } from "@/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { createClient } from "@/utils/supabase/component";

import { CrudChart } from "@/components/analytics/crud-chart";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { MODULE_ANALYTICS } from "@/lib/constants";

export default function Analytics() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const { locale } = router;

  const [selectedModule, setSelectedModule] = useState<{
    key: string;
    rpc: string;
    add: string;
    update: string;
    delete: string;
  }>({
    key: "branch",
    rpc: "get_module_analytics_branch",
    add: "branches_added",
    update: "branches_updated",
    delete: "branches_removed",
  });

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

    const { data: dataRpc, error: errorRpc } = await supabase.rpc(selectedModule.rpc, {
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
    });

    if (errorRpc) {
      console.error(`Error fetching ${selectedModule.key} analytics:`, errorRpc);
      setBranchAnalyticsData({ chartData: [], tableData: [] }); // Clear data on error
      return;
    }

    if (dataRpc) {
      const formattedBranchChartData = dataRpc.map((item: any) => ({
        label: format(new Date(item.period_start), "P"), // Format date for X-axis label
        added: item[selectedModule.add],
        updated: item[selectedModule.update],
        removed: item[selectedModule.delete],
      }));
      setBranchAnalyticsData({ chartData: formattedBranchChartData, tableData: dataRpc });
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
          <Select
            value={selectedModule.key}
            onValueChange={(value) => {
              if (value) {
                setSelectedModule({
                  key: value,
                  rpc: MODULE_ANALYTICS.find((m) => m.key === value)?.rpc || "",
                  add: MODULE_ANALYTICS.find((m) => m.key === value)?.add || "",
                  update: MODULE_ANALYTICS.find((m) => m.key === value)?.update || "",
                  delete: MODULE_ANALYTICS.find((m) => m.key === value)?.delete || "",
                });
              }
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("Analytics.select_module")} />
            </SelectTrigger>
            <SelectContent>
              {MODULE_ANALYTICS.map((module) => (
                <SelectItem key={module.key} value={module.key}>
                  {t(module.title)}
                </SelectItem>
              ))}
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

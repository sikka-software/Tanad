import { differenceInDays, endOfDay, format, parseISO, startOfMonth } from "date-fns";
import { ar } from "date-fns/locale";
import { pick } from "lodash";
import { Calendar as CalendarIcon } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { CardContent, Card, CardTitle, CardDescription, CardHeader } from "@/ui/card";
import { ChartConfig } from "@/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { createClient } from "@/utils/supabase/component";

import { CrudChart } from "@/components/analytics/crud-chart";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { MODULE_ANALYTICS } from "@/lib/constants";

import useUserStore from "../stores/use-user-store";

export default function Analytics() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const { locale } = router;
  const profile = useUserStore((state) => state.profile);

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

  const [analyticsData, setAnalyticsData] = useState<{
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
        to: new Date(),
      };
    }
    // Default for SSR or if window is not defined (though localStorage check handles this)
    return {
      from: startOfMonth(new Date()),
      to: new Date(),
    };
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

  const chartConfig = {
    added: {
      label: t("Analytics.add_actions"),
      color: "var(--chart-green)",
    },
    updated: {
      label: t("Analytics.update_actions"),
      color: "var(--chart-blue)",
    },
    removed: {
      label: t("Analytics.delete_actions"),
      color: "var(--chart-red)",
    },
  } satisfies ChartConfig;

  const fetchAnalytics = async (from: Date, to: Date) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const adjustedTo = endOfDay(to);

    const daysDifference = differenceInDays(adjustedTo, from);

    const { data: dataRpc, error: errorRpc } = await supabase.rpc(selectedModule.rpc, {
      start_date: from.toISOString(),
      end_date: adjustedTo.toISOString(),
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
      setAnalyticsData({ chartData: [], tableData: [] }); // Clear data on error
      return;
    }

    let calType = profile?.user_settings.calendar_type;
    if (dataRpc) {
      const formattedChartData = dataRpc.map((item: any) => ({
        label: new Date(item.period_start).toLocaleString(calType === "hijri" ? "ar-SA" : "en-US", {
          day: "2-digit",
          month: "2-digit",
          // year: "numeric",
        }), // Format date for X-axis label
        tooltipLabel: new Date(item.period_start).toLocaleString(
          calType === "hijri" ? "ar-SA" : "en-US",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          },
        ), // Format date for X-axis label
        added: item[selectedModule.add],
        updated: item[selectedModule.update],
        removed: item[selectedModule.delete],
      }));
      setAnalyticsData({ chartData: formattedChartData, tableData: dataRpc });
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
          {/* <CardDescription>{getDateRangeTitle()}</CardDescription> */}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
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

      <main className="mx-auto flex flex-row items-center justify-start gap-4 p-4">
        {/* <LinesChart
          title={t("Analytics.crud_analytics_title")}
          description={t("Analytics.crud_analytics_description")}
          data={analyticsData.chartData}
          config={chartConfig}
          xAxisKey="label"
          lines={[
            { dataKey: "added", name: t("Analytics.add_actions"), stroke: "var(--chart-green)" },
            { dataKey: "removed", name: t("Analytics.delete_actions"), stroke: "var(--chart-red)" },
            {
              dataKey: "updated",
              name: t("Analytics.update_actions"),
              stroke: "var(--chart-blue)",
            },
          ]}

          
        /> */}

        <Card className="w-full">
          <CardHeader className="flex flex-row justify-between">
            <div className="flex flex-col">
              <CardTitle>{t("Analytics.crud_analytics_title")}</CardTitle>
              <CardDescription>{t("Analytics.crud_analytics_description")}</CardDescription>
            </div>
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
          </CardHeader>
          <CardContent className="max-h-[200px] w-full">
            <CrudChart
              className="h-[180px] w-full"
              title={t("Analytics.crud_analytics_title")}
              description={t("Analytics.crud_analytics_description")}
              chartData={analyticsData.chartData}
              chartConfig={chartConfig}
              xAxisKey="label"
            />
          </CardContent>
          {/* {(footerPrimaryText || footerSecondaryText) && (
            <CardFooter className="flex-col items-start gap-2 text-sm">
              {footerPrimaryText && (
                <div className="flex gap-2 leading-none font-medium">
                  {footerPrimaryText} <TrendingUp className="h-4 w-4" />
                </div>
              )}
              {footerSecondaryText && (
                <div className="text-muted-foreground leading-none">{footerSecondaryText}</div>
              )}
            </CardFooter>
          )} */}
        </Card>
      </main>
    </>
  );
}

Analytics.messages = ["Pages", "General", "Analytics"];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, Analytics.messages),
    },
  };
};

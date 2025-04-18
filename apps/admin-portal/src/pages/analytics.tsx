import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { CartesianGrid, XAxis, BarChart, Bar } from "recharts";

import AnalyticsTable from "@/components/app/AnalyticsTable";
import NoPuklas from "@/components/app/NoPuklas";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
// UI Components
import { Skeleton } from "@/components/ui/skeleton";

import { fakeAnalyticsData } from "@/lib/constants";
// Utils
import { fetchPukla, fetchPuklasWithLinkCount } from "@/lib/operations";
import { supabase } from "@/lib/supabase";

// Store
import { useMainStore } from "@/hooks/main.store";
import useUserStore from "@/stores/use-user-store";

export default function Analytics() {
  const t = useTranslations();
  const router = useRouter();
  const { profile } = useUserStore();
  const { puklas, setPuklas, selectedPukla, setSelectedPukla } = useMainStore();
  const [isLoading, setIsLoading] = useState(true);
  const puklaId = (router.query.id || selectedPukla?.id) as string;
  const { locale } = router;

  useEffect(() => {
    const initializePuklas = async () => {
      if (!profile?.id) return;

      try {
        // Fetch all puklas with link count
        const fetchedPuklas = await fetchPuklasWithLinkCount(profile?.id, {
          toasts: {
            error: t("MyPuklas.error_fetching_puklas"),
            success: t("MyPuklas.success_fetching_puklas"),
          },
        });
        setPuklas(fetchedPuklas);

        // If we have a puklaId, fetch that specific pukla
        if (puklaId) {
          const currentPukla = await fetchPukla(puklaId, {
            toasts: {
              error: t("MyPuklas.error_fetching_puklas"),
              success: t("MyPuklas.success_fetching_puklas"),
            },
          });
          if (currentPukla) {
            setSelectedPukla(currentPukla);
          }
        } else if (selectedPukla) {
          router.push(`/analytics?id=${selectedPukla.id}`);
        } else if (fetchedPuklas.length > 0) {
          setSelectedPukla(fetchedPuklas[0]);
          router.push(`/analytics?id=${fetchedPuklas[0].id}`);
        }
      } catch (error) {
        console.error("Error initializing puklas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePuklas();
  }, [profile?.id, puklaId]);

  let chartConfig = {
    desktop: { label: t("General.desktop"), color: "#2563eb" },
    mobile: { label: t("General.mobile"), color: "#60a5fa" },
  } satisfies ChartConfig;

  const [data, setData] = useState<{ chartData: any[]; tableData: any[] }>({
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
    if (date?.from && date?.to && selectedPukla) {
      fetchAnalytics(date.from, date.to);
    }
  }, [date, selectedPukla]);

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
    if (!user || !selectedPukla) return;

    // Fetch clicks for the selected date range and selected pukla only
    const { data: clicks, error: clicksError } = await supabase
      .from("clicks_log")
      .select("clicked_at, is_mobile, country, city")
      .eq("pukla_id", selectedPukla.id)
      .gte("clicked_at", from.toISOString())
      .lte("clicked_at", to.toISOString())
      .order("clicked_at", { ascending: true });

    if (clicksError) {
      console.error("Error fetching clicks:", clicksError);
      return;
    }

    // Calculate the difference in days between the start and end dates
    const daysDifference = differenceInDays(to, from);
    let chartData;

    // If range is 1 day or less, show hourly data
    if (daysDifference <= 1) {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const grouped = clicks?.reduce((acc: any, click) => {
        const date = new Date(click.clicked_at);
        const hour = date.getHours();
        const device = click.is_mobile ? "mobile" : "desktop";
        acc[hour] = acc[hour] || { desktop: 0, mobile: 0 };
        acc[hour][device]++;
        return acc;
      }, {});

      chartData = hours.map((hour) => ({
        label: `${hour}:00`,
        desktop: grouped[hour]?.desktop || 0,
        mobile: grouped[hour]?.mobile || 0,
      }));
    }
    // If range is 7 days or less, show daily data
    else if (daysDifference <= 7) {
      const days = eachDayOfInterval({ start: from, end: to });
      const grouped = clicks?.reduce((acc: any, click) => {
        const date = new Date(click.clicked_at);
        const day = format(date, "yyyy-MM-dd");
        const device = click.is_mobile ? "mobile" : "desktop";
        acc[day] = acc[day] || { desktop: 0, mobile: 0 };
        acc[day][device]++;
        return acc;
      }, {});

      chartData = days.map((day) => ({
        label: format(day, "EEE"),
        desktop: grouped[format(day, "yyyy-MM-dd")]?.desktop || 0,
        mobile: grouped[format(day, "yyyy-MM-dd")]?.mobile || 0,
      }));
    }
    // If range is 31 days or less, show weekly data
    else if (daysDifference <= 31) {
      const weeks = eachWeekOfInterval({ start: from, end: to });
      const grouped = clicks?.reduce((acc: any, click) => {
        const date = new Date(click.clicked_at);
        const weekStart = startOfWeek(date);
        const weekKey = format(weekStart, "yyyy-MM-dd");
        const device = click.is_mobile ? "mobile" : "desktop";
        acc[weekKey] = acc[weekKey] || { desktop: 0, mobile: 0 };
        acc[weekKey][device]++;
        return acc;
      }, {});

      chartData = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        return {
          label: `${getShortFormattedDate(weekStart)} - ${getShortFormattedDate(weekEnd)}`,
          desktop: grouped[format(weekStart, "yyyy-MM-dd")]?.desktop || 0,
          mobile: grouped[format(weekStart, "yyyy-MM-dd")]?.mobile || 0,
        };
      });
    }
    // If range is more than 31 days, show monthly data
    else {
      const months = eachMonthOfInterval({ start: from, end: to });
      const grouped = clicks?.reduce((acc: any, click) => {
        const date = new Date(click.clicked_at);
        const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
        const device = click.is_mobile ? "mobile" : "desktop";
        acc[month] = acc[month] || { desktop: 0, mobile: 0 };
        acc[month][device]++;
        return acc;
      }, {});

      chartData = months.map((date) => {
        const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
        return {
          label: t(`General.months.${month}`),
          desktop: grouped[month]?.desktop || 0,
          mobile: grouped[month]?.mobile || 0,
        };
      });
    }

    // Process data for the table
    const tableData = clicks?.reduce((acc: any, click) => {
      const locationKey = `${click.country || "Unknown"}-${click.city || "Unknown"}`;

      if (!acc[locationKey]) {
        acc[locationKey] = {
          country: click.country
            ? t(`Country.${click.country.toLowerCase().replace(" ", "_")}`)
            : "Unknown",
          city: click.city || "Unknown",
          mobile: 0,
          desktop: 0,
          total: 0,
        };
      }

      if (click.is_mobile) {
        acc[locationKey].mobile++;
      } else {
        acc[locationKey].desktop++;
      }
      acc[locationKey].total++;

      return acc;
    }, {});

    const processedTableData = Object.values(tableData);

    // Update state with both chart and table data
    setData({ chartData: chartData, tableData: processedTableData });
  };

  if (!puklaId) {
    return (
      <div className="flex w-full flex-col items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[100px] w-full" />
        ) : puklas.length > 0 ? (
          <Card className="flex w-full flex-col items-center justify-center">
            <CardContent headless className="w-full">
              <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
                <span className="text-2xl font-bold">
                  {t("Analytics.select_pukla_to_view_analytics")}
                </span>
                <Select onValueChange={(value: any) => router.push(`/analytics?id=${value}`)}>
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder={t("Analytics.select_pukla")} />
                  </SelectTrigger>
                  <SelectContent>
                    {puklas.map((pukla) => (
                      <SelectItem key={pukla.id} value={pukla.id}>
                        {pukla.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ) : (
          <NoPuklas onCreate={() => router.push("/dashboard")} />
        )}
      </div>
    );
  }

  return (
    <>
      <CustomPageMeta
        title={t("SEO.analytics.title")}
        description={t("SEO.analytics.description")}
      />
      <main className="flex flex-col items-center justify-between gap-4">
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

        {profile?.subscribed_to === "pukla_enterprise" ? (
          <div className="flex w-full flex-col gap-2">
            <AnalyticsTable data={data?.tableData || []} />
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

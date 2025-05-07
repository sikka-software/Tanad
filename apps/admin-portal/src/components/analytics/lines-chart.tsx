"use client";

import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Line } from "recharts";
import { Legend, LineChart, Tooltip, YAxis } from "recharts";
import { ResponsiveContainer } from "recharts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function LinesChart({ data, config }: { data: any[]; config: ChartConfig }) {
  const t = useTranslations();

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {t("General.no_data_available")}
      </div>
    );
  }

  return (
    <Card className="w-1/2">
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart
            data={data}
            // margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            {/* <YAxis tickLine={false} axisLine={false} allowDecimals={false} /> */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-1.5 text-sm">
                        <span className="font-bold">{label}</span>
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex items-center">
                            <span
                              className="mr-2 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="flex-1 truncate">
                              {entry.name === "added"
                                ? t("Analytics.branches_added")
                                : t("Analytics.branches_removed")}
                              {`: ${entry.value}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* <Legend
              formatter={(value) => {
                if (value === "added") return t("Analytics.branches_added");
                if (value === "removed") return t("Analytics.branches_removed");
                return value;
              }}
            /> */}
            <Line
              type="monotone"
              dataKey="added"
              name="added"
              stroke={config.added?.color || "#3b82f6"}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="removed"
              name="removed"
              stroke={config.removed?.color || "#ef4444"}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

export default LinesChart;

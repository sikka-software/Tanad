"use client";

import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
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

import { Skeleton } from "../ui/skeleton";

interface CrudChartProps {
  title: string;
  description?: string;
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  xAxisKey: string;
  footerPrimaryText?: string;
  footerSecondaryText?: string;
  className?: string;
}

export function CrudChart({
  title,
  description,
  chartData,
  chartConfig,
  xAxisKey,
  footerPrimaryText,
  footerSecondaryText,
  className,
}: CrudChartProps) {
  const t = useTranslations();

  if (!chartData || chartData.length === 0) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ChartContainer className={className} config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => payload[0].payload.tooltipLabel}
            />
          }
        />
        {Object.keys(chartConfig).map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

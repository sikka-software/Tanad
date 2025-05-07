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

interface CrudChartProps {
  title: string;
  description?: string;
  chartData: Array<Record<string, any>>;
  chartConfig: ChartConfig;
  xAxisKey: string;
  footerPrimaryText?: string;
  footerSecondaryText?: string;
}

export function CrudChart({
  title,
  description,
  chartData,
  chartConfig,
  xAxisKey,
  footerPrimaryText,
  footerSecondaryText,
}: CrudChartProps) {
  const t = useTranslations();

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="flex w-1/2 items-center justify-center" style={{ height: "350px" }}>
        <CardContent>
          <p>{t("Analytics.no_data_available")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            {Object.keys(chartConfig).map((key) => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {(footerPrimaryText || footerSecondaryText) && (
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
      )}
    </Card>
  );
}

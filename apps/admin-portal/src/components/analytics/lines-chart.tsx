"use client";

import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { ChartConfig, ChartContainer } from "@/ui/chart";

interface LineProps {
  dataKey: string;
  name: string;
  stroke?: string;
  label?: string;
}

interface LinesChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, any>>;
  config: ChartConfig;
  xAxisKey: string;
  lines: LineProps[];
  footerPrimaryText?: string;
  footerSecondaryText?: string;
}

function LinesChart({
  title,
  description,
  data,
  config,
  xAxisKey,
  lines,
  footerPrimaryText,
  footerSecondaryText,
}: LinesChartProps) {
  const t = useTranslations();

  if (!data || data.length === 0) {
    return (
      <Card className="flex w-1/2 items-center justify-center" style={{ height: "350px" }}>
        <CardContent>
          <p>{t("General.no_data_available")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip
              content={({ active, payload, label: xAxisLabel }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-1.5 text-sm">
                        {xAxisLabel && <span className="font-bold">{xAxisLabel}</span>}
                        {payload.map((entry) => {
                          const lineConfig = lines.find((l) => l.dataKey === entry.name);
                          const entryLabel = lineConfig?.label || entry.name;
                          return (
                            <div key={entry.name} className="flex items-center">
                              <span
                                className="me-2 h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="flex-1 truncate">
                                {`${entryLabel}: ${entry.value}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                // type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.stroke || config[line.dataKey]?.color || "#8884d8"}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
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

export default LinesChart;

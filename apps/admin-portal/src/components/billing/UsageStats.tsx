import { useLocale, useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageStatsProps {
  total: number;
  used: number;
  available: number;
  usedPercentage: number;
  isLoading?: boolean;
  isPageLoading?: boolean;
}

export default function UsageStats({
  total,
  used,
  available,
  usedPercentage,
  isLoading: componentIsLoading,
  isPageLoading,
}: UsageStatsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";

  // Combine component-level loading with page-level loading
  // If isPageLoading is provided, use it; otherwise use the component's isLoading
  const isLoading = isPageLoading !== undefined ? isPageLoading : componentIsLoading || false;

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full flex-1 rounded-lg" />;
  }

  return (
    <Card className="bg-background flex-1 border p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">
            {t("Billing.usage_title", { fallback: "Billing.usage_title" })}
          </h3>
          <span className="text-lg font-semibold">{usedPercentage.toFixed(0)}%</span>
        </div>

        <p className="text-muted-foreground text-sm">
          {t("Billing.usage_description", { fallback: "Billing.usage_description" })}
        </p>

        <div className="space-y-2">
          <Progress value={usedPercentage} className="h-2.5 bg-gray-200" />

          <div className="text-sm">
            {t("Billing.used_of_total", {
              used,
              total,
              fallback: `${used} of ${total}`,
            })}
          </div>
        </div>

        <div className="flex justify-between pt-1 text-sm">
          <div>
            <p className="text-muted-foreground">
              {t("Billing.total", { fallback: "Billing.total" })}
            </p>
            <p className="font-medium">{total}</p>
          </div>
          <div className={isRtl ? "text-start" : "text-end"}>
            <p className="text-muted-foreground">
              {t("Billing.available", { fallback: "Billing.available" })}
            </p>
            <p className="font-medium">{available}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

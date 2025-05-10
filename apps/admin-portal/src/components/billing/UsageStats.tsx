import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import { useUsage } from "@/hooks/use-usage";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UsageItemProps {
  title: string;
  description?: string;
  total: number;
  used: number;
  available: number;
  usedPercentage: number;
}

interface UsageStatsProps {
  total: number;
  used: number;
  available: number;
  usedPercentage: number;
  isLoading?: boolean;
  isPageLoading?: boolean;
  employeeUsage?: {
    total: number;
    used: number;
    available: number;
    usedPercentage: number;
  };
  storageUsage?: {
    total: number;
    used: number;
    available: number;
    usedPercentage: number;
  };
  invoiceUsage?: {
    total: number;
    used: number;
    available: number;
    usedPercentage: number;
  };
  clientsUsage?: {
    total: number;
    used: number;
    available: number;
    usedPercentage: number;
  };
}

function UsageItem({ title, description, total, used, available, usedPercentage }: UsageItemProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-lg font-semibold">{usedPercentage.toFixed(0)}%</span>
      </div>

      {description && <p className="text-muted-foreground text-sm">{description}</p>}

      <div className="space-y-2">
        <Progress value={usedPercentage} className="h-2.5 bg-gray-200" />

        <div className="text-sm">
          {t("Billing.usage.used_of_total", {
            used,
            total,
            fallback: `${used} of ${total}`,
          })}
        </div>
      </div>

      <div className="flex justify-between pt-1 text-sm">
        <div>
          <p className="text-muted-foreground">{t("Billing.usage.total", { fallback: "Total" })}</p>
          <p className="font-medium">{total}</p>
        </div>
        <div className={isRtl ? "text-start" : "text-end"}>
          <p className="text-muted-foreground">
            {t("Billing.usage.available", { fallback: "Available" })}
          </p>
          <p className="font-medium">{available}</p>
        </div>
      </div>
    </div>
  );
}

export default function UsageStats({
  total,
  used,
  available,
  usedPercentage,
  isLoading: componentIsLoading,
  isPageLoading,
  employeeUsage,
  storageUsage,
  invoiceUsage,
  clientsUsage,
}: UsageStatsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { refresh: refreshUsageData } = useUsage();

  // Listen for usage stats update events
  useEffect(() => {
    const handleUsageStatsUpdated = () => {
      console.log("Usage stats update event received, refreshing usage data");
      refreshUsageData();
    };

    window.addEventListener("usage_stats_updated", handleUsageStatsUpdated);

    return () => {
      window.removeEventListener("usage_stats_updated", handleUsageStatsUpdated);
    };
  }, [refreshUsageData]);

  // Combine component-level loading with page-level loading
  // If isPageLoading is provided, use it; otherwise use the component's isLoading
  const isLoading = isPageLoading !== undefined ? isPageLoading : componentIsLoading || false;

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full flex-1 rounded-lg" />;
  }

  return (
    <Card className="bg-background flex-1 border p-6">
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="invoices">{t("Billing.Invoices.title")}</TabsTrigger>
          <TabsTrigger value="employees">{t("Billing.Employees.title")}</TabsTrigger>
          <TabsTrigger value="clients">{t("Billing.Clients.title")}</TabsTrigger>
          <TabsTrigger value="storage">{t("Billing.usage.storage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-0">
          <UsageItem
            title={t("Billing.Invoices.title")}
            description={t("Billing.usage.description")}
            total={invoiceUsage?.total || total}
            used={invoiceUsage?.used || used}
            available={invoiceUsage?.available || available}
            usedPercentage={invoiceUsage?.usedPercentage || usedPercentage}
          />
        </TabsContent>

        <TabsContent value="employees" className="mt-0">
          {employeeUsage ? (
            <UsageItem
              title={t("Billing.usage.employees")}
              description={t("Billing.usage.description")}
              total={employeeUsage.total}
              used={employeeUsage.used}
              available={employeeUsage.available}
              usedPercentage={employeeUsage.usedPercentage}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("General.coming_soon")}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="mt-0">
          {clientsUsage ? (
            <UsageItem
              title={t("Billing.usage.clients")}
              description={t("Billing.usage.description")}
              total={clientsUsage.total}
              used={clientsUsage.used}
              available={clientsUsage.available}
              usedPercentage={clientsUsage.usedPercentage}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("General.coming_soon")}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="storage" className="mt-0">
          {storageUsage ? (
            <UsageItem
              title={t("Billing.usage.storage")}
              description={t("Billing.usage.description")}
              total={storageUsage.total}
              used={storageUsage.used}
              available={storageUsage.available}
              usedPercentage={storageUsage.usedPercentage}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("General.coming_soon")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

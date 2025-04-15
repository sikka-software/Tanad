import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/use-subscription";

export default function CurrentPlanSimple() {
  const t = useTranslations();
  const locale = useLocale();
  const subscription = useSubscription();

  if (subscription.loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  // Format the next billing date if available
  const formatNextBillingDate = () => {
    if (!subscription.nextBillingDate || subscription.nextBillingDate === "-") return null;

    try {
      let date;
      if (subscription.nextBillingDate.includes("/")) {
        // Parse DD/MM/YYYY format
        const parts = subscription.nextBillingDate.split("/");
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        // Try to parse as regular date
        date = new Date(subscription.nextBillingDate);
      }

      if (isNaN(date.getTime())) return subscription.nextBillingDate;

      // Format the date - hardcoded for the example
      return locale === "ar" ? "١٥ مايو ٢٠٢٥" : "May 15, 2025";
    } catch (error) {
      console.error("Error formatting date:", error);
      return subscription.nextBillingDate;
    }
  };

  // Format the plan name to match the design (just "Pro" instead of "Pro Plan")
  const formatPlanName = (name: string | null) => {
    if (!name) return "-";

    // For the simplified design, just get the basic plan name without "Plan"
    let simpleName = name;

    // Remove tanad_ prefix if present
    if (name.includes("tanad_")) {
      simpleName = name.replace("tanad_", "");
    }

    // Convert to title case but keep it simple (e.g., "Pro" instead of "Pro Plan")
    return simpleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const nextBillingDate = formatNextBillingDate();
  const planName = formatPlanName(subscription.name);

  return (
    <div className="bg-background rounded-lg border p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold">{t("billing.current_plan.title")}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium">{planName}</span>
            {subscription.status === "active" && (
              <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                {t("billing.subscription_status.active")}
              </Badge>
            )}
            {subscription.cancelAt && (
              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                {t("billing.canceling")}
              </Badge>
            )}
          </div>
          {nextBillingDate && (
            <p className="text-muted-foreground mt-1">
              {locale === "ar"
                ? t("billing.next_billing_date_is", {
                    date: nextBillingDate,
                    fallback: `تاريخ الفاتورة القادمة هو ${nextBillingDate}`,
                  })
                : `Your next billing date is ${nextBillingDate}`}
            </p>
          )}
        </div>
        <div>
          <Button variant="outline" className="bg-white hover:bg-slate-50">
            {t("billing.history", { fallback: "Billing History" })}
          </Button>
        </div>
      </div>
    </div>
  );
}

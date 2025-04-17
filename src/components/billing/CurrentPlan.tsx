import { useCallback, useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { AlertCircle, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePricing } from "@/hooks/use-pricing";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";
import { TANAD_PRODUCT_ID } from "@/lib/constants";

// Create a pub/sub event for subscription updates
export const SUBSCRIPTION_UPDATED_EVENT = "subscription_updated";

// Map plan lookup keys to plan titles
const planTitles: Record<string, string> = {
  tanad_free: "Free Plan",
  tanad_standard: "Standard Plan",
  tanad_pro: "Pro Plan",
  tanad_business: "Business Plan",
  tanad_enterprise: "Enterprise Plan",
};

interface BillingHistoryItem {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: string;
  planName: string;
  pdfUrl?: string;
  subscriptionId?: string;
}

export default function CurrentPlan() {
  const t = useTranslations();
  const locale = useLocale();
  const subscription = useSubscription();
  const { user, fetchUserAndProfile } = useUserStore();
  const { getPlans } = usePricing(TANAD_PRODUCT_ID);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshData = useCallback(async () => {
    if (!user) return;

    // Refresh both subscription data and user data
    try {
      console.log("Manually refreshing subscription and user data");
      await fetchUserAndProfile();
      await subscription.refetch();
      setLastRefreshTime(Date.now()); // Update refresh timestamp
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [user, fetchUserAndProfile, subscription]);

  // Listen for subscription update events
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      console.log("Subscription update event detected, refreshing data");
      refreshData();
    };

    // Add event listener
    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdate);

    // Clean up
    return () => {
      window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdate);
    };
  }, [refreshData]);

  // Fetch billing history when dialog opens or when subscription changes
  useEffect(() => {
    if (isHistoryDialogOpen && user) {
      fetchBillingHistory();
    }
  }, [isHistoryDialogOpen, user, lastRefreshTime]);

  // Also refresh data when subscription ID changes
  useEffect(() => {
    if (subscription.id) {
      // This ensures we refresh billing history after a new subscription
      fetchBillingHistory();
    }
  }, [subscription.id]);

  // Fetch billing history
  const fetchBillingHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    setBillingHistory([]); // Clear previous data when loading
    try {
      console.log("Fetching billing history for user", user.id);
      const response = await fetch("/api/stripe/billing-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          limit: 100, // Fetch more invoices to ensure we get everything
          includeDrafts: false, // Skip draft invoices by default
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch billing history");
      }

      const data = await response.json();
      console.log("Billing history fetched:", data.invoices?.length || 0, "invoices");
      setBillingHistory(data.invoices || []);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast.error("Failed to load billing history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
      } else if (typeof subscription.nextBillingDate === "number") {
        // Handle Unix timestamp (seconds)
        date = new Date(subscription.nextBillingDate * 1000);
      } else {
        // Try to parse as regular date
        date = new Date(subscription.nextBillingDate);
      }

      if (isNaN(date.getTime())) return subscription.nextBillingDate;

      // Format the date based on locale
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      try {
        return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", options);
      } catch (e) {
        // Fallback for browsers that don't support the locale
        return date.toLocaleDateString("en-US", options);
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return subscription.nextBillingDate;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const nextBillingDate = formatNextBillingDate();

  // Status badge for invoices - enhance to show more payment states
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
            {t("billing.invoice_status_paid", { fallback: "Paid" })}
          </Badge>
        );
      case "open":
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
            {t("billing.invoice_status_open", { fallback: "Open" })}
          </Badge>
        );
      case "void":
        return (
          <Badge variant="outline" className="border-gray-500 bg-gray-50 text-gray-700">
            {t("billing.invoice_status_void", { fallback: "Void" })}
          </Badge>
        );
      case "uncollectible":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-50 text-red-700">
            {t("billing.invoice_status_uncollectible", { fallback: "Uncollectible" })}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            {t("billing.invoice_status_draft", { fallback: "Draft" })}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-purple-500 bg-purple-50 text-purple-700">
            {t("billing.invoice_status_pending", { fallback: "Pending" })}
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-50 text-red-700">
            {t("billing.invoice_status_overdue", { fallback: "Overdue" })}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format the plan name for billing history items
  const formatBillingHistoryPlanName = (planName: string) => {
    // Try to extract a lookup key if it follows our naming convention
    let lookupKey = "";
    if (planName.toLowerCase().includes("tanad_")) {
      // Extract what could be a lookup key
      const match = planName.toLowerCase().match(/tanad_[a-z]+/);
      if (match) lookupKey = match[0];
    }

    if (lookupKey && lookupKey in planTitles) {
      // Use translation if available for this lookup key
      return t(`billing.${lookupKey}`, {
        fallback: planTitles[lookupKey],
      });
    }

    // Fall back to the basic formatting if no lookup key matched
    return planName;
  };

  return (
    <>
      <div className="bg-background rounded-lg border p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">{t("billing.current_plan.title")}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-medium">
                {subscription.planLookupKey
                  ? t(`billing.${subscription.planLookupKey}`, {
                      fallback: subscription.planLookupKey,
                    })
                  : t("billing.tanad_free", { fallback: "Free Plan" })}
              </span>
              {subscription.status === "active" && !subscription.cancelAt && (
                <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                  {t("billing.subscription_status.active")}
                </Badge>
              )}
              {subscription.status === "trialing" && (
                <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
                  {t("billing.subscription_status.trialing")}
                </Badge>
              )}
              {subscription.cancelAt && (
                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                  {t("billing.canceling")}
                </Badge>
              )}
            </div>

            {/* Price and billing cycle */}
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4">
              {subscription.price && subscription.price !== "0 SAR" && (
                <p className="text-foreground font-medium">
                  {subscription.price}
                  {subscription.billingCycle && subscription.billingCycle !== "-" && (
                    <span className="text-muted-foreground">
                      {" "}
                      {locale === "ar"
                        ? subscription.billingCycle === "month"
                          ? "شهرياً"
                          : "سنوياً"
                        : subscription.billingCycle === "month"
                          ? "/month"
                          : "/year"}
                    </span>
                  )}
                </p>
              )}

              {/* Billing cycle badge */}
              {subscription.billingCycle && subscription.billingCycle !== "-" && (
                <Badge variant="outline" className="text-xs">
                  {t(`billing.${subscription.billingCycle}_billing`, {
                    fallback:
                      subscription.billingCycle === "month" ? "Monthly billing" : "Annual billing",
                  })}
                </Badge>
              )}
            </div>

            {/* Format cancellation date if available */}
            {subscription.cancelAt && (
              <p className="mt-2 flex items-center text-sm text-orange-600">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                {t("billing.subscription_cancels_on", {
                  date: new Date(Number(subscription.cancelAt) * 1000).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  ),
                  fallback: `Your subscription will cancel on ${new Date(
                    Number(subscription.cancelAt) * 1000,
                  ).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`,
                })}
              </p>
            )}

            {/* Next billing date */}
            {nextBillingDate && !subscription.cancelAt && (
              <p className="text-muted-foreground mt-2 flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {locale === "ar"
                  ? t("billing.next_billing_date_is", {
                      date: nextBillingDate,
                      fallback: `تاريخ الفاتورة القادمة هو ${nextBillingDate}`,
                    })
                  : t("billing.next_billing_date_is", {
                      date: nextBillingDate,
                      fallback: `Your subscription will automatically renew on ${nextBillingDate}`,
                    })}
              </p>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              className="bg-background hover:bg-accent"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              {t("billing.history", { fallback: "Billing History" })}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                refreshData();
                toast.success(t("billing.data_refreshed", { fallback: "Billing data refreshed" }));
              }}
              className="ml-2 h-9 w-9"
              title={t("billing.current_plan.refresh", { fallback: "Refresh" })}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Billing History Dialog */}
      <Dialog
        open={isHistoryDialogOpen}
        onOpenChange={(open) => {
          setIsHistoryDialogOpen(open);
          // Re-fetch data when the dialog is opened
          if (open && user) {
            fetchBillingHistory();
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {t("billing.history_dialog_title", { fallback: "Billing History" })}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  fetchBillingHistory();
                }}
                disabled={isLoadingHistory}
                className="h-8 w-8"
                aria-label={t("billing.current_plan.refresh", { fallback: "Refresh" })}
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {isLoadingHistory ? (
              <div className="py-8">
                <Skeleton className="mb-2 h-12 w-full" />
                <Skeleton className="mb-2 h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : billingHistory.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t("billing.history_description", {
                    fallback: "Your billing history and past invoices",
                  })}
                </p>
                <div className="max-h-[50vh] overflow-auto">
                  <Table>
                    <TableHeader className="bg-background sticky top-0">
                      <TableRow>
                        <TableHead>{t("billing.invoice_date", { fallback: "Date" })}</TableHead>
                        <TableHead>
                          {t("billing.invoice_number", { fallback: "Invoice" })}
                        </TableHead>
                        <TableHead>{t("billing.invoice_amount", { fallback: "Amount" })}</TableHead>
                        <TableHead>{t("billing.invoice_status", { fallback: "Status" })}</TableHead>
                        <TableHead>{t("billing.invoice_plan", { fallback: "Plan" })}</TableHead>
                        <TableHead className="text-right">
                          {t("billing.actions", { fallback: "Actions" })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{invoice.number}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{formatBillingHistoryPlanName(invoice.planName)}</TableCell>
                          <TableCell className="text-right">
                            {invoice.pdfUrl && (
                              <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 inline-flex items-center"
                                aria-label={t("billing.download_invoice", {
                                  fallback: "Download Invoice",
                                })}
                              >
                                <Download className="mr-1 h-4 w-4" />
                                <span className="sr-only">
                                  {t("billing.download_invoice", { fallback: "Download Invoice" })}
                                </span>
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center py-8 text-center">
                <AlertCircle className="text-muted-foreground/70 mb-2 h-12 w-12" />
                <p className="mb-1">
                  {t("billing.no_history", { fallback: "No billing history found" })}
                </p>
                <p className="text-sm">
                  {t("billing.no_history_description", {
                    fallback: "Your invoices will appear here once you've been billed",
                  })}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

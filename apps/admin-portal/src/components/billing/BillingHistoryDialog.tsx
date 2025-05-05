import { AlertCircle, Download, Eye, RefreshCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

import { useSubscription } from "@/hooks/use-subscription";

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

import useUserStore from "@/stores/use-user-store";

// Import the subscription event constant
import { SUBSCRIPTION_UPDATED_EVENT } from "./CurrentPlan";

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
  hostedInvoiceUrl?: string;
}

interface BillingHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
}

export function BillingHistoryDialog({ open, onOpenChange, user }: BillingHistoryDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const { fetchUserAndProfile } = useUserStore();
  const subscription = useSubscription();

  // Fetch billing history when dialog opens
  useEffect(() => {
    if (open && user) {
      // Add debounce protection to prevent rapid refetching
      const now = Date.now();
      // Only fetch if we haven't fetched in the last 2 seconds
      if (now - lastRefreshTime > 2000) {
        console.log("BillingHistoryDialog: Fetching billing history");
        fetchBillingHistory();
      }
    }
  }, [open, user]);

  // Listen for subscription update events
  useEffect(() => {
    const handleSubscriptionUpdated = () => {
      console.log("BillingHistoryDialog: Subscription update detected");
      if (open) {
        // If the dialog is open, refetch the billing history
        fetchBillingHistory();
      }
    };

    // Listen for both event types for better compatibility
    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
    window.addEventListener("subscription_updated", handleSubscriptionUpdated);

    return () => {
      window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, handleSubscriptionUpdated);
      window.removeEventListener("subscription_updated", handleSubscriptionUpdated);
    };
  }, [open]);

  // Create a local refresh function that doesn't depend on parent scope
  const refreshUserData = async () => {
    if (!user) return;

    try {
      console.log("Refreshing only billing history data without reloading plan");
      // Don't reload the entire user profile and subscription
      // await fetchUserAndProfile();
      // await subscription.refetch();
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error("Error refreshing data:", error);
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

  // Fetch billing history
  const fetchBillingHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    setBillingHistory([]); // Clear previous data when loading

    try {
      const supabase = createClient();

      // Get the current profile data without refreshing the entire user state
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        console.log("Profile stripe customer ID:", profile.stripe_customer_id);
      }

      // Try to get Stripe customer ID from multiple sources
      let stripeCustomerId =
        profile?.stripe_customer_id || user.stripe_customer_id || user.profile?.stripe_customer_id;

      console.log("Using customer ID for invoices:", stripeCustomerId);

      if (!stripeCustomerId) {
        console.error("No customer ID available");
        toast.error("No billing information available. Please try adding a payment method first.");
        setIsLoadingHistory(false);
        return;
      }

      // Add cache-busting query parameter to force latest data
      const cacheBuster = Date.now();

      // Now fetch invoices with the customer ID
      console.log("Fetching billing history with customer ID:", stripeCustomerId);
      const response = await fetch(`/api/stripe/get-invoices?t=${cacheBuster}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          forceRefresh: true,
        }),
      });

      if (!response.ok) {
        console.error("Invoice API error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Invoice API response:", data);

      // Process the invoice data
      if (data && data.invoices && Array.isArray(data.invoices)) {
        setBillingHistory(data.invoices);
      } else if (Array.isArray(data)) {
        setBillingHistory(data);
      } else {
        console.error("Unexpected invoice data format:", data);
        setBillingHistory([]);
      }
    } catch (error) {
      console.error("Error in billing history flow:", error);
      toast.error("Failed to load billing history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Status badge for invoices
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
            {t("Billing.billing_history.invoice_status_paid", { fallback: "Paid" })}
          </Badge>
        );
      case "open":
        return (
          <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-700">
            {t("Billing.billing_history.invoice_status_open", { fallback: "Open" })}
          </Badge>
        );
      case "void":
        return (
          <Badge variant="outline" className="border-gray-500 bg-gray-50 text-gray-700">
            {t("Billing.billing_history.invoice_status_void", { fallback: "Void" })}
          </Badge>
        );
      case "uncollectible":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-50 text-red-700">
            {t("Billing.billing_history.invoice_status_uncollectible", {
              fallback: "Uncollectible",
            })}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            {t("Billing.billing_history.invoice_status_draft", { fallback: "Draft" })}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-purple-500 bg-purple-50 text-purple-700">
            {t("Billing.billing_history.invoice_status_pending", { fallback: "Pending" })}
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-50 text-red-700">
            {t("Billing.billing_history.invoice_status_overdue", { fallback: "Overdue" })}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format the plan name for billing history items
  const formatBillingHistoryPlanName = (planName: string) => {
    // Check if planName is undefined or null
    if (!planName) {
      return t("Billing.billing_history.unknown_plan", { fallback: "Unknown Plan" });
    }

    // Handle Tanad Subscriptions format
    if (planName.includes("Tanad Subscriptions")) {
      // Map based on plan name
      if (planName.includes("Pro")) {
        return t("Billing.tanad_pro", { fallback: "Pro Plan" });
      } else if (planName.includes("Business")) {
        return t("Billing.tanad_business", { fallback: "Business Plan" });
      } else if (planName.includes("Standard")) {
        return t("Billing.tanad_standard", { fallback: "Standard Plan" });
      }
    }

    // Return original name if no matches
    return planName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden sm:max-w-[800px]"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {t("Billing.billing_history.title", { fallback: "Billing History" })}
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
              aria-label={t("Billing.current_plan.refresh", { fallback: "Refresh" })}
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
                {t("Billing.billing_history.description", {
                  fallback: "Your billing history and past invoices",
                })}
              </p>
              <div className="max-h-[50vh] overflow-auto">
                <div className="w-full overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-background sticky top-0">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          {t("Billing.billing_history.invoice_date", { fallback: "Date" })}
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          {t("Billing.billing_history.invoice_number", { fallback: "Invoice" })}
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          {t("Billing.billing_history.invoice_amount", { fallback: "Amount" })}
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          {t("Billing.billing_history.invoice_status", { fallback: "Status" })}
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          {t("Billing.billing_history.invoice_plan", { fallback: "Plan" })}
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          {t("Billing.billing_history.actions", { fallback: "Actions" })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(invoice.date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{invoice.number}</TableCell>
                          <TableCell className="whitespace-nowrap">{invoice.amount}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {formatBillingHistoryPlanName(invoice.planName)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {invoice.pdfUrl && (
                                <a
                                  href={invoice.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 inline-flex items-center"
                                  aria-label={t("Billing.billing_history.view_invoice", {
                                    fallback: "View Invoice",
                                  })}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("Billing.billing_history.view_invoice", {
                                      fallback: "View Invoice",
                                    })}
                                  </span>
                                </a>
                              )}
                              {invoice.pdfUrl && (
                                <a
                                  href={invoice.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="text-primary hover:text-primary/80 inline-flex items-center"
                                  aria-label={t("Billing.billing_history.download_invoice", {
                                    fallback: "Download Invoice",
                                  })}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("Billing.billing_history.download_invoice", {
                                      fallback: "Download Invoice",
                                    })}
                                  </span>
                                </a>
                              )}
                              {invoice.hostedInvoiceUrl && !invoice.pdfUrl && (
                                <a
                                  href={invoice.hostedInvoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 inline-flex items-center"
                                  aria-label={t("Billing.billing_history.view_invoice", {
                                    fallback: "View Invoice",
                                  })}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("Billing.billing_history.view_invoice", {
                                      fallback: "View Invoice",
                                    })}
                                  </span>
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center py-8 text-center">
              <AlertCircle className="text-muted-foreground/70 mb-2 h-12 w-12" />
              <p className="mb-1">
                {t("Billing.no_history", { fallback: "No billing history found" })}
              </p>
              <p className="text-sm">
                {t("Billing.no_history_description", {
                  fallback: "Your invoices will appear here once you've been billed",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

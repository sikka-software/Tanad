import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, CreditCard, Loader2, ShieldAlert, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/use-subscription";
import useUserStore from "@/hooks/use-user-store";

// Load Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function PaymentError({
  message,
  type = "general",
  onRetry,
}: {
  message: string;
  type?: "card" | "authentication" | "network" | "general";
  onRetry?: () => void;
}) {
  const getIcon = () => {
    switch (type) {
      case "card":
        return <CreditCard className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />;
      case "authentication":
        return <ShieldAlert className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />;
      case "network":
        return <AlertTriangle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />;
      default:
        return <XCircle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />;
    }
  };

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      <div className="flex items-start">
        {getIcon()}
        <div>
          <p>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="mt-2 text-red-700 hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-900/30 dark:hover:text-red-200"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentDialog({
  open,
  onOpenChange,
  selectedPlan,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: string;
  onSuccess: () => void;
}) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const { user, fetchUserAndProfile } = useUserStore();
  const { refetch: refetchSubscription } = useSubscription();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [priceDetails, setPriceDetails] = useState<{
    name: string;
    price: string;
  } | null>(null);

  // Reset states when dialog opens or plan changes
  useEffect(() => {
    if (open && selectedPlan) {
      setClientSecret(null);
      setError(null);
      setPriceDetails(null);
      fetchSetupIntent();
    }
  }, [open, selectedPlan]);

  // Fetch client secret for setup intent
  const fetchSetupIntent = async () => {
    if (!selectedPlan || !user || !open) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch price details first
      const priceResponse = await fetch(`/api/stripe/get-price?priceId=${selectedPlan}`);
      if (!priceResponse.ok) {
        throw new Error("Failed to get price details");
      }

      const priceData = await priceResponse.json();
      setPriceDetails({
        name: priceData.name || "Subscription",
        price: priceData.price || "0.00 SAR/month",
      });

      // Create a setup intent for the customer
      const setupResponse = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.stripe_customer_id,
        }),
      });

      if (!setupResponse.ok) {
        const errorData = await setupResponse.json();
        throw new Error(errorData.message || errorData.error || "Failed to set up payment");
      }

      const setupData = await setupResponse.json();
      if (!setupData.clientSecret) {
        throw new Error("No client secret returned");
      }

      setClientSecret(setupData.clientSecret);
    } catch (err: any) {
      console.error("Payment setup error:", err);
      setError(err.message || "Failed to set up payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    // Reset state and close dialog
    setClientSecret(null);
    setLoading(false);
    setError(null);

    // Close dialog
    onOpenChange(false);

    // Call the parent's success handler
    onSuccess();
  };

  // Check if Stripe key is available
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const isStripeKeyMissing =
    !stripeKey || stripeKey.includes("pk_test_mock_key") || stripeKey === "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("billing.payment_dialog.title", { fallback: "Payment Details" })}
          </DialogTitle>
        </DialogHeader>

        {/* Error: Missing Stripe Key */}
        {isStripeKeyMissing && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-start">
              <ShieldAlert className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h3 className="mb-2 font-semibold">
                  {t("billing.payment.stripe_key_error", { fallback: "Stripe API Key Error" })}
                </h3>
                <p>
                  {t("billing.payment.missing_stripe_key", {
                    fallback:
                      "The Stripe API key is missing or invalid. Please contact the administrator to set up Stripe correctly.",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
            <p className="text-muted-foreground mt-2 text-sm">
              {t("billing.payment.setting_up", { fallback: "Setting up payment form..." })}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <PaymentError
            message={error}
            type="general"
            onRetry={() => {
              setError(null);
              fetchSetupIntent();
            }}
          />
        )}

        {/* Payment Form */}
        {clientSecret && !loading && !error && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: resolvedTheme === "dark" ? "night" : "stripe",
                variables: {
                  colorPrimary: "#0570de",
                  colorBackground: resolvedTheme === "dark" ? "#1a1a1a" : "#ffffff",
                  colorText: resolvedTheme === "dark" ? "#ffffff" : "#30313d",
                  colorTextSecondary: resolvedTheme === "dark" ? "#ffffff" : "#30313d",
                  colorTextPlaceholder: resolvedTheme === "dark" ? "#9ca3af" : "#6b7280",
                },
                rules: {
                  ".Label": {
                    color: resolvedTheme === "dark" ? "#ffffff" : "#30313d",
                    textAlign: locale === "ar" ? "right" : "left",
                  },
                  ".Input": {
                    color: resolvedTheme === "dark" ? "#ffffff" : "#30313d",
                    backgroundColor: resolvedTheme === "dark" ? "#2d2d2d" : "#ffffff",
                    textAlign: locale === "ar" ? "right" : "left",
                    direction: locale === "ar" ? "rtl" : "ltr",
                  },
                  ".Tab": {
                    backgroundColor: resolvedTheme === "dark" ? "#2d2d2d" : "#ffffff",
                    textAlign: locale === "ar" ? "right" : "left",
                  },
                  ".TabSelected": {
                    backgroundColor: resolvedTheme === "dark" ? "#3d3d3d" : "#f3f4f6",
                  },
                },
              },
              locale: locale === "ar" ? "ar" : "en",
              loader: "always",
            }}
          >
            <PaymentFormContent
              onSuccess={handleSuccess}
              priceId={selectedPlan}
              planName={priceDetails?.name}
              planPrice={priceDetails?.price}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentFormContent({
  onSuccess,
  priceId,
  planName = "Business Plan",
  planPrice = "49.99 SAR/month",
}: {
  onSuccess: () => void;
  priceId?: string;
  planName?: string;
  planPrice?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{
    message: string;
    type: "card" | "authentication" | "network" | "general";
  } | null>(null);
  const [saveCard, setSaveCard] = useState(true);

  const isRtl = locale === "ar";

  // Format price for Arabic display
  const formatPriceForDisplay = (price: string): string => {
    if (locale !== "ar") return price;

    // Basic Arabic price formatting
    const parts = price.split(" ");
    if (parts.length >= 2) {
      const amount = parts[0];
      const currency = parts[1];

      // Convert amount to Arabic numerals
      const arabicAmount = amount.replace(/[0-9]/g, (d) =>
        String.fromCharCode(d.charCodeAt(0) + 1584),
      );

      // Replace SAR with ر.س for Arabic
      const arabicCurrency = currency === "SAR" ? "ر.س" : currency;

      // Add interval information if present (like /month)
      let result = `${arabicAmount} ${arabicCurrency}`;
      if (parts.length > 2 && parts[2].includes("/")) {
        const interval = parts[2].substring(1); // remove the slash
        const arabicInterval =
          interval === "month" ? "شهرياً" : interval === "year" ? "سنوياً" : interval;
        result += ` ${arabicInterval}`;
      }

      return result;
    }

    return price;
  };

  // Determine error type based on error message
  const getErrorType = (
    errorMessage: string,
  ): "card" | "authentication" | "network" | "general" => {
    const lowercaseMsg = errorMessage.toLowerCase();

    if (
      lowercaseMsg.includes("card") ||
      lowercaseMsg.includes("payment method") ||
      lowercaseMsg.includes("cvc") ||
      lowercaseMsg.includes("expiration")
    ) {
      return "card";
    }

    if (
      lowercaseMsg.includes("authentication") ||
      lowercaseMsg.includes("auth") ||
      lowercaseMsg.includes("verify") ||
      lowercaseMsg.includes("3d secure")
    ) {
      return "authentication";
    }

    if (
      lowercaseMsg.includes("network") ||
      lowercaseMsg.includes("connection") ||
      lowercaseMsg.includes("internet") ||
      lowercaseMsg.includes("timeout")
    ) {
      return "network";
    }

    return "general";
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!stripe || !elements || !priceId) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Submit payment details without confirming payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Then confirm the setup
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
          // No return_url to prevent page refresh
        },
      });

      if (error) {
        console.error("Setup confirmation error:", error);
        setError({
          message: error.message || "Payment processing failed. Please try again.",
          type: getErrorType(error.message || ""),
        });
        setIsProcessing(false);
        return;
      }

      if (!setupIntent || setupIntent.status !== "succeeded") {
        throw new Error("Setup failed. Please try again.");
      }

      // Create subscription with the setup payment method
      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method?.id;

      if (!paymentMethodId) {
        throw new Error("No payment method returned from setup.");
      }

      // Log success of setup intent before proceeding
      console.log("Setup successful, payment method ID:", paymentMethodId);

      try {
        const response = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            paymentMethodId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Subscription creation failed:", errorData);
          throw new Error(errorData.message || errorData.error || "Subscription creation failed");
        }

        const data = await response.json();
        console.log("Subscription created successfully:", data);

        // Handle additional payment confirmation if needed
        if (data.status === "incomplete" && data.clientSecret) {
          console.log("Additional payment confirmation needed");

          try {
            const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
              // No redirect options to prevent page refresh
            });

            if (confirmError) {
              console.error("Payment confirmation error:", confirmError);
              throw new Error(confirmError.message);
            }

            console.log("Payment confirmed successfully");
          } catch (confirmErr) {
            console.error("Error confirming payment:", confirmErr);
            setError({
              message:
                confirmErr instanceof Error ? confirmErr.message : "Failed to confirm payment",
              type: "card",
            });
            setIsProcessing(false);
            return;
          }
        }

        // Dispatch a custom event for subscription updates
        window.dispatchEvent(new CustomEvent("subscription_updated"));

        // Call success handler
        console.log("Payment process completed successfully");
        setIsProcessing(false);
        onSuccess();
      } catch (err) {
        console.error("Payment error:", err);
        setError({
          message:
            err instanceof Error
              ? err.message
              : t("billing.payment.error", {
                  fallback: "An error occurred while processing your payment. Please try again.",
                }),
          type: getErrorType(err instanceof Error ? err.message : ""),
        });
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError({
        message:
          err instanceof Error
            ? err.message
            : t("billing.payment.error", {
                fallback: "An error occurred while processing your payment. Please try again.",
              }),
        type: getErrorType(err instanceof Error ? err.message : ""),
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header with plan details */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold">
          {t("billing.update_to_plan", {
            plan: planName || "",
            fallback: `Update to ${planName || "Subscription"}`,
          })}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("billing.payment.enter_details", {
            fallback: "Enter your payment details to complete the subscription change",
          })}
        </p>
        <p className="mt-3 font-medium">
          {t("billing.selected_plan_price", {
            price: formatPriceForDisplay(planPrice || ""),
            fallback: `Price: ${formatPriceForDisplay(planPrice || "")}`,
          })}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <PaymentElement />
          </div>

          <div className={`flex items-center ${isRtl ? "space-x-reverse" : ""} space-x-2`}>
            <Checkbox
              id="save-card"
              checked={saveCard}
              onCheckedChange={(checked) => setSaveCard(checked as boolean)}
            />
            <label
              htmlFor="save-card"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("billing.payment.save_card", { fallback: "Save card for future payments" })}
            </label>
          </div>
        </div>

        <div className="text-muted-foreground text-sm">
          <span>
            {t("billing.payment.terms_agreement_start", {
              fallback: "By proceeding, you agree to our ",
            })}
            <a href="#" className="underline">
              {t("billing.payment.terms", { fallback: "Terms of Service" })}
            </a>
            {t("billing.payment.terms_agreement_middle", {
              fallback: " and acknowledge our ",
            })}
            <a href="#" className="underline">
              {t("billing.payment.privacy", { fallback: "Privacy Policy" })}
            </a>
            {t("billing.payment.terms_agreement_end", {
              fallback: ".",
            })}
          </span>
        </div>

        {error && (
          <PaymentError
            message={error.message}
            type={error.type}
            onRetry={() => {
              setError(null);
              if (elements) elements.submit();
            }}
          />
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!stripe || isProcessing}
          type="button"
        >
          {isProcessing ? (
            <>
              <Loader2 className={`${isRtl ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
              {t("billing.payment.processing", { fallback: "Processing..." })}
            </>
          ) : (
            t("billing.payment.complete_payment", { fallback: "Complete Payment" })
          )}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          {t("billing.payment.test_card", {
            fallback: "For testing, use card number: 4242 4242 4242 4242, any future date, any CVC",
          })}
        </p>
      </div>
    </div>
  );
}

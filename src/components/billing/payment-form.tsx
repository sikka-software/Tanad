"use client";

import { useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Load Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export function PaymentForm({
  onSuccess,
  planName,
  planPrice,
  clientSecret,
}: {
  onSuccess: () => void;
  planName?: string;
  planPrice?: string;
  clientSecret: string;
}) {
  const t = useTranslations();

  // Check if Stripe key is available
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey || stripeKey.includes("pk_test_mock_key") || stripeKey === "") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
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
    );
  }

  // Handle the case when client secret is empty
  if (!clientSecret || clientSecret.trim() === "") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="mb-2 font-semibold">
          {t("billing.payment.error_title", { fallback: "Payment Setup Error" })}
        </h3>
        <p>
          {t("billing.payment.missing_client_secret", {
            fallback: "There was an issue setting up the payment form. Please try again later.",
          })}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 border-red-300 bg-red-100 text-red-800 hover:bg-red-200"
        >
          {t("billing.payment.try_again", { fallback: "Try Again" })}
        </Button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentFormContent onSuccess={onSuccess} planName={planName} planPrice={planPrice} />
    </Elements>
  );
}

function PaymentFormContent({
  onSuccess,
  planName = "Business Plan",
  planPrice = "49.99 SAR/month",
}: {
  onSuccess: () => void;
  planName?: string;
  planPrice?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate the form elements before submission
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Get payment intent client secret from URL search params
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = `${window.location.origin}/dashboard?payment_success=true`;

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // If we get here without a redirect, it means the payment was confirmed successfully
      console.log("Payment confirmed successfully:", paymentIntent);
      setPaymentSuccess(true);

      // Create subscription with the confirmed payment
      try {
        // Extract priceId from payment intent metadata
        // We'll need to get this from the server or URL parameters
        const priceId = searchParams.get("priceId") || "";

        if (!priceId) {
          throw new Error(
            t("billing.missing_price_id", {
              fallback: "Missing price ID for subscription creation",
            }),
          );
        }

        // Create subscription using our API
        const response = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            paymentMethodId: paymentIntent?.payment_method || undefined,
            paymentIntentId: paymentIntent?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || "Failed to create subscription");
        }

        // Subscription created successfully
        const subscriptionData = await response.json();
        console.log("Subscription created:", subscriptionData);

        // Call the success handler
        setIsProcessing(false);
        onSuccess();
      } catch (subscriptionError: any) {
        console.error("Error creating subscription:", subscriptionError);
        throw new Error(subscriptionError.message || "Failed to create subscription after payment");
      }
    } catch (err: any) {
      setError(
        err.message ||
          t("billing.payment.error", {
            fallback: "An error occurred while processing your payment. Please try again.",
          }),
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header with plan details */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold">
          {t("billing.update_to_plan", {
            plan: planName,
            fallback: `Update to ${planName}`,
          })}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("billing.payment.enter_details", {
            fallback: "Enter your payment details to complete the subscription change",
          })}
        </p>
        <p className="mt-3 font-medium">
          {t("billing.selected_plan_price", {
            price: formatPriceForDisplay(planPrice),
            fallback: `Price: ${formatPriceForDisplay(planPrice)}`,
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <PaymentElement />

          <div className={`flex items-center ${isRtl ? "space-x-reverse" : ""} space-x-2`}>
            <Checkbox id="save-card" />
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
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className={`${isRtl ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
              {t("billing.payment.processing", { fallback: "Processing..." })}
            </>
          ) : (
            t("billing.payment.complete_payment", { fallback: "Complete Payment" })
          )}
        </Button>
      </form>
    </div>
  );
}

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, CreditCard, Loader2, ShieldAlert, Wallet, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

import { useSubscription } from "@/hooks/use-subscription";

// Import the subscription event constant to make sure it's available
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useUserStore from "@/stores/use-user-store";

// Load Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// PayPal Icon Component
function PayPalIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M19.763 7.376c-.216 1.45-1.314 4.5-3.8 4.5h-1.8c-.262 0-.5.15-.608.39l-1.6 5.2c-.08.24-.314.45-.575.45H9.36a.348.348 0 0 1-.338-.45l.48-1.6v-.01l.87-2.78c.08-.26-.1-.55-.375-.55H8.42c-.266 0-.406-.28-.339-.57l.39-1.65h1.37c.262 0 .501-.15.606-.39l1.575-5.2c.08-.24.315-.39.576-.39h5.041c.266 0 .406.24.339.52-.078.27-.214.72-.214.72z"
        fill="#253B80"
      />
      <path
        d="M6.1 7.4l-2 7.2c-.078.3.084.55.345.55h1.4c.264 0 .504-.19.607-.48l2-6.8c.078-.3-.084-.56-.345-.56H6.77a.72.72 0 0 0-.671.09z"
        fill="#179BD7"
      />
      <path
        d="M17.012 3.1c-.216 1.45-1.313 4.5-3.8 4.5h-1.8c-.263 0-.5.15-.607.39l-1.6 5.2c-.08.24-.313.45-.575.45H6.61a.348.348 0 0 1-.338-.45l.87-2.79c.08-.26-.1-.55-.375-.55H5.67c-.266 0-.407-.28-.338-.57l.39-1.65h1.37c.262 0 .5-.15.606-.39l1.575-5.2c.08-.24.314-.39.576-.39h5.041c.265 0 .406.24.338.52-.078.27-.214.72-.214.72z"
        fill="#253B80"
      />
      <path
        d="M3.35 3.13l-2 7.2c-.08.3.083.55.345.55h1.4c.262 0 .503-.19.606-.48l2-6.8c.08-.3-.083-.56-.345-.56h-1.34a.727.727 0 0 0-.67.09h.005z"
        fill="#179BD7"
      />
    </svg>
  );
}

// Google Pay Icon Component
function GooglePayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M21.5 12c0-.17-.02-.33-.04-.5h-9.68v1.9h5.53c-.12.65-.48 1.2-.99 1.58v1.31h1.61c.94-.86 1.56-2.13 1.56-3.67l.01-.62z"
        fill="#4285F4"
      />
      <path
        d="M11.78 21.5c1.34 0 2.47-.44 3.29-1.2l-1.61-1.24c-.45.3-1.02.48-1.68.48-1.28 0-2.38-.87-2.77-2.04H7.36v1.28c.82 1.63 2.46 2.72 4.42 2.72z"
        fill="#34A853"
      />
      <path
        d="M9.01 17.5c-.1-.3-.16-.62-.16-.96 0-.34.06-.66.15-.96V14.3H7.35c-.32.63-.5 1.34-.5 2.08 0 .74.18 1.45.5 2.08l1.66-1.27v.31z"
        fill="#FBBC05"
      />
      <path
        d="M11.78 13.54c.72 0 1.37.25 1.88.73l1.42-1.42c-.86-.8-1.98-1.29-3.3-1.29-1.96 0-3.6 1.09-4.42 2.72l1.65 1.28c.39-1.17 1.5-2.02 2.77-2.02z"
        fill="#EA4335"
      />
    </svg>
  );
}

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

// New component for displaying saved payment methods
function SavedPaymentMethods({
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onUseNewCard,
  loading,
  locale,
}: {
  paymentMethods: any[];
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (id: string | null) => void;
  onUseNewCard: () => void;
  loading: boolean;
  locale: string;
}) {
  const t = useTranslations();
  const isRtl = locale === "ar";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!paymentMethods.length) {
    return (
      <div className="text-muted-foreground py-2 text-sm">
        {t("Billing.payment.no_saved_cards", { fallback: "No saved payment methods found." })}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-sm font-medium">
        {t("Billing.payment.saved_cards", { fallback: "Saved Cards" })}
      </div>
      <RadioGroup
        value={selectedPaymentMethod || ""}
        onValueChange={(value: string) => setSelectedPaymentMethod(value === "" ? null : value)}
        className="space-y-2"
      >
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${
              selectedPaymentMethod === method.id
                ? "border-primary bg-primary/5"
                : "hover:bg-accent"
            }`}
            dir={isRtl ? "rtl" : "ltr"}
            onClick={() => setSelectedPaymentMethod(method.id)}
          >
            <RadioGroupItem value={method.id} id={method.id} className={isRtl ? "ml-2" : "mr-2"} />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">
                  {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)}
                </span>
                <span className="text-muted-foreground text-sm">
                  •••• •••• •••• {method.card.last4} |{" "}
                  {t("Billing.payment.expires", { fallback: "Expires" })} {method.card.exp_month}/
                  {method.card.exp_year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onUseNewCard} className="mt-2">
          {t("Billing.payment.use_new_card", { fallback: "Use a new card instead" })}
        </Button>
      </div>
    </div>
  );
}

export function PaymentDialog({
  open,
  onOpenChange,
  selectedPlan,
  onSuccess,
  customerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: string;
  onSuccess: () => void;
  customerId: string;
}) {
  const router = useRouter();
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

  // Debug function to check for customer ID
  const debugCustomerData = async () => {
    // Log existing data
    console.log("PaymentDialog Debug Info:", {
      userObj: {
        id: user?.id,
        email: user?.email,
        stripe_customer_id: user?.stripe_customer_id,
        hasProfile: !!user?.profile,
        profileStripeId: user?.profile?.stripe_customer_id,
      },
      passedCustomerId: customerId,
      selectedPlan,
    });

    if (user?.id) {
      try {
        // Fetch the profile directly from the database for comparison
        const supabase = createClient();
        const { data: dbProfile, error } = await supabase
          .from("profiles")
          .select("id, stripe_customer_id, email")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile from DB:", error);
        } else {
          console.log("Profile data from database:", dbProfile);

          // If we found a customer ID in the database but not in the current profile
          if (dbProfile?.stripe_customer_id && !customerId && !user?.stripe_customer_id) {
            console.log(
              "Found stripe_customer_id in database but not in current state:",
              dbProfile.stripe_customer_id,
            );
            return dbProfile.stripe_customer_id;
          }
        }
      } catch (err) {
        console.error("Error in debugCustomerData:", err);
      }
    }
    return null;
  };

  // In the PaymentDialog component, before the useEffect for fetchSetupIntent
  useEffect(() => {
    // Run diagnostics when dialog opens
    if (open) {
      debugCustomerData().then((dbCustomerId) => {
        if (dbCustomerId && !user.stripe_customer_id) {
          console.log("Setting stripe_customer_id from database lookup:", dbCustomerId);
          // This is just client-side for this session
          const updatedUser = { ...user, stripe_customer_id: dbCustomerId } as any;
          useUserStore.getState().setUser(updatedUser);
        }
      });
    }
  }, [open, user, customerId, selectedPlan]);

  // Fetch client secret for setup intent
  const fetchSetupIntent = async () => {
    const supabase = createClient();
    if (!selectedPlan || !user || !open) return;

    setLoading(true);
    setError(null);

    try {
      // Debug user data
      console.log("User data before setup:", {
        id: user?.id,
        customerId: user?.stripe_customer_id,
        isAuthenticated: !!user,
        hasProfile: !!user?.profile,
      });

      // Try to get customer ID from database if not available from state
      if (!customerId && !user?.stripe_customer_id && !user?.profile?.stripe_customer_id) {
        const dbCustomerId = await debugCustomerData();
        if (dbCustomerId) {
          console.log("Using customer ID from database lookup:", dbCustomerId);
          const updatedUser = { ...user, stripe_customer_id: dbCustomerId } as any;
          useUserStore.getState().setUser(updatedUser);
          // Now we can use this ID
          customerId = dbCustomerId;
        }
      }

      // Fetch price details first
      const priceResponse = await fetch(`/api/stripe/get-price?priceId=${selectedPlan}`);
      if (!priceResponse.ok) {
        throw new Error("Failed to get price details");
      }
      const priceData = await priceResponse.json();
      setPriceDetails({
        name: priceData.lookup_key || "Subscription",
        price: priceData.price || "0.00 SAR/month",
      });

      // Prioritize using the customerId passed as prop
      let stripeCustomerId = customerId;

      // If no customerId prop, try getting from user.stripe_customer_id
      if (!stripeCustomerId && user.stripe_customer_id) {
        stripeCustomerId = user.stripe_customer_id;
      }

      // If still no customer ID, check the profile
      if (!stripeCustomerId && user.profile?.stripe_customer_id) {
        stripeCustomerId = user.profile.stripe_customer_id;
      }

      // If still no customer ID and we have user.id, try looking it up
      if (!stripeCustomerId && user.id) {
        // Look up customer ID from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();

        if (profile?.stripe_customer_id) {
          stripeCustomerId = profile.stripe_customer_id;
        } else {
          // No customer ID found, may need to create one
          console.log("No Stripe customer ID found for user");
        }
      }

      // Make sure we have a customer ID
      if (!stripeCustomerId) {
        // Try to wait for it if it might be loading
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check again
        if (!stripeCustomerId && !user?.id) {
          setLoading(false);
          toast.error("User information not available. Please refresh and try again.");
          return;
        }

        // If we still don't have a customer ID, we might need to create one
        if (!stripeCustomerId) {
          setError("No Stripe customer ID found. Please contact support.");
          setLoading(false);
          return;
        }
      }

      console.log("Using customer ID for setup intent:", stripeCustomerId);

      // Create a setup intent for the customer
      const setupResponse = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: stripeCustomerId,
        }),
      });

      if (!setupResponse.ok) {
        const errorData = await setupResponse.json();
        console.error("Setup response error:", errorData);
        throw new Error(errorData.message || errorData.error || "Failed to set up payment");
      }

      const setupData = await setupResponse.json();
      if (!setupData.clientSecret) {
        throw new Error("No client secret returned");
      }

      setClientSecret(setupData.clientSecret);
    } catch (err: any) {
      console.error("Payment setup error:", err);
      if (err.message === "Could not find user profile") {
        setError(
          "User profile not found. Please make sure you are logged in with a complete profile.",
        );
        // Try to refresh the user data
        fetchUserAndProfile().catch((e) => console.error("Failed to refresh user data:", e));
      } else {
        setError(err.message || "Failed to set up payment");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    // Reset state and close dialog
    setClientSecret(null);
    setLoading(false);
    setError(null);

    console.log("Payment successful, closing dialog");

    // Show a loading toast immediately
    const loadingToast = toast.loading("Processing your subscription...");

    // Allow more time for the backend to process the subscription
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Attempt to refresh data directly to reflect changes immediately
    try {
      await Promise.all([fetchUserAndProfile(), refetchSubscription()]);
      console.log("Initial data refresh completed");
    } catch (error) {
      console.error("Error in initial refresh:", error);
    }

    // Close dialog
    onOpenChange(false);

    // Additional delay before calling parent's success handler
    setTimeout(() => {
      console.log("Executing onSuccess callback");

      // Call success callback to trigger any parent component updates
      onSuccess();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success(
        t("Billing.payment.success", {
          fallback: "Payment successful! Your subscription has been updated.",
        }),
      );

      // Silently reload the page without confirmation dialog, preserving locale
      setTimeout(() => {
        // Use router.push instead of window.location to preserve locale and Next.js context
        router.push({
          pathname: "/billing",
          query: { refresh: Date.now() }, // Add timestamp to force full refresh
        });
      }, 1500);
    }, 1000);
  };

  // Check if Stripe key is available
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const isStripeKeyMissing =
    !stripeKey || stripeKey.includes("pk_test_mock_key") || stripeKey === "";

  // Log the customerId value before rendering
  console.log("PaymentDialog about to render with customerId:", customerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={locale === "ar" ? "text-right" : "text-left"}>
            {t("Billing.payment.dialog_title", { fallback: "Payment Details" })}
          </DialogTitle>
        </DialogHeader>

        {/* Error: Missing Stripe Key */}
        {isStripeKeyMissing && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-start">
              <ShieldAlert className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h3 className="mb-2 font-semibold">
                  {t("Billing.payment.stripe_key_error", { fallback: "Stripe API Key Error" })}
                </h3>
                <p>
                  {t("Billing.payment.missing_stripe_key", {
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
              {t("Billing.payment.setting_up", { fallback: "Setting up payment form..." })}
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
              customerId={customerId}
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
  planName,
  planPrice,
  customerId,
}: {
  onSuccess: () => void;
  priceId?: string;
  planName?: string;
  planPrice?: string;
  customerId?: string;
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const { user } = useUserStore();
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [loadingSavedMethods, setLoadingSavedMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  const isRtl = locale === "ar";

  // Fetch saved payment methods when component mounts
  useEffect(() => {
    const fetchSavedPaymentMethods = async () => {
      // First try to use passed prop customerId
      let customerIdToUse = customerId;

      // Then fall back to user.stripe_customer_id if available
      if (!customerIdToUse && user?.stripe_customer_id) {
        customerIdToUse = user.stripe_customer_id;
      }

      // If no customer ID, exit
      if (!customerIdToUse) {
        console.log("No customer ID available for fetching payment methods");
        setShowNewCardForm(true);
        return;
      }

      console.log("Fetching payment methods with customerId:", customerIdToUse);

      setLoadingSavedMethods(true);
      try {
        const response = await fetch("/api/stripe/get-payment-methods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customerIdToUse,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        const data = await response.json();
        const methods = data.paymentMethods || [];
        setSavedPaymentMethods(methods);

        // Manage visibility and selection based on available methods
        if (methods.length > 0) {
          // If there are saved methods, select the first one by default
          // unless one is already selected
          if (!selectedPaymentMethod) {
            console.log("Auto-selecting first saved payment method:", methods[0].id);
            setSelectedPaymentMethod(methods[0].id);
          }
          setShowNewCardForm(false);
        } else {
          // If no saved methods, show the new card form
          console.log("No saved payment methods found, showing new card form");
          setSelectedPaymentMethod(null);
          setShowNewCardForm(true);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setSelectedPaymentMethod(null);
        setShowNewCardForm(true);
      } finally {
        setLoadingSavedMethods(false);
      }
    };

    fetchSavedPaymentMethods();
  }, [customerId, user?.stripe_customer_id, selectedPaymentMethod]);

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

    if (!stripe || !priceId) {
      return;
    }

    // Check if we have user data
    if (!user) {
      toast.error("User information is not available. Please refresh and try again.");
      setIsProcessing(false);
      return;
    }

    // Make sure we have a customer ID, either from user object or profile
    let customerIdToUse = user?.stripe_customer_id;
    const customerSource = customerIdToUse ? "user object" : "";

    if (!customerIdToUse && user?.profile?.stripe_customer_id) {
      customerIdToUse = user.profile.stripe_customer_id;
      console.log("Using customer ID from profile");
    }

    // If we still don't have it, check the passed prop
    if (!customerIdToUse && customerId) {
      console.log("Using passed customer ID prop:", customerId);
      customerIdToUse = customerId;
    }

    // Final attempt - try looking up directly in the database
    if (!customerIdToUse && user?.id) {
      try {
        console.log("Making final attempt to lookup customer ID in database");
        const supabase = createClient();
        const { data: dbProfile, error } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();

        if (!error && dbProfile?.stripe_customer_id) {
          console.log(
            "Found customer ID in database as last resort:",
            dbProfile.stripe_customer_id,
          );
          customerIdToUse = dbProfile.stripe_customer_id;

          // Also update the user object for future use
          const updatedUser = { ...user, stripe_customer_id: customerIdToUse } as any;
          useUserStore.getState().setUser(updatedUser);
        }
      } catch (err) {
        console.error("Error in final database lookup:", err);
      }
    }

    if (!customerIdToUse) {
      console.error("No Stripe customer ID available from any source", {
        userId: user?.id,
        email: user?.email,
        hasStripeId: !!user?.stripe_customer_id,
        hasProfileStripeId: !!user?.profile?.stripe_customer_id,
        passedCustomerId: customerId,
      });
      setError({
        message:
          "Payment setup error: Could not find your payment profile. Please try refreshing the page. If the problem persists, please contact support.",
        type: "general",
      });
      setIsProcessing(false);
      return;
    }

    console.log(
      `Using customer ID: ${customerIdToUse} (source: ${customerSource || "passed prop or profile"})`,
    );

    setIsProcessing(true);
    setError(null);

    try {
      // Check if we're using a saved card or a new card
      const isUsingSavedCard =
        paymentMethod === "card" && selectedPaymentMethod && !showNewCardForm;

      console.log("Payment method state:", {
        paymentMethod,
        selectedPaymentMethod,
        showNewCardForm,
        isUsingSavedCard,
      });

      // If we have a selected saved payment method, use it
      if (isUsingSavedCard) {
        console.log("Using saved payment method:", selectedPaymentMethod);
        console.log("With customer ID:", customerIdToUse);

        // Create subscription with the selected payment method
        const response = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            paymentMethodId: selectedPaymentMethod,
            customerId: customerIdToUse,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || "Subscription creation failed");
        }

        const data = await response.json();
        console.log("Subscription created successfully with saved card:", data);

        // Dispatch events and call success handler
        window.dispatchEvent(new CustomEvent("subscription_updated"));

        // Also dispatch as named constant from CurrentPlan if available
        if (typeof window !== "undefined") {
          try {
            import("@/components/billing/CurrentPlan")
              .then((module) => {
                if (module.SUBSCRIPTION_UPDATED_EVENT) {
                  window.dispatchEvent(new CustomEvent(module.SUBSCRIPTION_UPDATED_EVENT));
                }
              })
              .catch((err) => console.warn("Could not import from CurrentPlan:", err));
          } catch (err) {
            console.warn("Error dispatching additional event:", err);
          }
        }

        setIsProcessing(false);
        onSuccess();
        return;
      }

      // If using a new card, proceed with the original flow
      if (!elements) {
        throw new Error("Stripe Elements not available");
      }

      // Submit payment details without confirming payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Continue with the existing payment flow for new cards
      // ... rest of the existing payment processing code remains the same ...

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

      // Log available IDs for debugging
      console.log("Creating subscription with:", {
        userId: user?.id,
        customerId: customerIdToUse,
        paymentMethodId,
      });

      try {
        const response = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            paymentMethodId,
            customerId: customerIdToUse,
            userId: user?.id,
          }),
        });

        let data;
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || "Subscription creation failed");
        }

        data = await response.json();
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
        console.log("Dispatching subscription_updated event");
        window.dispatchEvent(new CustomEvent("subscription_updated"));

        // Also dispatch as named constant from CurrentPlan
        try {
          // Import directly instead of dynamic import for better reliability
          const module = await import("@/components/billing/CurrentPlan");
          if (module.SUBSCRIPTION_UPDATED_EVENT) {
            console.log(`Dispatching ${module.SUBSCRIPTION_UPDATED_EVENT} event`);
            window.dispatchEvent(new CustomEvent(module.SUBSCRIPTION_UPDATED_EVENT));
          }
        } catch (err) {
          console.warn("Error dispatching SUBSCRIPTION_UPDATED_EVENT:", err);
        }

        // Add a loading indicator toast to show progress
        const loadingToast = toast.loading("Updating your subscription...");

        // Short delay to allow backend systems to update
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear the loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(
          t("Billing.subscription_successful", {
            fallback: "Subscription updated successfully",
          }),
        );

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
              : t("Billing.payment.error", {
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
            : t("Billing.payment.error", {
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
          {t("Billing.update_to_plan", {
            plan: t(`Billing.${planName}`, { fallback: planName || "Subscription" }),
            fallback: `Update to ${planName || "Subscription"}`,
          })}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("Billing.payment.enter_details", {
            fallback: "Enter your payment details to complete the subscription change",
          })}
        </p>
        <p className="mt-3 font-medium">
          {t("Billing.selected_plan_price", {
            price: formatPriceForDisplay(planPrice || ""),
            fallback: `Price: ${formatPriceForDisplay(planPrice || "")}`,
          })}
        </p>
      </div>

      <div className="space-y-6">
        <Tabs
          defaultValue="card"
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "card" | "wallet")}
          dir={isRtl ? "rtl" : "ltr"}
          className={isRtl ? "text-right" : "text-left"}
        >
          <TabsList className={`grid w-full grid-cols-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <TabsTrigger value="card" className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("Billing.payment.credit_card", { fallback: "Credit Card" })}
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center justify-center gap-2">
              <Wallet className="h-4 w-4" />
              {t("Billing.payment.digital_wallet", { fallback: "Digital Wallet" })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="pt-4">
            {/* Display saved payment methods if available */}
            {savedPaymentMethods.length > 0 && !showNewCardForm && (
              <div className="mb-6 rounded-lg border p-4">
                <SavedPaymentMethods
                  paymentMethods={savedPaymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  onUseNewCard={() => setShowNewCardForm(true)}
                  loading={loadingSavedMethods}
                  locale={locale}
                />
              </div>
            )}

            {/* Show the new card form if there are no saved methods or user chose to use a new card */}
            {(showNewCardForm || savedPaymentMethods.length === 0) && (
              <>
                <div className="mb-4">
                  <div className="mb-2 text-sm font-medium">
                    {savedPaymentMethods.length > 0
                      ? t("Billing.payment.new_card", { fallback: "New Card" })
                      : t("Billing.payment.payment_details", { fallback: "Payment Details" })}
                  </div>
                </div>
                <div className="rounded-lg border p-4" dir={isRtl ? "rtl" : "ltr"}>
                  <PaymentElement
                    options={{
                      layout: {
                        type: "tabs",
                        defaultCollapsed: false,
                      },
                      defaultValues: {
                        billingDetails: {
                          address: {
                            country: "SA",
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center space-x-2" dir={isRtl ? "rtl" : "ltr"}>
                  <Checkbox
                    id="save-card"
                    checked={saveCard}
                    onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                  />
                  <label
                    htmlFor="save-card"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("Billing.payment.save_card", { fallback: "Save card for future payments" })}
                  </label>
                </div>
                {savedPaymentMethods.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCardForm(false);
                      // If no card is currently selected, select the first saved card
                      if (!selectedPaymentMethod && savedPaymentMethods.length > 0) {
                        setSelectedPaymentMethod(savedPaymentMethods[0].id);
                      }
                    }}
                    className="mt-4"
                  >
                    {t("Billing.payment.use_saved_card", { fallback: "Use a saved card instead" })}
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4 pt-4" dir={isRtl ? "rtl" : "ltr"}>
            <Button
              variant="outline"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md border"
              onClick={() => {
                // Handle PayPal payment
                toast.info("PayPal integration coming soon");
              }}
            >
              <PayPalIcon className="h-5 w-5" />
              <span className="text-center font-medium">
                {t("Billing.payment.pay_with_paypal", { fallback: "Pay with PayPal" })}
              </span>
            </Button>

            <Button
              variant="outline"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md border"
              onClick={() => {
                // Handle Google Pay
                toast.info("Google Pay integration coming soon");
              }}
            >
              <GooglePayIcon className="h-5 w-5" />
              <span className="text-center font-medium">
                {t("Billing.payment.google_pay", { fallback: "Google Pay" })}
              </span>
            </Button>
          </TabsContent>
        </Tabs>

        <div className="text-muted-foreground text-sm">
          <span>
            {t("Billing.payment.terms_agreement_start", {
              fallback: "By proceeding, you agree to our ",
            })}
            <a href="#" className="underline">
              {t("Billing.payment.terms", { fallback: "Terms of Service" })}
            </a>
            {t("Billing.payment.terms_agreement_middle", {
              fallback: " and acknowledge our ",
            })}
            <a href="#" className="underline">
              {t("Billing.payment.privacy", { fallback: "Privacy Policy" })}
            </a>
            {t("Billing.payment.terms_agreement_end", {
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
              {t("Billing.payment.processing", { fallback: "Processing..." })}
            </>
          ) : (
            t("Billing.payment.complete_payment", { fallback: "Complete Payment" })
          )}
        </Button>
      </div>
    </div>
  );
}

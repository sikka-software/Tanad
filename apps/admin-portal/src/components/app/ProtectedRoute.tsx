import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const loading = useUserStore((state) => state.loading);
  const fetchUserAndProfile = useUserStore((state) => state.fetchUserAndProfile);
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const supabase = createClient();

  // Try to load user data if not available
  useEffect(() => {
    if (!user && !loading) {
      useUserStore.getState().fetchUserAndProfile();
    }

    // Show loader after a small delay if still loading
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoader(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Handle Stripe customer creation for new users
  useEffect(() => {
    const ensureStripeCustomer = async () => {
      // Skip if already processing, no user, or if user already has a Stripe customer ID
      if (isProcessingStripe || !user || (profile && profile.stripe_customer_id)) {
        return;
      }

      const createStripeFlag =
        typeof window !== "undefined" &&
        sessionStorage.getItem("create_stripe_customer") === "true";

      // Only process if user has no stripe customer ID in profile
      const needsSetup = user && (!profile || (profile && !profile.stripe_customer_id));

      if (!needsSetup && !createStripeFlag) return;

      // Clear flag to prevent repeated processing
      if (createStripeFlag) {
        sessionStorage.removeItem("create_stripe_customer");
      }

      setIsProcessingStripe(true);

      try {
        console.log("Creating Stripe customer for user:", user.email);

        // Create a Stripe customer
        const createStripeCustomerResponse = await fetch("/api/stripe/create-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.email?.split("@")[0], // Use part of email as name initially
          }),
        });

        if (!createStripeCustomerResponse.ok) {
          const errorData = await createStripeCustomerResponse.json();
          throw new Error(errorData.message || "Failed to create Stripe customer");
        }

        const { customerId } = await createStripeCustomerResponse.json();

        if (!customerId) {
          throw new Error("No Stripe customer ID returned from API");
        }

        console.log("Created Stripe customer ID:", customerId);

        // Check if user has a profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (existingProfile) {
          // Update existing profile with Stripe customer ID
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Create a new enterprise for this user
          const enterpriseName = `${user.email?.split("@")[0]}'s Enterprise`;
          const { data: enterpriseData, error: enterpriseError } = await supabase
            .from("enterprises")
            .insert({
              name: enterpriseName,
              email: user.email,
            })
            .select()
            .single();

          if (enterpriseError) {
            console.error("Enterprise creation error:", enterpriseError);
            throw enterpriseError;
          }

          // Create a new profile with the Stripe customer ID
          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            user_id: user.id,
            email: user.email,
            first_name: user.email?.split("@")[0] || "", // Placeholder
            last_name: "", // Placeholder
            stripe_customer_id: customerId,
            enterprise_id: enterpriseData.id,
            user_settings: {
              currency: "USD",
              calendar_type: "gregorian",
              timezone: "UTC",
              notifications: {
                email_updates: true,
                email_marketing: false,
                email_security: true,
                app_mentions: true,
                app_comments: true,
                app_tasks: true,
              },
            },
          });

          if (profileError) {
            throw profileError;
          }
        }

        // Refresh user data to get updated profile
        await fetchUserAndProfile();

        console.log("User profile completed with Stripe customer ID");
      } catch (error) {
        console.error("Error setting up Stripe customer:", error);
        // Don't show error to user unless this is a critical path
      } finally {
        setIsProcessingStripe(false);
      }
    };

    ensureStripeCustomer();
  }, [user, profile, isProcessingStripe, fetchUserAndProfile, supabase]);

  // Redirect to login if user isn't authenticated after loading
  useEffect(() => {
    if (!user && !loading) {
      // Store the intended URL to redirect back after auth
      const currentPath = router.asPath;
      if (currentPath !== "/auth") {
        sessionStorage.setItem("redirectAfterAuth", currentPath);
      }
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // While loading, show a loader after a brief delay
  if (loading || !user) {
    if (showLoader) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;

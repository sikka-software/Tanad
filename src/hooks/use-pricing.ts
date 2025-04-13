import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { StripePlan, getStripePlans } from "@/lib/stripe";

export function usePricing() {
  const t = useTranslations();
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Fetch plans directly from Stripe
        const stripePlans = await getStripePlans();
        setPlans(stripePlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  const getPlans = () => {
    return plans;
  };

  // Function to refresh plans directly from Stripe
  const refreshPlans = async () => {
    setLoading(true);
    try {
      const stripePlans = await getStripePlans();
      setPlans(stripePlans);
    } catch (error) {
      console.error("Error refreshing plans:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getPlans,
    refreshPlans,
  };
}

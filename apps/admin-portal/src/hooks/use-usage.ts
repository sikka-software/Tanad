import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import useUserStore from "@/stores/use-user-store";

import { useSubscription } from "./use-subscription";

interface UsageData {
  total: number;
  used: number;
  available: number;
  usedPercentage: number;
  isLoading: boolean;
}

export function useUsage() {
  const t = useTranslations();
  const [usageData, setUsageData] = useState<UsageData>({
    total: 0,
    used: 0,
    available: 0,
    usedPercentage: 0,
    isLoading: true,
  });
  const { user } = useUserStore();
  const subscription = useSubscription();

  // Create a fetchUsageData function that can be called from outside
  const fetchUsageData = useCallback(async () => {
    if (!user || !subscription.planLookupKey) {
      return;
    }

    try {
      setUsageData((prev) => ({ ...prev, isLoading: true }));

      // Default values for different plan tiers
      // These should be customized based on your application's needs
      let total = 0;

      switch (subscription.planLookupKey) {
        case "tanad_free":
          total = 50;
          break;
        case "tanad_standard":
          total = 500;
          break;
        case "tanad_pro":
          total = 2000;
          break;
        case "tanad_business":
          total = 5000;
          break;
        case "tanad_enterprise":
          total = 10000;
          break;
        default:
          total = 50;
      }

      // In a real application, you would fetch the actual usage from your backend
      // For this example, we're simulating a random usage value
      const used = Math.floor(Math.random() * (total * 0.7));
      const available = total - used;
      const usedPercentage = (used / total) * 100;

      setUsageData({
        total,
        used,
        available,
        usedPercentage,
        isLoading: false,
      });

      return true; // Indicate successful refresh
    } catch (error) {
      console.error("Error fetching usage data:", error);
      setUsageData((prev) => ({ ...prev, isLoading: false }));
      return false; // Indicate failed refresh
    }
  }, [user, subscription.planLookupKey]);

  // Initial load of usage data
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return {
    usageData,
    refresh: fetchUsageData, // Return the same function for external use
  };
}

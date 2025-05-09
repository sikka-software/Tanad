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
      let invoiceTotal = 0;
      let employeeTotal = 0;
      let storageTotal = 0; // in MB
      let clientsTotal = 0;

      switch (subscription.planLookupKey) {
        case "tanad_free":
          invoiceTotal = 50;
          employeeTotal = 3;
          storageTotal = 500;
          clientsTotal = 20;
          break;
        case "tanad_standard":
          invoiceTotal = 500;
          employeeTotal = 15;
          storageTotal = 2000;
          clientsTotal = 100;
          break;
        case "tanad_pro":
          invoiceTotal = 2000;
          employeeTotal = 50;
          storageTotal = 10000;
          clientsTotal = 500;
          break;
        case "tanad_business":
          invoiceTotal = 5000;
          employeeTotal = 250;
          storageTotal = 50000;
          clientsTotal = 2000;
          break;
        case "tanad_enterprise":
          invoiceTotal = 10000;
          employeeTotal = 1000;
          storageTotal = 200000;
          clientsTotal = 10000;
          break;
        default:
          invoiceTotal = 50;
          employeeTotal = 3;
          storageTotal = 500;
          clientsTotal = 20;
      }

      // In a real application, you would fetch the actual usage from your backend
      // For this example, we're simulating random usage values
      const invoiceUsed = Math.floor(Math.random() * (invoiceTotal * 0.7));
      const invoiceAvailable = invoiceTotal - invoiceUsed;
      const invoiceUsedPercentage = (invoiceUsed / invoiceTotal) * 100;

      // Employee count usage
      const employeeUsed = Math.floor(Math.random() * (employeeTotal * 0.6));
      const employeeAvailable = employeeTotal - employeeUsed;
      const employeeUsedPercentage = (employeeUsed / employeeTotal) * 100;

      // Storage usage
      const storageUsed = Math.floor(Math.random() * (storageTotal * 0.5));
      const storageAvailable = storageTotal - storageUsed;
      const storageUsedPercentage = (storageUsed / storageTotal) * 100;

      // Clients usage
      const clientsUsed = Math.floor(Math.random() * (clientsTotal * 0.8));
      const clientsAvailable = clientsTotal - clientsUsed;
      const clientsUsedPercentage = (clientsUsed / clientsTotal) * 100;

      setUsageData({
        total: invoiceTotal,
        used: invoiceUsed,
        available: invoiceAvailable,
        usedPercentage: invoiceUsedPercentage,
        isLoading: false,
        employeeUsage: {
          total: employeeTotal,
          used: employeeUsed,
          available: employeeAvailable,
          usedPercentage: employeeUsedPercentage,
        },
        storageUsage: {
          total: storageTotal,
          used: storageUsed,
          available: storageAvailable,
          usedPercentage: storageUsedPercentage,
        },
        invoiceUsage: {
          total: invoiceTotal,
          used: invoiceUsed,
          available: invoiceAvailable,
          usedPercentage: invoiceUsedPercentage,
        },
        clientsUsage: {
          total: clientsTotal,
          used: clientsUsed,
          available: clientsAvailable,
          usedPercentage: clientsUsedPercentage,
        },
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

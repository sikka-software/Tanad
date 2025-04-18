import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import useUserStore from "@/hooks/use-user-store";

// Generic type for settings data
export type SettingsData = Record<string, any>;

// Function to update settings via API
const updateSettings = async (settings: SettingsData): Promise<SettingsData> => {
  console.log("Making API call with settings:", settings);
  
  const response = await fetch("/api/settings/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
    credentials: "include", // Include cookies
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API error response:", errorData);
    throw new Error(errorData.message || "Failed to update settings");
  }

  const data = await response.json();
  return data.data;
};

export function useSettingsMutation() {
  const queryClient = useQueryClient();
  const { refreshProfile, user } = useUserStore();

  return useMutation({
    mutationFn: async (settings: SettingsData) => {
      // Include the user ID in the request as fallback
      return updateSettings({
        ...settings,
        user_id: user?.id
      });
    },
    onSuccess: async (data) => {
      // Invalidate and refetch any queries that may depend on this data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Refresh the user profile in the store
      await refreshProfile();
      
      toast.success("Settings updated successfully");
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
      console.error("Settings mutation error:", error);
    },
  });
} 
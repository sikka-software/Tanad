import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import useUserStore from "@/stores/use-user-store";

// Types for our profile data
type ProfileData = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  address?: string;
  email?: string; // Email may come from profile or user
  username?: string;
  user_settings?: Record<string, any>;
  // Add other profile fields as needed
};

// Type for profile update data
type ProfileUpdateData = Partial<Omit<ProfileData, "id">>;

// Function to fetch profile data
const fetchProfile = async (profile_id: string): Promise<ProfileData> => {
  if (!profile_id) {
    throw new Error("Profile ID is required");
  }

  const response = await fetch(`/api/profile/info?profile_id=${profile_id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  const data = await response.json();
  return data.profile;
};

// Function to update profile data
const updateProfile = async ({
  profile_id,
  data,
}: {
  profile_id: string;
  data: ProfileUpdateData;
}): Promise<ProfileData> => {
  if (!profile_id) {
    throw new Error("Profile ID is required");
  }

  const response = await fetch(`/api/profile/update?profile_id=${profile_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  const responseData = await response.json();
  return responseData.profile;
};

// Hook to fetch profile data
export function useProfile(profile_id: string) {
  return useQuery({
    queryKey: ["profile", profile_id],
    queryFn: () => {
      if (!profile_id) {
        throw new Error("Cannot fetch profile: No profile ID provided");
      }
      return fetchProfile(profile_id);
    },
    enabled: !!profile_id,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    retry: (failureCount, error) => {
      // Don't retry if the error is due to missing profile_id
      if (error instanceof Error && error.message.includes("No profile ID provided")) {
        return false;
      }
      // Otherwise retry up to 3 times
      return failureCount < 3;
    },
  });
}

// Hook to update profile data
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userStore = useUserStore();
  const t = useTranslations();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate the profile query to refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });

      // Also update the profile in the user store to keep both in sync
      // This helps with components that still use the user store
      if (userStore.profile) {
        // Create a compatible user store profile object by preserving original values
        // and overriding with new data
        const updatedProfile = {
          ...userStore.profile,
          full_name: data.full_name || userStore.profile.full_name,
          avatar_url: data.avatar_url || userStore.profile.avatar_url,
          address: data.address || userStore.profile.address,
          email: data.email || userStore.profile.email,
          username: data.username || userStore.profile.username,
          // Careful handling of user_settings to preserve the required fields
          user_settings: {
            currency: userStore.profile.user_settings?.currency,
            calendar_type: userStore.profile.user_settings?.calendar_type,
            timezone: data.user_settings?.timezone || userStore.profile.user_settings?.timezone,
            notifications: userStore.profile.user_settings?.notifications,
            // Preserve the navigation settings
            navigation:
              data.user_settings?.navigation || userStore.profile.user_settings?.navigation,
            // Preserve hidden menu items
            hidden_menu_items:
              data.user_settings?.hidden_menu_items ||
              userStore.profile.user_settings?.hidden_menu_items,
          },
        };

        userStore.setProfile(updatedProfile);
      }

      toast.success(t("Settings.saved_successfully"));
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(t("Settings.error_saving"));
    },
  });
}

// For integrating with the existing user store when needed
export function useUserAndProfile(profile_id: string) {
  const { data: profile, isLoading, error } = useProfile(profile_id);
  const userStore = useUserStore();

  return {
    profile: profile || userStore.profile,
    user: userStore.user,
    isLoading,
    error,
  };
}

// Example of how to use these hooks in components:
/*
// For fetching profile data:
const { data: profile, isLoading, error } = useProfile(profile_id);

// For updating profile data:
const updateProfileMutation = useUpdateProfile();

const handleSubmit = (formData) => {
  updateProfileMutation.mutate({
    profile_id: "user-profile-id",
    data: {
      full_name: formData.name,
      email: formData.email,
      // other fields
    }
  });
};
*/

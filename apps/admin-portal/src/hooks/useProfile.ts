import { useTranslations } from "next-intl";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import useUserStore from "@/hooks/use-user-store";
import type { Profile as UserStoreProfile } from "@/hooks/use-user-store";

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
const fetchProfile = async (profileId: string): Promise<ProfileData> => {
  if (!profileId) {
    throw new Error("Profile ID is required");
  }

  console.log("[fetchProfile] Fetching profile for ID:", profileId);
  const response = await fetch(`/api/profile/info?profileId=${profileId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  const data = await response.json();
  console.log("[fetchProfile] Profile data received:", data.profile);
  return data.profile;
};

// Function to update profile data
const updateProfile = async ({
  profileId,
  data,
}: {
  profileId: string;
  data: ProfileUpdateData;
}): Promise<ProfileData> => {
  if (!profileId) {
    throw new Error("Profile ID is required");
  }

  console.log("[updateProfile] Updating profile for ID:", profileId);
  console.log("[updateProfile] Update data:", data);
  
  const response = await fetch(`/api/profile/update?profileId=${profileId}`, {
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
  console.log("[updateProfile] Updated profile data:", responseData.profile);
  return responseData.profile;
};

// Hook to fetch profile data
export function useProfile(profileId: string) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => {
      if (!profileId) {
        throw new Error("Cannot fetch profile: No profile ID provided");
      }
      return fetchProfile(profileId);
    },
    enabled: !!profileId,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    retry: (failureCount, error) => {
      // Don't retry if the error is due to missing profileId
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
        const updatedProfile: UserStoreProfile = {
          ...userStore.profile,
          full_name: data.full_name || userStore.profile.full_name,
          avatar_url: data.avatar_url || userStore.profile.avatar_url,
          address: data.address || userStore.profile.address,
          email: data.email || userStore.profile.email,
          username: data.username || userStore.profile.username,
          // Careful handling of user_settings to preserve the required fields
          user_settings: {
            currency: userStore.profile.user_settings.currency,
            calendar_type: userStore.profile.user_settings.calendar_type,
            timezone: data.user_settings?.timezone || userStore.profile.user_settings.timezone,
            notifications: userStore.profile.user_settings.notifications,
            // Preserve the navigation settings
            navigation:
              data.user_settings?.navigation || userStore.profile.user_settings.navigation,
          },
        };

        console.log("[useUpdateProfile] Updating profile with:", updatedProfile);
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
export function useUserAndProfile(profileId: string) {
  const { data: profile, isLoading, error } = useProfile(profileId);
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
const { data: profile, isLoading, error } = useProfile(profileId);

// For updating profile data:
const updateProfileMutation = useUpdateProfile();

const handleSubmit = (formData) => {
  updateProfileMutation.mutate({
    profileId: "user-profile-id",
    data: {
      full_name: formData.name,
      email: formData.email,
      // other fields
    }
  });
};
*/

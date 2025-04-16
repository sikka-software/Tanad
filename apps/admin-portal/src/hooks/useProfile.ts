import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const response = await fetch(`/api/profile/info?profileId=${profileId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  const data = await response.json();
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
  return responseData.profile;
};

// Hook to fetch profile data
export function useProfile(profileId: string) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfile(profileId),
    enabled: !!profileId,
  });
}

// Hook to update profile data
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate the profile query to refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    },
  });
}

// For integrating with the existing user store when needed
export function useUserAndProfile(profileId: string) {
  // This could integrate with the existing user store or other auth mechanisms
  const { data: profile, isLoading, error } = useProfile(profileId);
  
  // Here you would typically fetch/access the user data as well
  // For now, we're just returning the profile data
  return {
    profile,
    user: null, // This would be replaced with actual user data
    isLoading,
    error
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

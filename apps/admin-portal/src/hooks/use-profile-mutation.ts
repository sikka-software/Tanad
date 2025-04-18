import { useTranslations } from "next-intl";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export const useProfileMutation = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      timezone: string;
      user_settings?: {
        currency?: string;
        calendar_type?: string;
        timezone?: string;
        notifications?: {
          email_updates?: boolean;
          email_marketing?: boolean;
          email_security?: boolean;
          app_mentions?: boolean;
          app_comments?: boolean;
          app_tasks?: boolean;
        };
      };
    }) => {
      // Update auth email
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (updateError) throw updateError;

      const user = await supabase.auth.getUser();
      console.log("user is ", user);
      // Update profile in Supabase
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.name,
          user_settings: {
            ...data.user_settings,
            timezone: data.timezone,
          },
        })
        .eq("id", user.data.user?.id);

      if (updateProfileError) throw updateProfileError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("Settings.saved_successfully"));
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(t("Settings.error_saving"));
    },
  });
};

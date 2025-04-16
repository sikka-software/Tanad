import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { supabase } from "@/lib/supabase";

export const useProfileMutation = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; timezone: string }) => {
      // Update auth email
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (updateError) throw updateError;

      // Update profile in Drizzle
      await db
        .update(profiles)
        .set({
          full_name: data.name,
          user_settings: {
            timezone: data.timezone,
          },
        })
        .where(profiles.id.eq(supabase.auth.getUser().then((user) => user.data.user?.id)));

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
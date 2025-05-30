import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Switch } from "@/ui/switch";

import { useUpdateProfile } from "@/hooks/use-profile";

import useUserStore from "@/stores/use-user-store";

const formSchema = z.object({
  email_updates: z.boolean(),
  email_marketing: z.boolean(),
  email_security: z.boolean(),
  app_mentions: z.boolean(),
  app_comments: z.boolean(),
  app_tasks: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface NotificationSettingsProps {
  onDirtyChange: (isDirty: boolean) => void;
  onSave: () => void;
  onSaveComplete: () => void;
  isSaving: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

const NotificationSettings = ({
  onDirtyChange,
  onSave,
  onSaveComplete,
  isSaving,
  formRef,
}: NotificationSettingsProps) => {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  // Get user from the existing store to get profile_id
  const profile_id = user?.id || "";
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // Use the profile hook to fetch data

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingProfile(false);
    }, 1000);
  }, []);

  // Initialize the update mutation
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_updates: false,
      email_marketing: false,
      email_security: false,
      app_mentions: false,
      app_comments: false,
      app_tasks: false,
    },
  });

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profile) {
      const formValues = {
        email_updates: profile.user_settings?.notifications?.email_updates ?? false,
        email_marketing: profile.user_settings?.notifications?.email_marketing ?? false,
        email_security: profile.user_settings?.notifications?.email_security ?? false,
        app_mentions: profile.user_settings?.notifications?.app_mentions ?? false,
        app_comments: profile.user_settings?.notifications?.app_comments ?? false,
        app_tasks: profile.user_settings?.notifications?.app_tasks ?? false,
      };
      setTimeout(() => {
        form.reset(formValues);
      }, 0);
    }
  }, [profile, form]);

  // Watch for form changes to update isDirty state
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: FormValues) => {
    onSave();
    try {
      if (!profile?.id) {
        throw new Error("Profile ID is required");
      }

      const currentUserSettings = profile.user_settings || {};

      await updateProfileMutation.mutateAsync({
        id: profile.id,
        data: {
          user_settings: {
            ...currentUserSettings,
            notifications: data,
          },
        },
      });

      // Reset the form with the current data to clear dirty state
      form.reset(data);
      onSaveComplete();
    } catch (error) {
      console.error("Error submitting notification form:", error);
      onSaveComplete();
    }
  };

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
        <CardTitle>{t("Settings.notifications.title")}</CardTitle>
        <CardDescription>{t("Settings.notifications.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Form {...form}>
          <form
            className="space-y-4"
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.notifications.email.title")}</h3>
              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="email_updates"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="email-updates" className="m-0 flex-1">
                        {t("Settings.notifications.email.updates")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-updates"
                          loading={isLoadingProfile}
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_marketing"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="email-marketing" className="m-0 flex-1">
                        {t("Settings.notifications.email.marketing")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          loading={isLoadingProfile}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-marketing"
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_security"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="email-security" className="m-0 flex-1">
                        {t("Settings.notifications.email.security")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          loading={isLoadingProfile}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-security"
                          className="m-0"
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.notifications.in_app.title")}</h3>

              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="app_mentions"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="app-mentions" className="m-0 flex-1">
                        {t("Settings.notifications.in_app.mentions")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          loading={isLoadingProfile}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-mentions"
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="app_comments"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="app-comments" className="m-0 flex-1">
                        {t("Settings.notifications.in_app.comments")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          loading={isLoadingProfile}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-comments"
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="app_tasks"
                  render={({ field }) => (
                    <FormItem className="m-0 flex items-center justify-between">
                      <FormLabel htmlFor="app-tasks" className="m-0 flex-1">
                        {t("Settings.notifications.in_app.tasks")}
                      </FormLabel>
                      <FormControl className="m-0">
                        <Switch
                          loading={isLoadingProfile}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-tasks"
                          checked={isLoadingProfile ? false : field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;

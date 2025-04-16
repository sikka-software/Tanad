import React from "react";
import { useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useProfileMutation } from "@/hooks/use-profile-mutation";
import useUserStore from "@/hooks/use-user-store";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

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
  const { profile } = useUserStore();
  const profileMutation = useProfileMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_updates: profile?.user_settings?.notifications?.email_updates ?? false,
      email_marketing: profile?.user_settings?.notifications?.email_marketing ?? false,
      email_security: profile?.user_settings?.notifications?.email_security ?? false,
      app_mentions: profile?.user_settings?.notifications?.app_mentions ?? false,
      app_comments: profile?.user_settings?.notifications?.app_comments ?? false,
      app_tasks: profile?.user_settings?.notifications?.app_tasks ?? false,
    },
  });

  // Watch for form changes to update isDirty state
  const isDirty = form.formState.isDirty;
  React.useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: FormValues) => {
    onSave();
    try {
      await profileMutation.mutateAsync({
        name: profile?.full_name || "",
        email: profile?.email || "",
        timezone: profile?.user_settings?.timezone || "UTC",
        user_settings: {
          ...profile?.user_settings,
          notifications: data,
        },
      });
      form.reset(data);
      onSaveComplete();
    } catch (error) {
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
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {t("Settings.notifications.email.title")}
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="email_updates"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="email-updates" className="flex-1">
                        {t("Settings.notifications.email.updates")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-updates"
                          checked={field.value}
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
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="email-marketing" className="flex-1">
                        {t("Settings.notifications.email.marketing")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-marketing"
                          checked={field.value}
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
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="email-security" className="flex-1">
                        {t("Settings.notifications.email.security")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="email-security"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {t("Settings.notifications.in_app.title")}
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="app_mentions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="app-mentions" className="flex-1">
                        {t("Settings.notifications.in_app.mentions")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-mentions"
                          checked={field.value}
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
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="app-comments" className="flex-1">
                        {t("Settings.notifications.in_app.comments")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-comments"
                          checked={field.value}
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
                    <FormItem className="flex items-center justify-between">
                      <FormLabel htmlFor="app-tasks" className="flex-1">
                        {t("Settings.notifications.in_app.tasks")}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          id="app-tasks"
                          checked={field.value}
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

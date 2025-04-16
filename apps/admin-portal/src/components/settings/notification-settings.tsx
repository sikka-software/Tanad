import React from "react";
import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useProfileMutation } from "@/hooks/use-profile-mutation";
import useUserStore from "@/hooks/use-user-store";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  formRef: React.RefObject<HTMLFormElement>;
}

const NotificationSettings = ({
  onDirtyChange,
  onSave,
  onSaveComplete,
  isSaving,
  formRef,
}: NotificationSettingsProps) => {
  const t = useTranslations();
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
    <Card>
      <CardHeader>
        <CardTitle>{t("Settings.notifications")}</CardTitle>
        <CardDescription>{t("Settings.notifications_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.email_notifications")}</h3>
              <FormField
                control={form.control}
                name="email_updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.email_updates")}</FormLabel>
                      <FormDescription>{t("Settings.email_updates_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.email_marketing")}</FormLabel>
                      <FormDescription>{t("Settings.email_marketing_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.email_security")}</FormLabel>
                      <FormDescription>{t("Settings.email_security_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.app_notifications")}</h3>
              <FormField
                control={form.control}
                name="app_mentions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.app_mentions")}</FormLabel>
                      <FormDescription>{t("Settings.app_mentions_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.app_comments")}</FormLabel>
                      <FormDescription>{t("Settings.app_comments_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("Settings.app_tasks")}</FormLabel>
                      <FormDescription>{t("Settings.app_tasks_description")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;

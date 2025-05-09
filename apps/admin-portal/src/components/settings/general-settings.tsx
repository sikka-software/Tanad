import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

import useUserStore from "@/stores/use-user-store";

import BetaFlag from "../ui/beta-flag";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  language: z.string(),
  timezone: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneralSettingsProps {
  onDirtyChange: (isDirty: boolean) => void;
  onSave: () => void;
  onSaveComplete: () => void;
  isSaving: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

const GeneralSettings = ({
  onDirtyChange,
  onSave,
  onSaveComplete,
  isSaving,
  formRef,
}: GeneralSettingsProps) => {
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();

  // Add state to track the selected timezone and language
  const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(lang);

  // Get user from the existing store to get profile_id
  const { user } = useUserStore();
  const profile_id = user?.id || "";

  // Use the profile hook to fetch data
  const { data: profile, isLoading: isLoadingProfile } = useProfile(profile_id);

  // Initialize the update mutation
  const updateProfileMutation = useUpdateProfile();

  // Create form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      language: lang,
      timezone: "UTC",
    },
  });

  // Reset form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      const timezone = profile.user_settings?.timezone || "UTC";

      // Set the selected timezone state
      setSelectedTimezone(timezone);

      // Get stored language preference or use current locale
      const language = profile.user_settings?.language || lang;
      // Set selected language state
      setSelectedLanguage(language);

      const formValues = {
        name: profile.full_name || "",
        email: user?.email || profile.email || "",
        language: language,
        timezone: timezone, // Ensure timezone is explicitly set and not lost
      };

      // Use a timeout to ensure the form reset happens after React has processed state updates
      setTimeout(() => {
        form.reset(formValues);

        // Force set the field values explicitly
        form.setValue("timezone", timezone);
        form.setValue("language", language);
      }, 0);
    }
  }, [profile, user, lang, form]);

  // Watch for form changes to update isDirty state
  const isDirty = form.formState.isDirty;
  React.useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: FormValues) => {
    onSave();
    try {
      await updateProfileMutation.mutateAsync({
        profile_id,
        data: {
          full_name: data.name,
          // Email is managed separately through auth system if needed
          user_settings: {
            ...(profile?.user_settings || {}),
            timezone: data.timezone,
            language: data.language,
          },
        },
      });

      // If email has changed, you might need to update it through auth system
      if (data.email !== user?.email) {
        // Handle email update through auth provider if needed
        // console.log("Email changed, might need additional auth updates");
      }

      // Reset the form with the current data to clear dirty state
      form.reset(data);

      // Check if language has changed and then switch the language
      if (data.language !== lang) {
        router.replace(router.pathname, router.asPath, {
          locale: data.language,
        });
      }

      onSaveComplete();
    } catch (error) {
      console.error("Error submitting form:", error);
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
        <CardTitle>{t("Settings.general.title")}</CardTitle>
        <CardDescription>{t("Settings.general.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.general.profile.title")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.general.profile.name")}</FormLabel>
                      <FormControl>
                        {isLoadingProfile ? (
                          <Skeleton className="h-8 w-full" />
                        ) : (
                          <Input {...field} disabled={isSaving} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.general.profile.email")}</FormLabel>
                      <FormControl>
                        {isLoadingProfile ? (
                          <Skeleton className="h-8 w-full" />
                        ) : (
                          <Input type="email" {...field} disabled={true} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.general.regional.title")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.general.regional.language")}</FormLabel>
                      {isLoadingProfile ? (
                        <Skeleton className="h-8 w-full" />
                      ) : (
                        <Select
                          disabled={isSaving}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedLanguage(val);
                          }}
                          value={field.value || selectedLanguage}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("General.select")}>
                                {field.value === "en"
                                  ? t("General.languages.en")
                                  : t("General.languages.ar")}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">{t("General.languages.en")}</SelectItem>
                            <SelectItem value="ar">{t("General.languages.ar")}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>{t("Settings.general.regional.timezone")}</FormLabel>
                        {isLoadingProfile ? (
                          <Skeleton className="h-8 w-full" />
                        ) : (
                          <BetaFlag
                            title={t("Flags.timezone_soon.title")}
                            description={t("Flags.timezone_soon.description")}
                          >
                            <Select
                              disabled={isSaving}
                              onValueChange={(val) => {
                                field.onChange(val);
                                setSelectedTimezone(val);
                              }}
                              value={field.value || selectedTimezone} // Fall back to selectedTimezone if field.value is empty
                            >
                              <FormControl>
                                <SelectTrigger disabled>
                                  <SelectValue>
                                    {(() => {
                                      const timezoneValue = field.value || selectedTimezone;
                                      const timezoneLabels = {
                                        UTC: "UTC",
                                        EST: "Eastern Time (EST)",
                                        CST: "Central Time (CST)",
                                        PST: "Pacific Time (PST)",
                                      };
                                      return (
                                        timezoneLabels[
                                          timezoneValue as keyof typeof timezoneLabels
                                        ] || timezoneValue
                                      );
                                    })()}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                                <SelectItem value="CST">Central Time (CST)</SelectItem>
                                <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                              </SelectContent>
                            </Select>
                          </BetaFlag>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;

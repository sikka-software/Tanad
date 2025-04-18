import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Euro, PoundSterling, SaudiRiyal, JapaneseYen, Flag } from "lucide-react";
import * as z from "zod";

import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import useUserStore from "@/hooks/use-user-store";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

import BetaFlag from "../ui/beta-flag";

const formSchema = z.object({
  currency: z.string(),
  calendar: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface PreferenceSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
  onSave?: () => void;
  onSaveComplete?: () => void;
  isSaving?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const PreferenceSettings = ({
  onDirtyChange,
  onSave,
  onSaveComplete,
  isSaving,
  formRef,
}: PreferenceSettingsProps = {}) => {
  const lang = useLocale();
  const t = useTranslations();

  // Add state to track the selected values
  const [selectedCurrency, setSelectedCurrency] = useState<string>("usd");
  const [selectedCalendar, setSelectedCalendar] = useState<string>("month");
  const [selectedDateFormat, setSelectedDateFormat] = useState<string>("mdy");
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<string>("12h");

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
      currency: "usd",
      calendar: "month",
      dateFormat: "mdy",
      timeFormat: "12h",
    },
  });

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profile) {
      console.log("Profile loaded for preferences:", profile);
      console.log("User settings:", profile.user_settings);

      // Get preference values from user_settings, with fallbacks
      const currency = profile.user_settings?.currency || "usd";
      const calendar = profile.user_settings?.calendar || "month";
      const dateFormat = profile.user_settings?.date_format || "mdy";
      const timeFormat = profile.user_settings?.time_format || "12h";

      // Set the selected state values
      setSelectedCurrency(currency);
      setSelectedCalendar(calendar);
      setSelectedDateFormat(dateFormat);
      setSelectedTimeFormat(timeFormat);

      const formValues = {
        currency,
        calendar,
        dateFormat,
        timeFormat,
      };

      console.log("Setting preference form values:", formValues);

      // Use a timeout to ensure the form reset happens after React has processed state updates
      setTimeout(() => {
        form.reset(formValues);

        // Force set the field values explicitly
        form.setValue("currency", currency);
        form.setValue("calendar", calendar);
        form.setValue("dateFormat", dateFormat);
        form.setValue("timeFormat", timeFormat);

        // Verify the form state after reset
        console.log("Preference form values after reset:", form.getValues());
      }, 0);
    }
  }, [profile, form]);

  // Watch for form changes to update isDirty state
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: FormValues) => {
    if (onSave) onSave();
    try {
      // Log the current data
      console.log("Submitting preference form data:", data);
      console.log("Current profile:", profile);

      await updateProfileMutation.mutateAsync({
        profile_id,
        data: {
          user_settings: {
            ...(profile?.user_settings || {}),
            currency: data.currency,
            calendar: data.calendar,
            date_format: data.dateFormat,
            time_format: data.timeFormat,
          },
        },
      });

      // Reset the form with the current data to clear dirty state
      form.reset(data);

      if (onSaveComplete) onSaveComplete();
    } catch (error) {
      console.error("Error submitting preference form:", error);
      if (onSaveComplete) onSaveComplete();
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
        <CardTitle>{t("Settings.preferences.title")}</CardTitle>
        <CardDescription>{t("Settings.preferences.description")}</CardDescription>
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
              <h3 className="text-sm font-medium">{t("Settings.preferences.default.title")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.preferences.default.currency")}</FormLabel>
                      {isLoadingProfile ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          disabled={isSaving}
                          onValueChange={(val) => {
                            console.log("Currency changed to:", val);
                            field.onChange(val);
                            setSelectedCurrency(val);
                          }}
                          value={field.value || selectedCurrency}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sar">
                              <div className="flex flex-row items-center gap-2">
                                <span>SAR</span>
                                <SaudiRiyal className="size-3" />
                              </div>
                            </SelectItem>
                            <SelectItem value="usd">
                              <div className="flex flex-row items-center gap-2">
                                <span>USD</span>
                                <DollarSign className="size-3" />
                              </div>
                            </SelectItem>
                            <SelectItem value="eur">
                              <div className="flex flex-row items-center gap-2">
                                <span>EUR</span>
                                <Euro className="size-3" />
                              </div>
                            </SelectItem>
                            <SelectItem value="gbp">
                              <div className="flex flex-row items-center gap-2">
                                <span>GBP</span>
                                <PoundSterling className="size-3" />
                              </div>
                            </SelectItem>
                            <SelectItem value="jpy">
                              <div className="flex flex-row items-center gap-2">
                                <span>JPY</span>
                                <JapaneseYen className="size-3" />
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calendar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.preferences.default.calendar")}</FormLabel>
                      {isLoadingProfile ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <BetaFlag
                          title={t("Flags.calendar_soon.title")}
                          description={t("Flags.calendar_soon.description")}
                        >
                          <Select
                            disabled
                            // disabled={isSaving}
                            onValueChange={(val) => {
                              console.log("Calendar changed to:", val);
                              field.onChange(val);
                              setSelectedCalendar(val);
                            }}
                            value={field.value || selectedCalendar}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("General.select")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="day">
                                {t("General.calendars.gregorian")}
                              </SelectItem>
                              <SelectItem value="week">{t("General.calendars.hijri")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </BetaFlag>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Settings.preferences.datetime.title")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.preferences.datetime.date_format")}</FormLabel>
                      {isLoadingProfile ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          disabled={isSaving}
                          onValueChange={(val) => {
                            console.log("Date format changed to:", val);
                            field.onChange(val);
                            setSelectedDateFormat(val);
                          }}
                          value={field.value || selectedDateFormat}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                            <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                            <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.preferences.datetime.time_format")}</FormLabel>
                      {isLoadingProfile ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          disabled={isSaving}
                          onValueChange={(val) => {
                            console.log("Time format changed to:", val);
                            field.onChange(val);
                            setSelectedTimeFormat(val);
                          }}
                          value={field.value || selectedTimeFormat}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="12h">
                              {t("Settings.preferences.datetime.12h")}
                            </SelectItem>
                            <SelectItem value="24h">
                              {t("Settings.preferences.datetime.24h")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
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

export default PreferenceSettings;

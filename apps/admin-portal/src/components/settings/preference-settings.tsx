import { zodResolver } from "@hookform/resolvers/zod";
import { currencies } from "@tanad.config";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import BetaFlag from "@/ui/beta-flag";
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";

import { useUpdateProfile } from "@/hooks/use-profile";

import { getCurrencySymbol } from "@/lib/currency-utils";

import useUserStore from "@/stores/use-user-store";

const formSchema = z.object({
  currency: z.string(),
  calendar: z.enum(["gregorian", "hijri"]),
  dateFormat: z.string(),
  timeFormat: z.string(),
});

type FormValues = z.input<typeof formSchema>;

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
  const [selectedCurrency, setSelectedCurrency] = useState<string>("sar");
  const [selectedCalendar, setSelectedCalendar] = useState<"gregorian" | "hijri">("gregorian");
  const [selectedDateFormat, setSelectedDateFormat] = useState<string>("mdy");
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<string>("12h");

  // Get user from the existing store to get profile_id
  const user = useUserStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);

  // Use the profile hook to fetch data

  // Initialize the update mutation
  const updateProfileMutation = useUpdateProfile();

  // Create form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "sar",
      calendar: "gregorian",
      dateFormat: "mdy",
      timeFormat: "12h",
    },
  });

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profile) {
      const currency = profile.user_settings?.currency || "sar";
      const calendar = profile.user_settings?.calendar || "gregorian";
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
      // Use a timeout to ensure the form reset happens after React has processed state updates
      setTimeout(() => {
        form.reset(formValues);

        form.setValue("currency", currency);
        form.setValue("calendar", calendar);
        form.setValue("dateFormat", dateFormat);
        form.setValue("timeFormat", timeFormat);
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
      if (!profile?.id) {
        throw new Error("Profile ID is required");
      }

      const currentUserSettings = profile.user_settings || {};

      await updateProfileMutation.mutateAsync({
        id: profile.id,
        data: {
          user_settings: {
            ...currentUserSettings,
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Settings.preferences.default.currency")}</FormLabel>
                    {/* {isLoadingProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : ( */}
                    <Select
                      disabled={isSaving}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={(val) => {
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
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            <div className="flex flex-row items-center gap-2">
                              <span>{t(`Settings.preferences.currency.${currency}`)}</span>
                              {getCurrencySymbol(currency).symbol}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* )} */}
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
                    {/* {isLoadingProfile ? (
                      <Skeleton className="h-10 w-full" /> */}
                    {/* ) : ( */}
                    <BetaFlag
                      title={t("Flags.calendar_soon.title")}
                      description={t("Flags.calendar_soon.description")}
                    >
                      <Select
                        dir={lang === "ar" ? "rtl" : "ltr"}
                        disabled
                        onValueChange={(val) => {
                          field.onChange(val as "gregorian" | "hijri");
                          setSelectedCalendar(val as "gregorian" | "hijri");
                        }}
                        value={field.value || selectedCalendar}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("General.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gregorian">
                            {t("General.calendars.gregorian")}
                          </SelectItem>
                          <SelectItem value="hijri">{t("General.calendars.hijri")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </BetaFlag>
                    {/* )} */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Settings.preferences.datetime.date_format")}</FormLabel>
                    {/* {isLoadingProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : ( */}
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      disabled={isSaving}
                      onValueChange={(val) => {
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
                    {/* )} */}
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
                    {/* {isLoadingProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : ( */}
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      disabled={isSaving}
                      onValueChange={(val) => {
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
                    {/* )} */}
                    <FormMessage />
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

export default PreferenceSettings;

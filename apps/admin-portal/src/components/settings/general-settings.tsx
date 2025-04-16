import React from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import useUserStore from "@/hooks/use-user-store";
import { useProfileMutation } from "@/hooks/use-profile-mutation";

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
  formRef: React.RefObject<HTMLFormElement>;
}

const GeneralSettings = ({ onDirtyChange, onSave, onSaveComplete, isSaving, formRef }: GeneralSettingsProps) => {
  const t = useTranslations();
  const lang = useLocale();
  const { profile } = useUserStore();
  const profileMutation = useProfileMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: profile?.email || "",
      language: lang,
      timezone: profile?.user_settings?.timezone || "UTC",
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
        name: data.name,
        email: data.email,
        timezone: data.timezone,
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
                        <Input {...field} disabled={isSaving} />
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
                        <Input type="email" {...field} disabled={isSaving} />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("General.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">{t("General.languages.en")}</SelectItem>
                          <SelectItem value="ar">{t("General.languages.ar")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Settings.general.regional.timezone")}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("General.select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time (ET)</SelectItem>
                          <SelectItem value="CST">Central Time (CT)</SelectItem>
                          <SelectItem value="PST">Pacific Time (PT)</SelectItem>
                        </SelectContent>
                      </Select>
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

export default GeneralSettings;

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { FlippableInput } from "@/components/ui/flippable-input";

import { useCreateEnterprise } from "./onboarding.hooks";

export const createEnterpriseSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("OnBoarding.form.enterprise_name.required")),
    email: z.string().email(t("OnBoarding.form.email.invalid")),
    industry: z.string(),
    size: z.string(),
  });

export type EnterpriseFormValues = z.input<ReturnType<typeof createEnterpriseSchema>>;

export function OnboardingForm() {
  const t = useTranslations();
  const { mutate: createEnterprise, isPending } = useCreateEnterprise();

  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(createEnterpriseSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      industry: "",
      size: "",
    },
  });

  const onSubmit = async (data: EnterpriseFormValues) => {
    try {
      await createEnterprise(data);
    } catch (error: any) {
      console.error("Error invoking create enterprise mutation:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.enterprise_name.label")}</FormLabel>
              <FormControl>
                <FlippableInput
                  {...field}
                  placeholder={t("OnBoarding.form.enterprise_name.placeholder")}
                  disabled={isPending}
                />
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
              <FormLabel>{t("OnBoarding.form.email.label")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  placeholder={t("OnBoarding.form.email.placeholder")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.industry.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("OnBoarding.form.industry.placeholder")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.size.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("OnBoarding.form.size.placeholder")}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("OnBoarding.form.create_enterprise")}
        </Button>
      </form>
    </Form>
  );
}

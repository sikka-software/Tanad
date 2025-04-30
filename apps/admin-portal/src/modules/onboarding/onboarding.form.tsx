import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { useCreateEnterprise } from "./onboarding.hooks";

const formSchema = z.object({
  name: z.string().min(1, "Enterprise name is required"),
  description: z.string(),
  logo: z.string(),
  email: z.string().email(),
  industry: z.string(),
  size: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const t = useTranslations();
  const { mutate: createEnterprise, isPending } = useCreateEnterprise();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
      email: "",
      industry: "",
      size: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createEnterprise(data);
    } catch (error: any) {
      console.error("Error invoking create enterprise mutation:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.enterprise_name")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("OnBoarding.form.enterprise_name_placeholder")} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.description")}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t("OnBoarding.form.description_placeholder")} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("OnBoarding.form.logo")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("OnBoarding.form.logo_placeholder")} disabled={isPending} />
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
              <FormLabel>{t("OnBoarding.form.email")}</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder={t("OnBoarding.form.email_placeholder")} disabled={isPending} />
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
              <FormLabel>{t("OnBoarding.form.industry")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("OnBoarding.form.industry_placeholder")} disabled={isPending} />
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
              <FormLabel>{t("OnBoarding.form.size")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("OnBoarding.form.size_placeholder")} disabled={isPending} />
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

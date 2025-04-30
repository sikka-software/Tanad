import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useCreateEnterprise } from "./onboarding.hooks";
import { INDUSTRY_OPTIONS, SIZE_OPTIONS, EnterpriseCreateData } from "./onboarding.type";

const formSchema = z.object({
  name: z.string().min(1, "Enterprise name is required"),
  description: z.string().min(1, "Description is required"),
  logo: z.string().optional(),
  email: z.string().email("Invalid email address"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
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

  const onSubmit = (data: FormData) => {
    createEnterprise(data as EnterpriseCreateData);
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
                <Input {...field} placeholder={t("OnBoarding.form.enterprise_name_placeholder")} />
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
                <Textarea {...field} placeholder={t("OnBoarding.form.description_placeholder")} />
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
                <Input {...field} type="url" placeholder={t("OnBoarding.form.logo_placeholder")} />
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
                <Input
                  {...field}
                  type="email"
                  placeholder={t("OnBoarding.form.email_placeholder")}
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
              <FormLabel>{t("OnBoarding.form.industry")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("OnBoarding.form.industry_placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("OnBoarding.form.size_placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("General.creating") : t("OnBoarding.form.create_enterprise")}
        </Button>
      </form>
    </Form>
  );
}

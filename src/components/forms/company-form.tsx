import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Create schema factory to handle translations
export const createCompanySchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Companies.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Companies.form.validation.email_required"))
      .email(t("Companies.form.validation.email_invalid")),
    phone: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
  });

export type CompanyFormValues = z.input<ReturnType<typeof createCompanySchema>>;

interface CompanyFormProps {
  id?: string;
  onSubmit: (data: CompanyFormValues) => void;
  loading?: boolean;
  defaultValues?: Partial<CompanyFormValues>;
}

export function CompanyForm({ id, onSubmit, loading, defaultValues }: CompanyFormProps) {
  const t = useTranslations();
  const companySchema = createCompanySchema(t);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      industry: "",
      size: "",
      notes: "",
      isActive: true,
      ...defaultValues,
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).companyForm = form;
  }

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.name.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.name.placeholder")}
                    {...field}
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
                <FormLabel>{t("Companies.form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={loading}
                    placeholder={t("Companies.form.email.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.phone.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.phone.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.website.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.website.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.address.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.address.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.city.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.city.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.state.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.state.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.zip_code.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.zip_code.placeholder")}
                    {...field}
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
                <FormLabel>{t("Companies.form.industry.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.industry.placeholder")}
                    {...field}
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
                <FormLabel>{t("Companies.form.size.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("Companies.form.size.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea
                  disabled={loading}
                  placeholder={t("Companies.form.notes.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("Companies.form.is_active.label")}</FormLabel>
              </div>
              <FormControl>
                <Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

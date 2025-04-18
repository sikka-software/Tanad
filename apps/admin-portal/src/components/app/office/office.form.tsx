import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

export const createOfficeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Offices.form.name.required")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().min(1, t("Offices.form.address.required")),
    city: z.string().min(1, t("Offices.form.city.required")),
    state: z.string().min(1, t("Offices.form.state.required")),
    zip_code: z.string().min(1, t("Offices.form.zip_code.required")),
  });

export type OfficeFormValues = z.input<ReturnType<typeof createOfficeSchema>>;

export interface OfficeFormProps {
  id?: string;
  onSubmit: (data: OfficeFormValues) => void;
  loading?: boolean;
}

export function OfficeForm({ id, onSubmit, loading }: OfficeFormProps) {
  const t = useTranslations();
  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(createOfficeSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).officeForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "office-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Offices.form.name.label")}</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
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
              <FormLabel>{t("Offices.form.email.label")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={loading} />
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
              <FormLabel>{t("Offices.form.phone.label")}</FormLabel>
              <FormControl>
                <Input {...field} type="tel" disabled={loading} />
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
              <FormLabel>{t("Offices.form.address.label")}</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Offices.form.city.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
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
                <FormLabel>{t("Offices.form.state.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Offices.form.zip_code.label")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

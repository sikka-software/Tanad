import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { toast } from "sonner";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchVendorById } from "@/services/vendorService";

const createVendorSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().min(1, t("Vendors.form.company.required")),
    address: z.string().min(1, t("Vendors.form.address.required")),
    city: z.string().min(1, t("Vendors.form.city.required")),
    state: z.string().min(1, t("Vendors.form.state.required")),
    zipCode: z.string().min(5, t("Vendors.form.zip_code.required")),
    notes: z.string().nullable(),
  });

export type VendorFormValues = z.infer<ReturnType<typeof createVendorSchema>>;

interface VendorFormProps {
  formId?: string;
  vendorId?: string;
  loading?: boolean;
  userId: string | null;
  form: ReturnType<typeof useForm<VendorFormValues>>;
}

export function VendorForm({
  formId,
  vendorId,
  loading: externalLoading = false,
  userId,
  form,
}: VendorFormProps) {
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  // Fetch vendor data if vendorId is provided (edit mode)
  useEffect(() => {
    if (vendorId) {
      setInternalLoading(true);
      fetchVendorById(vendorId)
        .then((vendor) => {
          form.reset({
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            company: vendor.company || "",
            address: vendor.address,
            city: vendor.city,
            state: vendor.state,
            zipCode: vendor.zipCode,
            notes: vendor.notes || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch vendor:", error);
          toast.error(t("error.title"), {
            description: t("Vendors.messages.error_fetch"),
          });
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [vendorId, form, t]);

  return (
    <Form {...form}>
      <form id={formId} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.name.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Vendors.form.name.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.company.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Vendors.form.company.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.email.label")} *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Vendors.form.email.placeholder")}
                    {...field}
                    disabled={loading}
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
                <FormLabel>{t("Vendors.form.phone.label")} *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t("Vendors.form.phone.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Vendors.form.address.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Vendors.form.address.placeholder")}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.city.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Vendors.form.city.placeholder")}
                    {...field}
                    disabled={loading}
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
                <FormLabel>{t("Vendors.form.state.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Vendors.form.state.placeholder")}
                    {...field}
                    disabled={loading}
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
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
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
              <FormLabel>{t("Vendors.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Vendors.form.notes.placeholder")}
                  {...field}
                  value={field.value ?? ""}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

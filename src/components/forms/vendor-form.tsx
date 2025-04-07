import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import type { Vendor } from "@/api/vendors"; // Import Vendor type
import { createVendor, fetchVendorById, updateVendor } from "@/api/vendors"; // Import API functions
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
import { Textarea } from "@/components/ui/textarea";

// Schema factory for vendor form validation with translations
const createVendorSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().optional(),
    address: z.string().min(1, t("Vendors.form.address.required")),
    city: z.string().min(1, t("Vendors.form.city.required")),
    state: z.string().min(1, t("Vendors.form.state.required")),
    zip_code: z.string().min(1, t("Vendors.form.zip_code.required")),
    notes: z.string().optional(),
  });

export type VendorFormValues = z.infer<ReturnType<typeof createVendorSchema>>;

interface VendorFormProps {
  formId?: string;
  vendorId?: string;
  onSuccess?: (vendor: Vendor) => void;
  loading?: boolean;
  userId: string | null;
}

export function VendorForm({
  formId,
  vendorId,
  onSuccess,
  loading: externalLoading = false,
  userId,
}: VendorFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const vendorSchema = createVendorSchema(t);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
    },
  });

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
            zip_code: vendor.zip_code,
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

  const onSubmit: SubmitHandler<VendorFormValues> = async (data) => {
    setInternalLoading(true);
    if (!userId) {
      toast.error(t("error.title"), {
        description: t("error.not_authenticated"),
      });
      setInternalLoading(false);
      return;
    }

    try {
      const vendorData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() || "",
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        notes: data.notes?.trim() || null,
        user_id: userId,
      };

      let result: Vendor;
      if (vendorId) {
        const { user_id, ...updateData } = vendorData;
        result = await updateVendor(vendorId, updateData);
        toast.success(t("success.title"), {
          description: t("Vendors.messages.success_updated"),
        });
      } else {
        result = await createVendor(vendorData);
        toast.success(t("success.title"), {
          description: t("Vendors.messages.success_created"),
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/vendors");
      }
    } catch (error) {
      console.error("Failed to save vendor:", error);
      toast.error(t("error.title"), {
        description:
          error instanceof Error ? error.message : t("Vendors.messages.error_save"),
      });
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
                <FormLabel>{t("Vendors.form.company.label")}</FormLabel>
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
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.zip_code.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Vendors.form.zip_code.placeholder")}
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

        {!formId && (
          <Button type="submit" disabled={loading}>
            {loading
              ? t("common.saving")
              : vendorId
                ? t("common.update_button")
                : t("common.create_button")}
          </Button>
        )}
      </form>
    </Form>
  );
} 
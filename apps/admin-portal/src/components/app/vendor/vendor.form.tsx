import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { CompanyForm, type CompanyFormValues } from "@/components/app/company/company.form";

import { fetchVendorById } from "@/services/vendorService";

import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/component";

export const createVendorSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().optional(),
    address: z.string().min(1, t("Vendors.form.address.required")),
    city: z.string().min(1, t("Vendors.form.city.required")),
    state: z.string().min(1, t("Vendors.form.state.required")),
    zipCode: z.string().min(5, t("Vendors.form.zip_code.required")),
    notes: z.string().nullable(),
  });

export type VendorFormValues = z.input<ReturnType<typeof createVendorSchema>>;

interface VendorFormProps {
  formId?: string;
  vendor_id?: string;
  loading?: boolean;
  user_id: string | undefined;
  onSubmit?: (data: VendorFormValues) => void;
}

export function VendorForm({
  formId,
  vendor_id,
  loading: externalLoading = false,
  user_id,
  onSubmit,
}: VendorFormProps) {
  const supabase = createClient();
  const t = useTranslations();
  const { locale } = useRouter();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(createVendorSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).vendorForm = form;
  }

  // Format companies for ComboboxAdd
  const companyOptions =
    companies?.map((company) => ({
      label: company.name,
      value: company.id,
    })) || [];

  // Fetch vendor data if vendor_id is provided (edit mode)
  useEffect(() => {
    if (vendor_id) {
      setInternalLoading(true);
      fetchVendorById(vendor_id)
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
          toast.error(t("General.error_operation"), {
            description: t("Vendors.messages.error_fetch"),
          });
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [vendor_id, form, t]);

  const handleCompanySubmit = async (data: CompanyFormValues) => {
    try {
      // Check if user ID is available
      if (!user_id) {
        throw new Error(t("error.not_authenticated"));
      }

      const { data: newCompany, error } = await supabase
        .from("companies")
        .insert([
          {
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || null,
            website: data.website?.trim() || null,
            address: data.address?.trim() || null,
            city: data.city?.trim() || null,
            state: data.state?.trim() || null,
            zip_code: data.zipCode?.trim() || null,
            industry: data.industry?.trim() || null,
            size: data.size?.trim() || null,
            notes: data.notes?.trim() || null,
            is_active: data.is_active,
            user_id: user_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Set the new company name as the selected company
      form.setValue("company", newCompany.name);

      // Close the dialog
      setIsCompanyDialogOpen(false);

      // Show success message
      toast.success(t("General.successful_operation"), {
        description: t("Companies.success.created"),
      });
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Companies.error.create"),
      });
    }
  };

  const handleSubmit = (data: VendorFormValues) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    <ComboboxAdd
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={companyOptions.map((opt) => ({ ...opt, value: opt.label }))}
                      isLoading={companiesLoading}
                      defaultValue={field.value}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Vendors.form.company.placeholder"),
                        searchPlaceholder: t("Vendors.form.company.search_placeholder"),
                        noItems: t("Vendors.form.company.no_companies"),
                      }}
                      addText={t("Companies.add_new")}
                      onAddClick={() => setIsCompanyDialogOpen(true)}
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
        </form>
      </Form>

      <FormDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        title={t("Companies.add_new")}
        formId="company-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
      >
        <CompanyForm id="company-form" onSubmit={handleCompanySubmit} loading={loading} />
      </FormDialog>
    </>
  );
}

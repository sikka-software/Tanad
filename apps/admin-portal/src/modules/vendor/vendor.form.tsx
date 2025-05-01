import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import NumberInput from "@/components/ui/number-input";
import PhoneInput from "@/components/ui/phone-input";

import {
  CompanyForm,
  type CompanyFormValues as CompanyFormValuesType,
} from "@/company/company.form";
import { useCompanies } from "@/company/company.hooks";
import type { Company } from "@/company/company.type";

import { useCreateVendor, useUpdateVendor } from "@/vendor/vendor.hooks";
import useVendorStore from "@/vendor/vendor.store";
import type { VendorUpdateData } from "@/vendor/vendor.type";

import useUserStore from "@/stores/use-user-store";

export const createVendorSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().optional(),
    address: z.string().min(1, t("Vendors.form.address.required")),
    city: z.string().min(1, t("Vendors.form.city.required")),
    state: z.string().min(1, t("Vendors.form.state.required")),
    zip_code: z.string().min(5, t("Vendors.form.zip_code.required")),
    notes: z.string().nullable(),
  });

export type VendorFormValues = z.input<ReturnType<typeof createVendorSchema>>;

interface VendorFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: VendorUpdateData | null;
  editMode?: boolean;
}

export function VendorForm({ id, onSuccess, defaultValues, editMode = false }: VendorFormProps) {
  const t = useTranslations();
  const locale = useLocale();

  const { profile, membership } = useUserStore();
  const { mutateAsync: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutateAsync: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const isLoading = useVendorStore((state) => state.isLoading);
  const setIsLoading = useVendorStore((state) => state.setIsLoading);

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
      zip_code: "",
      notes: "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).vendorForm = form;
  }

  // Format companies for ComboboxAdd
  const companyOptions =
    companies?.map((company: Company) => ({
      label: company.name,
      value: company.id,
    })) || [];

  const handleSubmit = async (data: VendorFormValues) => {
    setIsLoading(true);
    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Vendor ID missing in edit mode");
          toast.error(t("Vendors.error.missing_id"));
          setIsLoading(false);
          return;
        }
        // Update vendor logic
        await updateVendor(
          {
            id: defaultValues.id,
            vendor: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone.trim(),
              company: data.company || undefined,
              address: data.address.trim(),
              city: data.city.trim(),
              state: data.state.trim(),
              zip_code: data.zip_code.trim(),
              notes: data.notes?.trim() || null,
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        // Create vendor logic
        await createVendor(
          {
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            company: data.company || undefined,
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip_code: data.zip_code.trim(),
            notes: data.notes?.trim() || null,
            enterprise_id: membership?.enterprise_id || "",
            user_id: profile?.id || "",
            updated_at: new Date().toISOString(),
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save vendor:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Vendors.messages.error_save"),
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          id={id || "vendor-form"}
          onSubmit={form.handleSubmit(handleSubmit)}
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
                      disabled={isLoading}
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
                    <ComboboxAdd
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={companyOptions.map((opt) => ({ ...opt, value: opt.label }))}
                      isLoading={companiesLoading}
                      defaultValue={field.value}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Vendors.form.company.placeholder"),
                        searchPlaceholder: t("Companies.search_companies"),
                        noItems: t("Companies.no_companies_found"),
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
                      dir="ltr"
                      type="email"
                      placeholder={t("Vendors.form.email.placeholder")}
                      {...field}
                      disabled={isLoading}
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
                    <PhoneInput
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                    <NumberInput
                      placeholder={t("Vendors.form.zip_code.placeholder")}
                      {...field}
                      disabled={isLoading}
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
                    disabled={isLoading}
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
        <CompanyForm id="company-form" />
      </FormDialog>
    </>
  );
}

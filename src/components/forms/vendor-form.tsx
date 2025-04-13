import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { CompanyForm, type CompanyFormValues } from "@/components/forms/company-form";
import { Button } from "@/components/ui/button";
import { ComboboxAdd } from "@/components/ui/combobox-add";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/lib/supabase";
import { fetchVendorById } from "@/services/vendorService";

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
  vendorId?: string;
  loading?: boolean;
  userId: string | null;
  onSubmit?: (data: VendorFormValues) => void;
}

export function VendorForm({
  formId,
  vendorId,
  loading: externalLoading = false,
  userId,
  onSubmit,
}: VendorFormProps) {
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

  const handleCompanySubmit = async (data: CompanyFormValues) => {
    try {
      // Check if user ID is available
      if (!userId) {
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
            is_active: data.isActive,
            user_id: userId,
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
      toast.success(t("Companies.success.created"));
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error(t("Companies.error.create"));
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
                      onChange={field.onChange}
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

      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent
          className="flex h-[80vh] max-h-[80vh] flex-col gap-0 overflow-hidden !p-0"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <DialogHeader className="sticky top-0 z-10 border-b p-4">
            <DialogTitle>{t("Companies.add_new")}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <CompanyForm id="company-form" onSubmit={handleCompanySubmit} loading={loading} />
          </div>
          <DialogFooter className="sticky bottom-0 flex justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
              {t("General.cancel")}
            </Button>
            <Button type="submit" form="company-form">
              {t("General.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

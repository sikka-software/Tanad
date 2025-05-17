import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";

import { AddressFormSection } from "@/forms/address-form-section";
import NotesSection from "@/forms/notes-section";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { CompanyForm } from "@/company/company.form";
import { useCompanies } from "@/company/company.hooks";
import type { Company } from "@/company/company.type";

import { useCreateVendor, useUpdateVendor } from "@/vendor/vendor.hooks";
import useVendorStore from "@/vendor/vendor.store";
import type { VendorCreateData, VendorUpdateData } from "@/vendor/vendor.type";

import { vendors } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createVendorSchema = (t: (key: string) => string) => {
  const VendorSelectSchema = createInsertSchema(vendors, {
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().optional(),
    notes: z.any().optional().nullable(),
  });
  return VendorSelectSchema;
};

export type VendorFormValues = z.input<ReturnType<typeof createVendorSchema>>;

export function VendorForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<VendorUpdateData | VendorCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutateAsync: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const isLoading = useVendorStore((state) => state.isLoading);
  const setIsLoading = useVendorStore((state) => state.setIsLoading);

  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(createVendorSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      company: defaultValues?.company || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      notes: getNotesValue(defaultValues),
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).vendorForm = form;
  }

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
            data: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone.trim(),
              company: data.company || undefined,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              notes: data.notes,
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
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            company: data.company || undefined,
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            updated_at: new Date().toISOString(),
            notes: data.notes,
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
        description: t("Vendors.error.create"),
      });
    }
  };

  const companyOptions = useMemo(
    () =>
      companies?.map((company: Company) => ({
        label: company.name,
        value: company.id,
      })) || [],
    [companies],
  );

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
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
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={companyOptions}
                        isLoading={companiesLoading}
                        defaultValue={field.value}
                        onChange={(value) => field.onChange(value || null)}
                        texts={{
                          placeholder: t("Vendors.form.company.placeholder"),
                          searchPlaceholder: t("Pages.Companies.search"),
                          noItems: t("Pages.Companies.no_companies_found"),
                        }}
                        addText={t("Pages.Companies.add")}
                        onAddClick={() => setIsCompanyDialogOpen(true)}
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
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <AddressFormSection
            dir={locale === "ar" ? "rtl" : "ltr"}
            inDialog={editMode}
            title={t("Forms.address.label")}
            control={form.control}
            disabled={isLoading}
          />

          <NotesSection inDialog={editMode} control={form.control} title={t("Forms.notes.label")} />
        </form>
      </Form>

      <FormDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        title={t("Pages.Companies.add")}
        formId="company-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
      >
        <CompanyForm formHtmlId="company-form" nestedForm />
      </FormDialog>
    </>
  );
}

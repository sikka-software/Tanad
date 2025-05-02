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

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import PhoneInput from "@/components/ui/phone-input";

import { useCreateClient, useUpdateClient } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";
import { ClientUpdateData } from "@/client/client.type";

import { CompanyForm } from "@/company/company.form";
import { useCompanies } from "@/company/company.hooks";

import useUserStore from "@/stores/use-user-store";

export const createClientSchema = (t: (key: string) => string) => {
  const baseClientSchema = z.object({
    name: z.string().min(1, t("Clients.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Clients.form.validation.email_required"))
      .email(t("Clients.form.validation.email_invalid")),
    phone: z.string().min(1, t("Clients.form.validation.phone_required")),
    company: z.string().nullish(),
    notes: z.string().optional(),
  });

  const addressSchema = createAddressSchema(t);

  return baseClientSchema.merge(addressSchema);
};

export type ClientFormValues = z.input<ReturnType<typeof createClientSchema>>;

interface ClientFormProps {
  id?: string;
  onSuccess?: () => void;
  loading?: boolean;
  defaultValues?: ClientUpdateData | null;
  editMode?: boolean;
}

export function ClientForm({
  id,
  onSuccess,
  loading = false,
  defaultValues,
  editMode = false,
}: ClientFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { profile, membership } = useUserStore();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { mutateAsync: createClient, isPending: isCreating } = useCreateClient();
  const { mutateAsync: updateClient, isPending: isUpdating } = useUpdateClient();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  const isLoading = useClientStore((state) => state.isLoading);
  const setIsLoading = useClientStore((state) => state.setIsLoading);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      company: defaultValues?.company || undefined,
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      notes: defaultValues?.notes || "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).clientForm = form;
  }

  // Format companies for ComboboxAdd
  const companyOptions =
    companies?.map((company) => ({
      label: company.name,
      value: company.id,
    })) || [];

  const handleSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        await updateClient(
          {
            id: defaultValues.id,
            client: {
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
        await createClient(
          {
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
            notes: data.notes?.trim() || null,
            enterprise_id: membership?.enterprise_id || "",
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: t("Companies.error.creating"),
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form id={id || "client-form"} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Clients.form.name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Clients.form.name.placeholder")}
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
                    <FormLabel>{t("Clients.form.company.label")}</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        direction={locale === "ar" ? "rtl" : "ltr"}
                        data={companyOptions}
                        isLoading={companiesLoading}
                        defaultValue={field.value || ""}
                        onChange={(value) => field.onChange(value || null)}
                        texts={{
                          placeholder: t("Clients.form.company.placeholder"),
                          searchPlaceholder: t("Clients.form.company.search_placeholder"),
                          noItems: t("Clients.form.company.no_companies"),
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Clients.form.email.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("Clients.form.email.placeholder")}
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
                    <FormLabel>{t("Clients.form.phone.label")} *</FormLabel>
                    <FormControl>
                      <PhoneInput value={field.value || ""} onChange={field.onChange} />
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
                  <FormLabel>{t("Clients.form.notes.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Clients.form.notes.placeholder")}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <AddressFormSection
            title={t("Clients.form.address.label")}
            control={form.control}
            isLoading={isLoading}
          />
        </form>
      </Form>

      <FormDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        title={t("Companies.add_new")}
        formId="company-form"
      >
        <CompanyForm id="company-form" onSuccess={() => setIsCompanyDialogOpen(false)} />
      </FormDialog>
    </>
  );
}

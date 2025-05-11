import { zodResolver } from "@hookform/resolvers/zod";
import { CommandSelect } from "@root/src/components/ui/command-select";
import { getNotesValue } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import NotesSection from "@/components/forms/notes-section";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps, CommonStatus } from "@/types/common.type";

import { useCreateClient, useUpdateClient } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";
import { ClientCreateData, ClientUpdateData } from "@/client/client.type";

import { CompanyForm } from "@/company/company.form";
import { useCompanies } from "@/company/company.hooks";

import useUserStore from "@/stores/use-user-store";

import useCompanyStore from "../company/company.store";

export const createClientSchema = (t: (key: string) => string) => {
  const baseClientSchema = z.object({
    name: z.string().min(1, t("Clients.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Clients.form.validation.email_required"))
      .email(t("Clients.form.validation.email_invalid")),
    phone: z.string().min(1, t("Clients.form.validation.phone_required")),
    company: z.string().nullish(),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("Clients.form.status.required"),
    }),
    notes: z.any().optional().nullable(),
  });

  const addressSchema = createAddressSchema(t);

  return baseClientSchema.merge(addressSchema);
};

export type ClientFormValues = z.input<ReturnType<typeof createClientSchema>>;

export function ClientForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode = false,
  nestedForm,
}: ModuleFormProps<ClientCreateData | ClientUpdateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const { user, membership } = useUserStore();
  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient();

  const isLoading = useClientStore((state) => state.isLoading);
  const setIsLoading = useClientStore((state) => state.setIsLoading);

  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const setIsCompanySaving = useCompanyStore((state) => state.setIsLoading);
  const isCompanySaving = useCompanyStore((state) => state.isLoading);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      company:
        typeof defaultValues?.company === "object"
          ? (defaultValues.company as any)?.id || null
          : defaultValues?.company || null,
      short_address:
        typeof defaultValues?.short_address === "string" ? defaultValues.short_address : "",
      building_number:
        typeof defaultValues?.building_number === "string" ? defaultValues.building_number : "",
      street_name: typeof defaultValues?.street_name === "string" ? defaultValues.street_name : "",
      city: typeof defaultValues?.city === "string" ? defaultValues.city : "",
      region: typeof defaultValues?.region === "string" ? defaultValues.region : "",
      country: typeof defaultValues?.country === "string" ? defaultValues.country : "",
      zip_code: typeof defaultValues?.zip_code === "string" ? defaultValues.zip_code : "",
      notes: getNotesValue(defaultValues) || "",
      status: defaultValues?.status || "active",
    },
  });

  const handleSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        await updateClient(
          {
            id: defaultValues.id || "",
            client: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone.trim(),
              company: data.company || null,
              short_address:
                typeof data.short_address === "string" ? data.short_address.trim() : null,
              building_number:
                typeof data.building_number === "string" ? data.building_number.trim() : null,
              street_name: typeof data.street_name === "string" ? data.street_name.trim() : null,
              city: typeof data.city === "string" ? data.city.trim() : null,
              region: typeof data.region === "string" ? data.region.trim() : null,
              country: typeof data.country === "string" ? data.country.trim() : null,
              zip_code: typeof data.zip_code === "string" ? data.zip_code.trim() : null,
              status: data.status,
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
        await createClient(
          {
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            company: data.company || null,
            short_address:
              typeof data.short_address === "string" ? data.short_address.trim() : null,
            building_number:
              typeof data.building_number === "string" ? data.building_number.trim() : null,
            street_name: typeof data.street_name === "string" ? data.street_name.trim() : null,
            city: typeof data.city === "string" ? data.city.trim() : null,
            region: typeof data.region === "string" ? data.region.trim() : null,
            country: typeof data.country === "string" ? data.country.trim() : null,
            zip_code: typeof data.zip_code === "string" ? data.zip_code.trim() : null,
            status: data.status,
            notes: data.notes,
            additional_number: null,
            user_id: user?.id || "",
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
      console.error("Failed to save client:", error);
      toast.error(t("General.error_operation"), {
        description: t("Clients.error.create"),
      });
    }
  };

  const companyOptions =
    companies?.map((company) => ({
      label: company.name,
      value: company.id,
    })) || [];

  if (typeof window !== "undefined") {
    (window as any).clientForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId || "client-form"} onSubmit={form.handleSubmit(handleSubmit)}>
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
                        disabled={isLoading}
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
                    <FormLabel>{t("Clients.form.email.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        dir="ltr"
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
                      <PhoneInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        ariaInvalid={form.formState.errors.phone !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Clients.form.company.label")}</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={companyOptions}
                        isLoading={companiesLoading}
                        defaultValue={field.value || ""}
                        onChange={(value) => field.onChange(value || null)}
                        texts={{
                          placeholder: t("Clients.form.company.placeholder"),
                          searchPlaceholder: t("Pages.Companies.search"),
                          noItems: t("Clients.form.company.no_companies"),
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Clients.form.status.label")}</FormLabel>
                    <FormControl>
                      <CommandSelect
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={[
                          { label: t("Clients.form.status.active"), value: "active" },
                          { label: t("Clients.form.status.inactive"), value: "inactive" },
                        ]}
                        isLoading={false}
                        defaultValue={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value || null);
                        }}
                        texts={{
                          placeholder: t("Clients.form.status.placeholder"),
                        }}
                        renderOption={(item) => {
                          return <div>{item.label}</div>;
                        }}
                        // ariaInvalid={!!form.formState.errors.manager}
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
            inDialog={editMode || nestedForm}
            title={t("Clients.form.address.label")}
            control={form.control}
            isLoading={isLoading}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Clients.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        title={t("Pages.Companies.add")}
        formId="company-form"
        loadingSave={isCompanySaving}
      >
        <CompanyForm
          nestedForm
          formHtmlId="company-form"
          onSuccess={() => {
            setIsCompanyDialogOpen(false);
            setIsCompanySaving(false);
          }}
        />
      </FormDialog>
    </>
  );
}

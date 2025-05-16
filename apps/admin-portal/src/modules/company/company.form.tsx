import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { DocumentFile } from "@/ui/documents-uploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import PrefixedInput from "@/ui/prefixed-input";

import NotesSection from "@/components/forms/notes-section";
import DigitsInput from "@/components/ui/inputs/digits-input";
import { Input } from "@/components/ui/inputs/input";
import PhoneInput from "@/components/ui/inputs/phone-input";

import { AddressFormSection } from "@/forms/address-form-section";

import { getNotesValue } from "@/lib/utils";

import { uploadDocument } from "@/services/documents";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useCreateCompany, useUpdateCompany } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";
import { CompanyCreateData, CompanyUpdateData } from "@/company/company.type";

import { companies } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createCompanySchema = (t: (key: string) => string) => {
  const CompanySelectSchema = createInsertSchema(companies, {
    name: z.string().min(1, t("Companies.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Companies.form.validation.email_required"))
      .email(t("Companies.form.validation.email_invalid")),
    phone: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("Companies.form.status.required"),
    }),
    notes: z.any().optional().nullable(),
    vat_number: z.string().optional(),
  });
  return CompanySelectSchema;
};

export type CompanyFormValues = z.input<ReturnType<typeof createCompanySchema>>;

export function CompanyForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<CompanyUpdateData | CompanyCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createCompany } = useCreateCompany();
  const { mutateAsync: updateCompany } = useUpdateCompany();
  const [pendingDocuments, setPendingDocuments] = useState<DocumentFile[]>([]);

  const isLoading = useCompanyStore((state) => state.isLoading);
  const setIsLoading = useCompanyStore((state) => state.setIsLoading);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(createCompanySchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      website: defaultValues?.website || "",
      industry: defaultValues?.industry || "",
      size: defaultValues?.size || "",
      status: defaultValues?.status || "active",
      short_address: defaultValues?.short_address || "",
      additional_number: defaultValues?.additional_number || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      notes: getNotesValue(defaultValues) || "",
      vat_number: defaultValues?.vat_number || "",
    },
  });

  const uploadDocuments = async (companyId: string) => {
    if (!pendingDocuments.length) return;

    const toastId = toast.loading(t("Documents.uploading"), {
      description: `0/${pendingDocuments.length} ${t("Documents.files_uploaded")}`,
    });

    try {
      let uploadedCount = 0;
      for (const doc of pendingDocuments) {
        await uploadDocument({
          ...doc,
          entity_id: companyId,
          entity_type: "company",
        });
        uploadedCount++;
        toast.loading(t("Documents.uploading"), {
          id: toastId,
          description: `${uploadedCount}/${pendingDocuments.length} ${t("Documents.files_uploaded")}`,
        });
      }
      toast.success(t("Documents.upload_complete"), { id: toastId });
      setPendingDocuments([]);
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error(t("Documents.upload_error"), {
        id: toastId,
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleSubmit = async (data: CompanyFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Company ID missing in edit mode");
          toast.error(t("Companies.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateCompany(
          {
            id: defaultValues.id,
            data: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone?.trim() || undefined,
              website: data.website?.trim() || undefined,
              industry: data.industry?.trim() || undefined,
              size: data.size?.trim() || undefined,
              notes: data.notes ?? null,
              status: data.status as "active" | "inactive" | "draft" | "archived" | null,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              additional_number: data.additional_number?.trim() || undefined,
              vat_number: data.vat_number?.trim() || undefined,
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
        await createCompany(
          {
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || undefined,
            website: data.website?.trim() || undefined,
            industry: data.industry?.trim() || undefined,
            size: data.size?.trim() || undefined,
            notes: data.notes ?? null,
            status: data.status as "active" | "inactive" | "draft" | "archived" | null,
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            additional_number: data.additional_number?.trim() || undefined,
            vat_number: data.vat_number?.trim() || undefined,
          },
          {
            onSuccess: async (response) => {
              if (response?.id) {
                await uploadDocuments(response.id);
              }
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
        description: t("Companies.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).companyForm = form;
  }

  return (
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
                  <FormLabel>{t("Companies.form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
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
                      dir="ltr"
                      disabled={isLoading}
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
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Companies.form.website.label")}</FormLabel>
                  <FormControl>
                    <Input
                      dir="ltr"
                      disabled={isLoading}
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
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Companies.form.industry.label")}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
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
                    <PrefixedInput
                      type="number"
                      prefix={t("Companies.form.size.prefix")}
                      disabled={isLoading}
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
            name="vat_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.vat_number.label")}</FormLabel>
                <FormControl>
                  <DigitsInput
                    disabled={isLoading}
                    placeholder={t("Companies.form.vat_number.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressFormSection
          dir={locale === "ar" ? "rtl" : "ltr"}
          inDialog={editMode || nestedForm}
          title={t("Companies.form.address.label")}
          control={form.control}
          disabled={isLoading}
        />

        <NotesSection
          inDialog={editMode || nestedForm}
          control={form.control}
          title={t("Companies.form.notes.label")}
        />
      </form>
    </Form>
  );
}

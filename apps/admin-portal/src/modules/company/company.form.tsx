import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { DocumentFile } from "@/ui/documents-uploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import PhoneInput from "@/components/ui/phone-input";

import { uploadDocument } from "@/services/documents";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateCompany, useUpdateCompany } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";
import { Company } from "@/company/company.type";

import useUserStore from "@/stores/use-user-store";

export const createCompanySchema = (t: (key: string) => string) => {
  const baseCompanySchema = z.object({
    name: z.string().min(1, t("Companies.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Companies.form.validation.email_required"))
      .email(t("Companies.form.validation.email_invalid")),
    phone: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    notes: z.string().optional(),
    is_active: z.boolean().default(true),
  });

  const addressSchema = createAddressSchema(t);

  return baseCompanySchema.merge(addressSchema);
};

export type CompanyFormValues = z.input<ReturnType<typeof createCompanySchema>>;

export function CompanyForm({
  id,
  onSuccess,
  defaultValues,
  editMode = false,
}: ModuleFormProps<Company>) {
  const t = useTranslations();
  const { profile, membership } = useUserStore();
  const { mutateAsync: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutateAsync: updateCompany, isPending: isUpdating } = useUpdateCompany();
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
      notes: defaultValues?.notes || "",
      is_active: defaultValues?.is_active || true,
      short_address: defaultValues?.short_address || "",
      additional_number: defaultValues?.additional_number || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
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
    if (!profile?.id) {
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
            company: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone?.trim() || undefined,
              website: data.website?.trim() || undefined,
              industry: data.industry?.trim() || undefined,
              size: data.size?.trim() || undefined,
              notes: data.notes?.trim() || undefined,
              is_active: data.is_active ?? true,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              additional_number: data.additional_number?.trim() || undefined,
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
            enterprise_id: membership?.enterprise_id || "",
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || undefined,
            website: data.website?.trim() || undefined,
            industry: data.industry?.trim() || undefined,
            size: data.size?.trim() || undefined,
            notes: data.notes?.trim() || undefined,
            is_active: data.is_active ?? true,
            user_id: profile?.id || "",
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            additional_number: data.additional_number?.trim() || undefined,
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
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <PhoneInput value={field.value || ""} onChange={field.onChange} />
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
                    <Input
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder={t("Companies.form.notes.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressFormSection
          title={t("Companies.form.address.label")}
          control={form.control}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
}

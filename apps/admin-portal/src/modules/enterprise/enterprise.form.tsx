import { zodResolver } from "@hookform/resolvers/zod";
// import { createInsertSchema } from "drizzle-zod"; // Will use this once enterprises schema is defined
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/inputs/input";
// import { Label } from "@/ui/label"; // This can be removed if using FormLabel everywhere
import { Textarea } from "@/ui/textarea";

import { createClient } from "@/utils/supabase/component";

import CountryInput from "@/components/ui/inputs/country-input";

// import { useCreateEnterprise, useUpdateEnterprise } from "@/enterprise/enterprise.hooks"; // You will need to create these
// import useEnterpriseStore from "@/enterprise/enterprise.store"; // You will need to create this

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateEnterprise, useUpdateEnterprise } from "./enterprise.hooks";
import useEnterpriseStore from "./enterprise.store";
import { EnterpriseCreateData, EnterpriseUpdateData } from "./enterprise.type";

// Uncommented

// Manually define the schema until `enterprises` is in `db/schema.ts`
export const createEnterpriseSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string().optional(), // Keep id for edit mode
    user_id: z.string().optional(), // Added from CarForm example
    enterprise_id: z.string().optional(), // Added from CarForm example
    name: z.string().min(1, { message: t("Enterprise.form.name.required") }),
    industry: z.string().optional(),
    founded: z.coerce.number().int().positive().optional(), // Changed to number, ensure it makes sense for your db
    employees: z.string().optional(), // Consider z.number() if appropriate
    website: z
      .string()
      .url({ message: t("Enterprise.form.website.invalid") })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email({ message: t("Enterprise.form.email.invalid") })
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    logo: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    registration_country: z.string().optional(),
    registration_number: z.string().optional(),
    vat_enabled: z.boolean().optional().default(false),
    vat_number: z.string().optional(),
  });

export type EnterpriseFormValues = z.input<ReturnType<typeof createEnterpriseSchema>>;

export const EnterpriseForm: React.FC<
  ModuleFormProps<EnterpriseFormValues> & { readOnly?: boolean }
> = ({ formHtmlId, onSuccess, defaultValues, readOnly = false, editMode }) => {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const enterpriseStoreContext = useUserStore((state) => state.enterprise); // Renamed to avoid conflict with enterprise store

  const { mutateAsync: createEnterprise } = useCreateEnterprise();
  const { mutateAsync: updateEnterprise } = useUpdateEnterprise();

  const isLoading = useEnterpriseStore((state) => state.isLoading);
  const setIsLoading = useEnterpriseStore((state) => state.setIsLoading);

  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(createEnterpriseSchema(t)),
    defaultValues: {
      id: defaultValues?.id,
      user_id: defaultValues?.user_id || user?.id,
      enterprise_id: defaultValues?.enterprise_id || enterpriseStoreContext?.id, // Use renamed context store
      name: defaultValues?.name || "",
      industry: defaultValues?.industry || "",
      founded: defaultValues?.founded ? Number(defaultValues.founded) : undefined,
      employees: defaultValues?.employees || "",
      website: defaultValues?.website || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      logo: defaultValues?.logo || "",
      address: defaultValues?.address || "",
      description: defaultValues?.description || "",
      registration_country: defaultValues?.registration_country || "",
      registration_number: defaultValues?.registration_number || "",
      vat_enabled: defaultValues?.vat_enabled || false,
      vat_number: defaultValues?.vat_number || "",
    },
  });
  const [uploading, setUploading] = useState(false);

  const logoPath = form.watch("logo");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    async function getSignedUrl() {
      if (logoPath) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("enterprise-images")
          .createSignedUrl(logoPath, 60 * 60);
        if (data?.signedUrl) {
          setLogoPreviewUrl(data.signedUrl);
        } else {
          setLogoPreviewUrl(null);
          if (error) console.warn("Error fetching signed URL for logo:", error.message);
        }
      } else {
        setLogoPreviewUrl(null);
      }
    }
    getSignedUrl();
  }, [logoPath]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const enterpriseIdForPath = defaultValues?.id || enterpriseStoreContext?.id || "temp-id";
      const fileExt = file.name.split(".").pop();
      const fileName = `logos/${enterpriseIdForPath}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("enterprise-images")
        .upload(fileName, file);
      if (error) throw error;
      form.setValue("logo", fileName, { shouldValidate: true });
    } catch (err: any) {
      console.error("Failed to upload logo:", err);
      toast.error(t("Enterprise.form.logo.upload_failed"), { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const enterpriseTableKeys = [
    "id",
    "name",
    "email",
    "industry",
    "founded",
    "registration_country",
    "registration_number",
    "vat_enabled",
    "vat_number",
    "size",
    "logo",
    "address",
    "description",
    // Omitting created_at as it's usually set by the DB
    // Omitting user_id, enterprise_id from this list as they are not direct enterprise table columns
  ] as const;

  // Pick only the keys relevant to the database schema for submission
  const pickRelevantKeys = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    for (const key of enterpriseTableKeys) {
      if (key in obj && obj[key] !== undefined) {
        // Handle empty strings for optional fields: convert to null if necessary
        // For now, let's assume Zod/Drizzle handles undefined correctly for optionals
        // and empty strings are valid if the column type allows.
        if (key === "email" && obj[key] === "") {
          newObj[key] = null; // Explicitly set empty email to null
        } else if (key === "founded") {
          // Assuming Zod coercion has already turned it into number | undefined
          // If it's undefined (e.g. from empty input), it will be omitted by `key in obj && obj[key] !== undefined`
          // If it's a number, it will be included.
          // If it needs to be null for empty string, Zod transform/preprocess is better.
          newObj[key] = obj[key];
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    return newObj;
  };

  const handleSubmitForm = async (data: EnterpriseFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }

    const rawSubmissionData: EnterpriseFormValues = {
      ...data,
      // id is already part of 'data' if in editMode due to defaultValues
      // user_id and enterprise_id are in 'data' if they were in defaultValues or set by form
    };

    try {
      if (editMode && defaultValues?.id) {
        const updateData = pickRelevantKeys(rawSubmissionData) as EnterpriseUpdateData;
        await updateEnterprise({ id: defaultValues.id, data: updateData });
        toast.success(t("Enterprise.form.update_success"));
        onSuccess?.();
      } else {
        const { id, ...formDataForCreate } = rawSubmissionData; // id might be present from form state, remove for create
        const createDataPayload = pickRelevantKeys(formDataForCreate) as EnterpriseCreateData;
        await createEnterprise(createDataPayload);
        toast.success(t("Enterprise.form.create_success"));
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(t("General.form_submission_error"), {
        description: error.message || t("General.unknown_error"),
      });
      console.error("Failed to save enterprise:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "enterprise-form"}
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-4"
      >
        <input hidden type="text" {...form.register("user_id")} />
        <input hidden type="text" {...form.register("enterprise_id")} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.name.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.name.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
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
                <FormLabel>{t("Enterprise.form.industry.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.industry.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="founded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.founded.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.founded.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.employees.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.employees.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
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
                <FormLabel>{t("Enterprise.form.website.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.website.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
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
                <FormLabel>{t("Enterprise.form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.email.placeholder")}
                    type="email"
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
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
                <FormLabel>{t("Enterprise.form.phone.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.phone.placeholder")}
                    {...field}
                    readOnly={readOnly}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.logo.label")}</FormLabel>
                <FormControl>
                  <>
                    {logoPreviewUrl && (
                      <img
                        src={logoPreviewUrl}
                        alt={t("Enterprise.form.logo.alt")}
                        className="mb-2 h-16 w-16 rounded-md border object-contain"
                      />
                    )}
                    <Input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      readOnly={readOnly}
                      disabled={isLoading || uploading}
                      className="mb-2"
                    />
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Input
                      type="text"
                      className="hidden"
                      readOnly
                      {...field}
                      value={field.value ?? ""}
                    />
                  </>
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
              <FormLabel>{t("Enterprise.form.address.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Enterprise.form.address.placeholder")}
                  {...field}
                  readOnly={readOnly}
                  disabled={isLoading || uploading}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Enterprise.form.description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Enterprise.form.description.placeholder")}
                  {...field}
                  rows={4}
                  readOnly={readOnly}
                  disabled={isLoading || uploading}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="registration_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.registration_country.label")}</FormLabel>
                <FormControl>
                  <CountryInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isLoading || uploading}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    texts={{
                      placeholder: t("Forms.country.placeholder"),
                      searchPlaceholder: t("Forms.country.search_placeholder"),
                      noItems: t("Forms.country.no_items"),
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.registration_number.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.registration_number.placeholder")}
                    {...field}
                    disabled={isLoading || uploading}
                    value={field.value ?? ""}
                    readOnly={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vat_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("Enterprise.form.vat_enabled.label")}
                </FormLabel>
                <p className="text-muted-foreground text-sm">
                  {t("Enterprise.form.vat_enabled.description")}
                </p>
              </div>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("vat_enabled") && (
          <FormField
            control={form.control}
            name="vat_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Enterprise.form.vat_number.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enterprise.form.vat_number.placeholder")}
                    {...field}
                    disabled={isLoading || uploading || !form.watch("vat_enabled")}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
};

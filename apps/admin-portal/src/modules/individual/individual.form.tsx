import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";

import { AddressFormSection } from "@/components/forms/address-form-section";
import NotesSection from "@/components/forms/notes-section";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps, CommonStatus } from "@/types/common.type";

import { CompanyForm } from "@/company/company.form";
import { useCompanies } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";

import { individuals } from "@/db/schema";
import { useCreateIndividual, useUpdateIndividual } from "@/individual/individual.hooks";
import useIndividualStore from "@/individual/individual.store";
import { IndividualCreateData, IndividualUpdateData } from "@/individual/individual.type";
import useUserStore from "@/stores/use-user-store";

const createIndividualSchema = (t: (key: string) => string) => {
  const IndividualSelectSchema = createInsertSchema(individuals, {
    name: z.string().min(1, t("Individuals.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Individuals.form.validation.email_required"))
      .email(t("Individuals.form.validation.email_invalid")),
    phone: z.string().min(1, t("Individuals.form.validation.phone_required")),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("Individuals.form.status.required"),
    }),
    notes: z.any().optional().nullable(),
  });
  return IndividualSelectSchema;
};

type IndividualFormValues = z.input<ReturnType<typeof createIndividualSchema>>;

export default function IndividualForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode = false,
  nestedForm,
}: ModuleFormProps<IndividualCreateData | IndividualUpdateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createIndividual } = useCreateIndividual();
  const { mutateAsync: updateIndividual } = useUpdateIndividual();

  const isSavingIndividual = useIndividualStore((state) => state.isLoading);
  const setIsSavingIndividual = useIndividualStore((state) => state.setIsLoading);

  const { data: companies, isLoading: isFetchingCompanies } = useCompanies();

  const setIsCompanySaving = useCompanyStore((state) => state.setIsLoading);
  const isCompanySaving = useCompanyStore((state) => state.isLoading);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  const form = useForm<IndividualFormValues>({
    resolver: zodResolver(createIndividualSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
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

  const handleSubmit = async (data: IndividualFormValues) => {
    setIsSavingIndividual(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        await updateIndividual(
          {
            id: defaultValues.id || "",
            data: {
              name: data.name.trim(),
              email: data.email.trim(),
              phone: data.phone.trim(),
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
              user_id: user?.id || "",
              enterprise_id: enterprise?.id || "",
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
        await createIndividual(
          {
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",

            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
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
      setIsSavingIndividual(false);
      console.error("Failed to save individual:", error);
      toast.error(t("General.error_operation"), {
        description: t("Individuals.error.create"),
      });
    }
  };

  const companyOptions = useMemo(
    () =>
      companies?.map((company) => ({
        label: company.name,
        value: company.id,
        email: company.email,
        website: company.website,
      })) || [],
    [companies],
  );

  if (typeof window !== "undefined") {
    (window as any).individualForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form
          id={formHtmlId || "individual-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Individuals.form.status.label")}</FormLabel>
                    <FormControl>
                      <BooleanTabs
                        disabled={isSavingIndividual}
                        trueText={t("Individuals.form.status.active")}
                        falseText={t("Individuals.form.status.inactive")}
                        value={field.value === "active"}
                        onValueChange={(newValue) => {
                          field.onChange(newValue ? "active" : "inactive");
                        }}
                        listClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Individuals.form.name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Individuals.form.name.placeholder")}
                        {...field}
                        disabled={isSavingIndividual}
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
                    <FormLabel>{t("Individuals.form.email.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        dir="ltr"
                        placeholder={t("Individuals.form.email.placeholder")}
                        disabled={isSavingIndividual}
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
                    <FormLabel>{t("Individuals.form.phone.label")} *</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isSavingIndividual}
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
            title={t("Individuals.form.address.label")}
            control={form.control}
            disabled={isSavingIndividual}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Individuals.form.notes.label")}
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { CompanyForm, type CompanyFormValues } from "@/components/forms/company-form";
import { Button } from "@/components/ui/button";
import { ComboboxAdd } from "@/components/ui/combobox-add";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

import { FormDialog } from "../ui/form-dialog";

// We'll create a schema factory to handle translations
export const createClientSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Clients.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Clients.form.validation.email_required"))
      .email(t("Clients.form.validation.email_invalid")),
    phone: z.string().min(1, t("Clients.form.validation.phone_required")),
    company: z.string().optional(),
    address: z.string().min(1, t("Clients.form.validation.address_required")),
    city: z.string().min(1, t("Clients.form.validation.city_required")),
    state: z.string().min(1, t("Clients.form.validation.state_required")),
    zip_code: z.string().min(1, t("Clients.form.validation.zip_code_required")),
    notes: z.string().optional(),
  });

export type ClientFormValues = z.input<ReturnType<typeof createClientSchema>>;

interface ClientFormProps {
  id?: string;
  onSubmit: (data: ClientFormValues) => Promise<void>;
  loading?: boolean;
  userId: string | null;
  defaultValues?: Partial<ClientFormValues>;
}

export function ClientForm({
  id,
  onSubmit,
  loading = false,
  userId,
  defaultValues,
}: ClientFormProps) {
  const t = useTranslations();
  const { locale } = useRouter();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema(t)),
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
      ...defaultValues,
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

      // Set the new company as the selected company
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

  return (
    <>
      <Form {...form}>
        <form id={id || "client-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      defaultValue={field.value}
                      onChange={field.onChange}
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
                    <Input
                      type="tel"
                      placeholder={t("Clients.form.phone.placeholder")}
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Clients.form.address.label")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("Clients.form.address.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Clients.form.city.label")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Clients.form.city.placeholder")} {...field} />
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
                  <FormLabel>{t("Clients.form.state.label")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Clients.form.state.placeholder")} {...field} />
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
                  <FormLabel>{t("Clients.form.zip_code.label")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Clients.form.zip_code.placeholder")} {...field} />
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
                  <Textarea placeholder={t("Clients.form.notes.placeholder")} rows={4} {...field} />
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
        <CompanyForm id="company-form" onSubmit={handleCompanySubmit} />
      </FormDialog>
    </>
  );
}

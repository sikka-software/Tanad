import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "@root/src/components/ui/currency-input";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import CodeInput from "@/components/ui/code-input";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useDomains, useCreateDomain, useUpdateDomain } from "./domain.hooks";
import useDomainStore from "./domain.store";
import { Domain, DomainUpdateData, DomainCreateData } from "./domain.type";

export const createDomainSchema = (t: (key: string) => string) => {
  const baseDomainSchema = z.object({
    domain_name: z.string().min(1, t("Domains.form.domain_name.required")),
    registrar: z.string().optional().or(z.literal("")),
    monthly_cost: z.number().optional().or(z.literal("")),
    annual_cost: z.number().optional().or(z.literal("")),
    payment_cycle: z.string().min(1, t("Domains.form.payment_cycle.required")),
    notes: z.string().optional().or(z.literal("")),
    status: z.string().min(1, t("Domains.form.status.required")),
  });

  return baseDomainSchema;
};

export type DomainFormValues = z.input<ReturnType<typeof createDomainSchema>>;

export interface DomainFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: DomainUpdateData | null;
  editMode?: boolean;
}

export function DomainForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<DomainUpdateData | DomainCreateData>) {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const membership = useUserStore((state) => state.membership);

  const { mutate: createDomain } = useCreateDomain();
  const { mutate: updateDomain } = useUpdateDomain();

  const isLoading = useDomainStore((state) => state.isLoading);
  const setIsLoading = useDomainStore((state) => state.setIsLoading);

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(createDomainSchema(t)),
    defaultValues: {
      domain_name: defaultValues?.domain_name || "",
      registrar: defaultValues?.registrar || "",
      monthly_cost: defaultValues?.monthly_cost || 0,
      annual_cost: defaultValues?.annual_cost || 0,
      payment_cycle: defaultValues?.payment_cycle || "monthly",
      status: defaultValues?.status || "active",
      notes: defaultValues?.notes || "",
    },
  });

  const handleSubmit = async (data: DomainFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateDomain(
          {
            id: defaultValues?.id || "",
            data: {
              domain_name: data.domain_name.trim(),
              registrar: data.registrar?.trim() || "",
              monthly_cost: data.monthly_cost || 0,
              annual_cost: data.annual_cost || 0,
              payment_cycle: data.payment_cycle?.trim() as "monthly" | "annual" | null,
              status: data.status?.trim() as "active" | "inactive" | null,
              notes: data.notes?.trim() || null,
            },
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        await createDomain(
          {
            domain_name: data.domain_name.trim(),
            registrar: data.registrar?.trim() || null,
            monthly_cost: data.monthly_cost || 0,
            annual_cost: data.annual_cost || 0,
            payment_cycle: data.payment_cycle?.trim() as "monthly" | "annual" | null,
            status: data.status?.trim() as "active" | "inactive" | null,
            notes: data.notes?.trim() || null,
            user_id: user?.id,
            updated_at: new Date().toISOString(),
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
      console.error("Failed to save domain:", error);
      toast.error(t("General.error_operation"), {
        description: t("Domains.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).domainForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="domain_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.domain_name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Domains.form.domain_name.placeholder")}
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
              name="registrar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.registrar.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Domains.form.registrar.placeholder")}
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
              name="monthly_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.monthly_cost.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={t("Domains.form.monthly_cost.placeholder")}
                      disabled={isLoading}
                      {...field}
                      showCommas={true}
                      value={field.value ? parseFloat(String(field.value)) : undefined}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annual_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.annual_cost.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder={t("Domains.form.annual_cost.placeholder")}
                      disabled={isLoading}
                      {...field}
                      showCommas={true}
                      value={field.value ? parseFloat(String(field.value)) : undefined}
                      onChange={(value) => field.onChange(value)}
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
              name="payment_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Domains.form.payment_cycle.label")}</FormLabel>
                  <FormControl>
                    <Select dir={lang === "ar" ? "rtl" : "ltr"}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Domains.form.payment_cycle.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("Domains.form.payment_cycle.monthly")}
                        </SelectItem>
                        <SelectItem value="annual">
                          {t("Domains.form.payment_cycle.annual")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>{t("Domains.form.status.label")}</FormLabel>
                  <FormControl>
                    <Select dir={lang === "ar" ? "rtl" : "ltr"} {...field} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Domains.form.status.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t("Domains.form.status.active")}</SelectItem>
                        <SelectItem value="inactive">
                          {t("Domains.form.status.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                <FormLabel>{t("Domains.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Domains.form.notes.placeholder")}
                    className="min-h-[120px]"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

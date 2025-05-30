import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/forms/notes-section";

import { getNotesValue } from "@/lib/utils";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { domains } from "@/db/schema";
import { useCreateDomain, useUpdateDomain } from "@/domain/domain.hooks";
import useDomainStore from "@/domain/domain.store";
import { DomainUpdateData, DomainCreateData } from "@/domain/domain.type";
import useUserStore from "@/stores/use-user-store";

const createDomainSchema = (t: (key: string) => string) => {
  const DomainSelectSchema = createInsertSchema(domains, {
    domain_name: z.string().min(1, t("Domains.form.domain_name.required")),
    registrar: z.string().optional().or(z.literal("")),
    monthly_payment: z.number().optional().or(z.literal("")),
    annual_payment: z.number().optional().or(z.literal("")),
    payment_cycle: z.string().min(1, t("PaymentCycles.required")),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("CommonStatus.required"),
    }),
    notes: z.any().optional().nullable(),
  });
  return DomainSelectSchema;
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
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutate: createDomain } = useCreateDomain();
  const { mutate: updateDomain } = useUpdateDomain();

  const isLoading = useDomainStore((state) => state.isLoading);
  const setIsLoading = useDomainStore((state) => state.setIsLoading);

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(createDomainSchema(t)),
    defaultValues: {
      domain_name: defaultValues?.domain_name || "",
      registrar: defaultValues?.registrar || "",
      monthly_payment: defaultValues?.monthly_payment || 0,
      annual_payment: defaultValues?.annual_payment || 0,
      payment_cycle: defaultValues?.payment_cycle || "monthly",
      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues) || "",
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
              monthly_payment: data.monthly_payment || 0,
              annual_payment: data.annual_payment || 0,
              payment_cycle: data.payment_cycle?.trim() as "monthly" | "annual" | null,
              status: data.status?.trim() as "active" | "inactive" | null,
              notes: data.notes,
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
            user_id: user?.id,
            enterprise_id: enterprise?.id || "",
            updated_at: new Date().toISOString(),

            domain_name: data.domain_name.trim(),
            registrar: data.registrar?.trim() || null,
            monthly_payment: data.monthly_payment || 0,
            annual_payment: data.annual_payment || 0,
            payment_cycle: data.payment_cycle?.trim() as "monthly" | "annual" | null,
            status: data.status?.trim() as "active" | "inactive" | null,
            notes: data.notes,
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
      <form
        id={formHtmlId || "domain-form"}
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

            <FormField
              control={form.control}
              name="payment_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PaymentCycles.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("PaymentCycles.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">{t("PaymentCycles.monthly")}</SelectItem>
                        <SelectItem value="annual">{t("PaymentCycles.annual")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("payment_cycle") === "monthly" && (
              <FormField
                control={form.control}
                name="monthly_payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("PaymentCycles.monthly_payment.label")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("PaymentCycles.monthly_payment.placeholder")}
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
            )}
            {form.watch("payment_cycle") === "annual" && (
              <FormField
                control={form.control}
                name="annual_payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("PaymentCycles.annual_payment.label")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("PaymentCycles.annual_payment.placeholder")}
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
            )}
          </div>

          <div className="form-fields-cols-1">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("CommonStatus.label")}</FormLabel>
                  <FormControl>
                    <BooleanTabs
                      trueText={t("CommonStatus.active")}
                      falseText={t("CommonStatus.inactive")}
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
          </div>
        </div>
        <NotesSection
          inDialog={editMode}
          control={form.control}
          title={t("Domains.form.notes.label")}
        />
      </form>
    </Form>
  );
}

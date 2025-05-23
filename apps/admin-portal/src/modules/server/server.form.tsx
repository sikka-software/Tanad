import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { Combobox } from "@/ui/comboboxes/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CountryInput from "@/ui/inputs/country-input";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/forms/notes-section";

import { SERVER_OS, SERVER_PROVIDERS } from "@/lib/constants";
import { getNotesValue } from "@/lib/utils";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { servers } from "@/db/schema";
import { useCreateServer, useUpdateServer } from "@/server/server.hooks";
import useServerStore from "@/server/server.store";
import { ServerCreateData, ServerUpdateData } from "@/server/server.type";
import useUserStore from "@/stores/use-user-store";

const createServerSchema = (t: (key: string) => string) => {
  const ServerSelectSchema = createInsertSchema(servers, {
    name: z.string().min(1, t("Servers.form.name.required")),
    ip_address: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    provider: z.string().optional().or(z.literal("")),
    os: z.string().optional().or(z.literal("")),
    status: z.enum(CommonStatus, {
      message: t("CommonStatus.required"),
    }),
    tags: z.array(z.string()).optional().or(z.literal("")),
    monthly_payment: z.number().optional().or(z.literal("")),
    annual_payment: z.number().optional().or(z.literal("")),
    payment_cycle: z.string().min(1, t("PaymentCycles.required")),
    notes: z.any().optional().nullable(),
  });
  return ServerSelectSchema;
};

export type ServerFormValues = z.input<ReturnType<typeof createServerSchema>>;

export function ServerForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ServerUpdateData | ServerCreateData>) {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutate: createServer } = useCreateServer();
  const { mutate: updateServer } = useUpdateServer();

  const isLoading = useServerStore((state) => state.isLoading);
  const setIsLoading = useServerStore((state) => state.setIsLoading);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(createServerSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      ip_address: typeof defaultValues?.ip_address === "string" ? defaultValues.ip_address : "",
      location: defaultValues?.location || "",
      provider: defaultValues?.provider || "",
      os: defaultValues?.os || "",
      status: defaultValues?.status || "active",
      tags: Array.isArray(defaultValues?.tags)
        ? defaultValues.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      monthly_payment: defaultValues?.monthly_payment || 0,
      annual_payment: defaultValues?.annual_payment || 0,
      payment_cycle: defaultValues?.payment_cycle || "monthly",
      notes: getNotesValue(defaultValues),
      user_id: defaultValues?.user_id || "",
      enterprise_id: defaultValues?.enterprise_id || "",
    },
  });

  const handleSubmit = async (data: ServerFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }

    const commonData = {
      name: data.name.trim(),
      ip_address: data.ip_address?.trim() || null,
      location: data.location?.trim() || null,
      provider: data.provider?.trim() || null,
      os: data.os?.trim() || null,
      status: data.status,
      tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : null,
      notes: data.notes,
      monthly_payment: data.monthly_payment || 0,
      annual_payment: data.annual_payment || 0,
      payment_cycle: data.payment_cycle || "monthly",
    };

    try {
      if (editMode) {
        const updateData: ServerUpdateData = {
          ...commonData,
          payment_cycle:
            commonData.payment_cycle === "monthly" || commonData.payment_cycle === "annual"
              ? commonData.payment_cycle
              : undefined,
          enterprise_id: data.enterprise_id?.trim() || undefined,
        };

        await updateServer(
          {
            id: defaultValues?.id || "",
            data: updateData,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
            onError: () => setIsLoading(false),
          },
        );
      } else {
        if (!enterprise?.id) {
          toast.error(t("Servers.error.missing_enterprise"), {
            description: t("Servers.error.no_enterprise_context"),
          });
          setIsLoading(false);
          return;
        }

        const createData: ServerCreateData = {
          user_id: user.id,
          enterprise_id: enterprise.id,
          name: commonData.name,
          location: commonData.location,
          provider: commonData.provider,
          os: commonData.os,
          status: commonData.status as "active" | "inactive" | "draft" | "archived" | null,
          tags: commonData.tags,
          notes: commonData.notes,
          ip_address: commonData.ip_address as unknown | null,
          monthly_payment: commonData.monthly_payment,
          annual_payment: commonData.annual_payment,
          payment_cycle:
            commonData.payment_cycle === "monthly" || commonData.payment_cycle === "annual"
              ? commonData.payment_cycle
              : undefined,
        };

        await createServer(createData, {
          onSuccess: async (response) => {
            if (onSuccess) {
              onSuccess();
            }
          },
          onError: () => setIsLoading(false),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save server:", error);
      toast.error(t("General.error_operation"), {
        description: t("Servers.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).serverForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "server-form"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Servers.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Servers.form.name.placeholder")}
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
              name="ip_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Servers.form.ip_address.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Servers.form.ip_address.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="form-fields-cols-3">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Servers.form.location.label")}</FormLabel>
                  <FormControl>
                    <CountryInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={isLoading}
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
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Servers.form.provider.label")}</FormLabel>
                  <FormControl>
                    <Combobox
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      data={SERVER_PROVIDERS || []}
                      labelKey="label"
                      valueKey="value"
                      inputProps={{ disabled: isLoading }}
                      texts={{
                        placeholder: t("Servers.form.provider.placeholder"),
                        searchPlaceholder: t("Servers.form.provider.search_placeholder"),
                        noItems: t("Servers.form.provider.no_items"),
                      }}
                      value={field.value}
                      renderOption={(item) => <div>{item.label}</div>}
                      renderSelected={(item) => <div>{item.label}</div>}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Servers.form.os.label")}</FormLabel>
                  <FormControl>
                    <Combobox
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      data={SERVER_OS || []}
                      labelKey="label"
                      valueKey="value"
                      inputProps={{ disabled: isLoading }}
                      texts={{
                        placeholder: t("Servers.form.os.placeholder"),
                        searchPlaceholder: t("Servers.form.os.search_placeholder"),
                        noItems: t("Servers.form.os.no_items"),
                      }}
                      value={field.value}
                      renderOption={(item) => <div>{item.label}</div>}
                      renderSelected={(item) => <div>{item.label}</div>}
                      onChange={field.onChange}
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
          title={t("Servers.form.notes.label")}
        />
      </form>
    </Form>
  );
}

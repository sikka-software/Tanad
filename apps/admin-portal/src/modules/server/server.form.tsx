import { zodResolver } from "@hookform/resolvers/zod";
import BooleanTabs from "@root/src/components/ui/boolean-tabs";
import { CurrencyInput } from "@root/src/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@root/src/components/ui/select";
import { getNotesValue } from "@root/src/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Combobox } from "@/ui/comboboxes/combobox";
import CountryInput from "@/ui/country-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import NotesSection from "@/components/forms/notes-section";

import { SERVER_OS, SERVER_PROVIDERS } from "@/lib/constants";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useCreateServer, useUpdateServer } from "@/modules/server/server.hooks";
import useServerStore from "@/modules/server/server.store";
import { ServerCreateData, ServerUpdateData } from "@/modules/server/server.type";
import useUserStore from "@/stores/use-user-store";

export const createServerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Servers.form.name.required")),
    ip_address: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    provider: z.string().optional().or(z.literal("")),
    os: z.string().optional().or(z.literal("")),
    status: z.enum(CommonStatus, {
      message: t("Servers.form.status.required"),
    }),
    tags: z.array(z.string()).optional().or(z.literal("")),
    monthly_cost: z.number().optional().or(z.literal("")),
    annual_cost: z.number().optional().or(z.literal("")),
    payment_cycle: z.string().min(1, t("Servers.form.payment_cycle.required")),
    user_id: z.string().optional().or(z.literal("")),
    enterprise_id: z.string().optional().or(z.literal("")),
    notes: z.any().optional().nullable(),
  });

export type ServerFormValues = z.input<ReturnType<typeof createServerSchema>>;

export function ServerForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ServerUpdateData | ServerCreateData>) {
  const t = useTranslations();
  const lang = useLocale();
  const { user, enterprise } = useUserStore();
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
      monthly_cost: defaultValues?.monthly_cost || 0,
      annual_cost: defaultValues?.annual_cost || 0,
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
      monthly_cost: data.monthly_cost || 0,
      annual_cost: data.annual_cost || 0,
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
          name: commonData.name,
          location: commonData.location,
          provider: commonData.provider,
          os: commonData.os,
          status: commonData.status as "active" | "inactive" | "draft" | "archived" | null,
          tags: commonData.tags,
          notes: commonData.notes,
          user_id: user.id,
          enterprise_id: enterprise.id,
          ip_address: commonData.ip_address as unknown | null,
          monthly_cost: commonData.monthly_cost,
          annual_cost: commonData.annual_cost,
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
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      ariaInvalid={false}
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
                  <FormLabel>{t("Servers.form.payment_cycle.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Servers.form.payment_cycle.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("Servers.form.payment_cycle.monthly")}
                        </SelectItem>
                        <SelectItem value="annual">
                          {t("Servers.form.payment_cycle.annual")}
                        </SelectItem>
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
                name="monthly_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Servers.form.monthly_cost.label")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("Servers.form.monthly_cost.placeholder")}
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
                name="annual_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Servers.form.annual_cost.label")}</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("Servers.form.annual_cost.placeholder")}
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
                  <FormLabel>{t("Servers.form.status.label")}</FormLabel>
                  <FormControl>
                    <BooleanTabs
                      trueText={t("Servers.form.status.active")}
                      falseText={t("Servers.form.status.inactive")}
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

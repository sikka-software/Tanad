import { zodResolver } from "@hookform/resolvers/zod";
import { Combobox } from "@root/src/components/ui/combobox";
import { countries } from "@root/src/lib/constants/countries";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { SERVER_OS, SERVER_PROVIDERS } from "@/lib/constants";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateServer, useUpdateServer } from "./server.hooks";
import useServerStore from "./server.store";
import { Server, ServerCreateData, ServerUpdateData } from "./server.type";

export const createServerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Servers.form.name.required")),
    ip_address: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    provider: z.string().optional().or(z.literal("")),
    os: z.string().optional().or(z.literal("")),
    status: z.string().optional().or(z.literal("")),
    tags: z.array(z.string()).optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    user_id: z.string().optional().or(z.literal("")),
    enterprise_id: z.string().optional().or(z.literal("")),
  });

export type ServerFormValues = z.input<ReturnType<typeof createServerSchema>>;

export function ServerForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ServerUpdateData>) {
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
      status: defaultValues?.status || "",
      tags: Array.isArray(defaultValues?.tags)
        ? defaultValues.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      notes: defaultValues?.notes || "",
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
      status: data.status?.trim() || undefined,
      tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : null,
      notes: data.notes?.trim() || null,
    };

    try {
      if (editMode) {
        const updateData: Partial<Server> = {
          ...commonData,
          enterprise_id: data.enterprise_id?.trim() || undefined,
          ip_address: commonData.ip_address as unknown | null,
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
          status: commonData.status,
          tags: commonData.tags,
          notes: commonData.notes,
          user_id: user.id,
          enterprise_id: enterprise.id,
          ip_address: commonData.ip_address as unknown | null,
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
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <Combobox
                      direction={lang === "ar" ? "rtl" : "ltr"}
                      data={countries || []}
                      labelKey="label"
                      inputProps={{ disabled: isLoading }}
                      valueKey="label"
                      texts={{
                        placeholder: t("Servers.form.location.placeholder"),
                        searchPlaceholder: t("Servers.form.location.search_placeholder"),
                        noItems: t("Servers.form.location.no_items"),
                      }}
                      renderOption={(item) => (
                        <div>{t(`Country.${item.label.toLowerCase().split(" ").join("_")}`)}</div>
                      )}
                      renderSelected={(item) => (
                        <div>{t(`Country.${item.label.toLowerCase().split(" ").join("_")}`)}</div>
                      )}
                      onChange={field.onChange}
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
                      direction={lang === "ar" ? "rtl" : "ltr"}
                      data={SERVER_PROVIDERS || []}
                      labelKey="label"
                      valueKey="label"
                      inputProps={{ disabled: isLoading }}
                      texts={{
                        placeholder: t("Servers.form.provider.placeholder"),
                        searchPlaceholder: t("Servers.form.provider.search_placeholder"),
                        noItems: t("Servers.form.provider.no_items"),
                      }}
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
                      direction={lang === "ar" ? "rtl" : "ltr"}
                      data={SERVER_OS || []}
                      labelKey="label"
                      valueKey="label"
                      inputProps={{ disabled: isLoading }}
                      texts={{
                        placeholder: t("Servers.form.os.placeholder"),
                        searchPlaceholder: t("Servers.form.os.search_placeholder"),
                        noItems: t("Servers.form.os.no_items"),
                      }}
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
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Servers.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Servers.form.notes.placeholder")}
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

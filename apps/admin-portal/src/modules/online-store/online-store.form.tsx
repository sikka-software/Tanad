import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import BooleanTabs from "@root/src/components/ui/boolean-tabs";
import { Combobox } from "@root/src/components/ui/combobox";
import { E_COMMERCE_PLATFORMS } from "@root/src/lib/constants";
import { getNotesValue } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateOnlineStore, useUpdateOnlineStore } from "./online-store.hooks";
import useOnlineStoreStore from "./online-store.store";
import { OnlineStoreUpdateData, OnlineStoreCreateData } from "./online-store.type";

export const createOnlineStoreSchema = (t: (key: string) => string) => {
  const baseOnlineStoreSchema = z.object({
    domain_name: z.string().min(1, t("OnlineStores.form.domain_name.required")),
    platform: z.string().min(1, t("OnlineStores.form.platform.required")),
    notes: z.any().optional().nullable(),
    status: z.string().min(1, t("OnlineStores.form.status.required")),
  });

  return baseOnlineStoreSchema;
};

export type OnlineStoreFormValues = z.input<ReturnType<typeof createOnlineStoreSchema>>;

export interface OnlineStoreFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: OnlineStoreUpdateData | null;
  editMode?: boolean;
}

export function OnlineStoreForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<OnlineStoreUpdateData | OnlineStoreCreateData>) {
  const t = useTranslations();
  const lang = useLocale();
  const user = useUserStore((state) => state.user);
  const membership = useUserStore((state) => state.membership);

  const { mutate: createOnlineStore } = useCreateOnlineStore();
  const { mutate: updateOnlineStore } = useUpdateOnlineStore();

  const isLoading = useOnlineStoreStore((state) => state.isLoading);
  const setIsLoading = useOnlineStoreStore((state) => state.setIsLoading);

  const form = useForm<OnlineStoreFormValues>({
    resolver: zodResolver(createOnlineStoreSchema(t)),
    defaultValues: {
      domain_name: defaultValues?.domain_name || "",
      status: defaultValues?.status || "active",
      platform: defaultValues?.platform || "",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: OnlineStoreFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateOnlineStore(
          {
            id: defaultValues?.id || "",
            data: {
              domain_name: data.domain_name.trim(),
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
        await createOnlineStore(
          {
            domain_name: data.domain_name.trim(),
            status: data.status?.trim() as "active" | "inactive" | null,
            notes: data.notes,
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
      console.error("Failed to save online store:", error);
      toast.error(t("General.error_operation"), {
        description: t("OnlineStores.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).onlineStoreForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="form-container">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="domain_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("OnlineStores.form.domain_name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("OnlineStores.form.domain_name.placeholder")}
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
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("OnlineStores.form.platform.label")}</FormLabel>
                  <FormControl>
                    <Combobox
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      data={E_COMMERCE_PLATFORMS || []}
                      labelKey="label"
                      valueKey="value"
                      defaultValue={field.value}
                      value={field.value}
                      inputProps={{ disabled: isLoading }}
                      texts={{
                        placeholder: t("OnlineStores.form.platform.placeholder"),
                        searchPlaceholder: t("OnlineStores.form.platform.search_placeholder"),
                        noItems: t("OnlineStores.form.platform.no_items"),
                      }}
                      renderOption={(item) => <div>{t(item.label)}</div>}
                      renderSelected={(item) => <div>{t(item.label)}</div>}
                      onChange={field.onChange}
                      ariaInvalid={!!form.formState.errors.platform}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("OnlineStores.form.status.label")}</FormLabel>
                <FormControl>
                  <BooleanTabs
                    trueText={t("OnlineStores.form.status.active")}
                    falseText={t("OnlineStores.form.status.inactive")}
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
        <NotesSection
          inDialog={editMode}
          control={form.control}
          title={t("OnlineStores.form.notes.label")}
        />
      </form>
    </Form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateWebsite, useUpdateWebsite } from "./website.hooks";
import useWebsiteStore from "./website.store";
import { WebsiteUpdateData, WebsiteCreateData, Website } from "./website.type";

export const createWebsiteSchema = (t: (key: string) => string) => {
  return z.object({
    domain_name: z.string().min(1, t("Websites.form.domain_name.required")),
    notes: z.string().optional().or(z.literal("")),
    status: z
      .enum(["active", "inactive"], {
        required_error: t("Websites.form.status.required"),
      })
      .default("active"),
  });
};

export type WebsiteFormValues = z.input<ReturnType<typeof createWebsiteSchema>>;

export function WebsiteForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<Website>) {
  const t = useTranslations();
  const locale = useLocale();

  const { user, enterprise } = useUserStore();
  const { mutate: createWebsite } = useCreateWebsite();
  const { mutate: updateWebsite } = useUpdateWebsite();

  const isLoading = useWebsiteStore((state: any) => state.isLoading);
  const setIsLoading = useWebsiteStore((state: any) => state.setIsLoading);

  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(createWebsiteSchema(t)),
    defaultValues: {
      domain_name: defaultValues?.domain_name || "",
      notes: defaultValues?.notes || "",
      status: (defaultValues?.status as "active" | "inactive") || "active",
    },
  });

  const handleSubmit = async (data: WebsiteFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }
    if (!enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.no_enterprise_selected"),
      });
      setIsLoading(false);
      return;
    }

    const optionalString = (val: string | null | undefined): string | null => {
      return val && val.trim() !== "" ? val.trim() : null;
    };

    const payload: Omit<
      WebsiteCreateData,
      "user_id" | "enterprise_id" | "id" | "created_at" | "updated_at"
    > & { user_id: string; enterprise_id: string } = {
      domain_name: data.domain_name.trim(),
      notes: optionalString(data.notes),
      status: data.status,
      user_id: user.id,
      enterprise_id: enterprise.id,
    };

    try {
      if (editMode) {
        if (!defaultValues?.id) {
          throw new Error("Website ID is missing for update.");
        }
        await updateWebsite(
          {
            id: defaultValues.id,
            data: payload as Partial<WebsiteUpdateData>,
          },
          {
            onSuccess: () => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            },
            onError: (error: any) => {
              setIsLoading(false);
              toast.error(t("General.error_operation"), {
                description: error.message || t("Websites.toast.update_error"),
              });
            },
          },
        );
      } else {
        await createWebsite(payload as WebsiteCreateData, {
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            setIsLoading(false);
            toast.error(t("General.error_operation"), {
              description: error.message || t("Websites.toast.create_error"),
            });
          },
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Failed to save website:", error);
      toast.error(t("General.error_operation"), {
        description: t("Websites.toast.generic_error"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).websiteForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
            <FormField
              control={form.control}
              name="domain_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Websites.form.domain_name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Websites.form.domain_name.placeholder")}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Websites.form.status.label")} *</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Websites.form.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("Websites.form.status.active")}</SelectItem>
                      <SelectItem value="inactive">{t("Websites.form.status.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Websites.form.notes.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Websites.form.notes.placeholder")}
                      className="min-h-[100px]"
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
    </div>
  );
}

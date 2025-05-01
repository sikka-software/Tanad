import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Combobox } from "@/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import NumberInput from "@/components/ui/number-input";
import PhoneInput from "@/components/ui/phone-input";

import useUserStore from "@/stores/use-user-store";

import { useCreateOffice, useUpdateOffice } from "./office.hooks";
import useOfficeStore from "./office.store";
import { OfficeUpdateData } from "./office.type";

const createOfficeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Offices.form.name.required")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().min(1, t("Offices.form.address.required")),
    city: z.string().min(1, t("Offices.form.city.required")),
    state: z.string().min(1, t("Offices.form.state.required")),
    zip_code: z.string().min(1, t("Offices.form.zip_code.required")),
  });

export type OfficeFormValues = z.input<ReturnType<typeof createOfficeSchema>>;

interface OfficeFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: OfficeUpdateData | null;
  editMode?: boolean;
}

export function OfficeForm({ id, onSuccess, defaultValues, editMode }: OfficeFormProps) {
  const t = useTranslations();
  const { mutateAsync: createOffice, isPending: isCreating } = useCreateOffice();
  const { mutateAsync: updateOffice, isPending: isUpdating } = useUpdateOffice();
  const { profile, membership } = useUserStore();
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(createOfficeSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zip_code: defaultValues?.zip_code || "",
    },
  });

  const handleSubmit = async (data: OfficeFormValues) => {
    setIsLoading(true);
    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Office ID missing in edit mode");
          toast.error(t("Offices.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateOffice(
          {
            id: defaultValues.id,
            office: {
              name: data.name.trim(),
              address: data.address?.trim() || undefined,
              city: data.city?.trim() || undefined,
              state: data.state?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) onSuccess();
            },
          },
        );
      } else {
        if (!membership?.enterprise_id) {
          toast.error(t("General.error_operation"), {
            description: t("Offices.error.no_enterprise"),
          });
          setIsLoading(false);
          return;
        }

        await createOffice(
          {
            name: data.name.trim(),
            address: data.address?.trim() || undefined,
            city: data.city?.trim() || undefined,
            state: data.state?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            enterprise_id: membership.enterprise_id,
            is_active: true,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) onSuccess();
            },
          },
        );
      }
    } catch (error) {
      console.error("Error in office form:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Offices.error.creating"),
      });
      setIsLoading(false);
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).officeForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={id || "office-form"}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Offices.form.name.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder={t("Offices.form.name.placeholder")}
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
              <FormLabel>{t("Offices.form.email.label")}</FormLabel>
              <FormControl>
                <Input
                  dir="ltr"
                  {...field}
                  type="email"
                  disabled={isLoading}
                  placeholder={t("Offices.form.email.placeholder")}
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
              <FormLabel>{t("Offices.form.phone.label")}</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value || ""}
                  onChange={(value) => field.onChange(value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Offices.form.address.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder={t("Offices.form.address.placeholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Offices.form.city.label")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder={t("Offices.form.city.placeholder")}
                  />
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
                <FormLabel>{t("Offices.form.state.label")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder={t("Offices.form.state.placeholder")}
                  />
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
                <FormLabel>{t("Offices.form.zip_code.label")}</FormLabel>
                <FormControl>
                  <NumberInput
                    {...field}
                    disabled={isLoading}
                    placeholder={t("Offices.form.zip_code.placeholder")}
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import CodeInput from "@/components/ui/code-input";
import PhoneInput from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateOffice, useOffices, useUpdateOffice } from "./office.hooks";
import useOfficeStore from "./office.store";
import { Office, OfficeUpdateData } from "./office.type";

const createOfficeSchema = (t: (key: string) => string) => {
  const baseOfficeSchema = z.object({
    name: z.string().min(1, t("Offices.form.name.required")),
    code: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
  });

  const addressSchema = createAddressSchema(t);

  return baseOfficeSchema.merge(addressSchema);
};

export type OfficeFormValues = z.input<ReturnType<typeof createOfficeSchema>>;

export function OfficeForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<OfficeUpdateData>) {
  const t = useTranslations();
  const { data: offices } = useOffices();
  const { mutateAsync: createOffice, isPending: isCreating } = useCreateOffice();
  const { mutateAsync: updateOffice, isPending: isUpdating } = useUpdateOffice();
  const membership = useUserStore((state) => state.membership);
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(createOfficeSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
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
              code: data.code?.trim() || undefined,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
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
            code: data.code?.trim() || undefined,
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
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
        description: t("Offices.error.create"),
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
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Offices.form.code.label")}</FormLabel>
                  <FormControl>
                    <CodeInput
                      onSerial={() => {
                        const nextNumber = (offices?.length || 0) + 1;
                        const paddedNumber = String(nextNumber).padStart(4, "0");
                        form.setValue("code", `OF-${paddedNumber}`);
                      }}
                      onRandom={() => {
                        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        let randomCode = "";
                        for (let i = 0; i < 5; i++) {
                          randomCode += randomChars.charAt(
                            Math.floor(Math.random() * randomChars.length),
                          );
                        }
                        form.setValue("code", `OF-${randomCode}`);
                      }}
                    >
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t("Offices.form.code.placeholder")}
                      />
                    </CodeInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                    onChange={field.onChange}
                    ariaInvalid={form.formState.errors.phone !== undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Vendors.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Vendors.form.notes.placeholder")}
                    {...field}
                    value={field.value ?? ""}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <AddressFormSection
          title={t("Offices.form.address.label")}
          control={form.control}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
}

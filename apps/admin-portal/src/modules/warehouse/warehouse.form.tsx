import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import { getNotesValue } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import CodeInput from "@/components/ui/code-input";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateWarehouse, useUpdateWarehouse, useWarehouses } from "./warehouse.hooks";
import useWarehouseStore from "./warehouse.store";
import { WarehouseCreateData, WarehouseUpdateData } from "./warehouse.type";

export const createWarehouseFormSchema = (t: (key: string) => string) => {
  const baseWarehouseFormSchema = z.object({
    name: z.string().min(1, t("Warehouses.form.name.required")),
    code: z.string().min(1, t("Warehouses.form.code.required")),
    phone: z.string().optional(),
    capacity: z.string().optional(),
    status: z.string().default("active"),
    notes: z.any().optional().nullable(),
  });

  const addressSchema = createAddressSchema(t);

  return baseWarehouseFormSchema.merge(addressSchema);
};

export type WarehouseFormValues = z.input<ReturnType<typeof createWarehouseFormSchema>>;

export function WarehouseForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<WarehouseUpdateData | WarehouseCreateData>) {
  const t = useTranslations();
  const locale = useLocale();
  const { profile, membership } = useUserStore();

  const { mutateAsync: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutateAsync: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse();

  const { data: warehouses } = useWarehouses();

  const isLoading = useWarehouseStore((state) => state.isLoading);
  const setIsLoading = useWarehouseStore((state) => state.setIsLoading);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(createWarehouseFormSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      short_address: defaultValues?.short_address || "",
      building_number: defaultValues?.building_number || "",
      street_name: defaultValues?.street_name || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      capacity: defaultValues?.capacity ? String(defaultValues.capacity) : "",
      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: WarehouseFormValues) => {
    setIsLoading(true);
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Warehouse ID missing in edit mode");
          toast.error(t("Warehouses.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateWarehouse(
          {
            id: defaultValues.id,
            data: {
              name: data.name.trim(),
              code: data.code.trim(),
              capacity: data.capacity ? parseInt(data.capacity) : null,
              status: data.status as "active" | "inactive" | "draft" | "archived" | null,
              notes: data.notes,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              additional_number: data.additional_number?.trim() || undefined,
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        await createWarehouse(
          {
            enterprise_id: membership?.enterprise_id || "",
            name: data.name.trim(),
            code: data.code.trim(),
            capacity: data.capacity ? parseInt(data.capacity) : null,
            notes: data.notes,
            status: data.status as "active" | "inactive" | "draft" | "archived" | null,
            user_id: profile?.id || "",
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            additional_number: data.additional_number?.trim() || undefined,
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save warehouse:", error);
      toast.error(t("General.error_operation"), {
        description: t("Warehouses.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).warehouseForm = form;
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
                  <FormLabel>{t("Warehouses.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Warehouses.form.name.placeholder")}
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Warehouses.form.code.label")} *</FormLabel>
                  <FormControl>
                    <CodeInput
                      onSerial={() => {
                        const nextNumber = (warehouses?.length || 0) + 1;
                        const paddedNumber = String(nextNumber).padStart(4, "0");
                        form.setValue("code", `WH-${paddedNumber}`);
                      }}
                      onRandom={() => {
                        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        let randomCode = "";
                        for (let i = 0; i < 5; i++) {
                          randomCode += randomChars.charAt(
                            Math.floor(Math.random() * randomChars.length),
                          );
                        }
                        form.setValue("code", `WH-${randomCode}`);
                      }}
                    >
                      <Input
                        placeholder={t("Warehouses.form.code.placeholder")}
                        {...field}
                        disabled={isLoading}
                      />
                    </CodeInput>
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
                  <FormLabel>{t("Warehouses.form.phone.label")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      ariaInvalid={form.formState.errors.phone !== undefined}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Warehouses.form.capacity.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("Warehouses.form.capacity.placeholder")}
                      {...field}
                      disabled={isLoading}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <AddressFormSection
          dir={locale === "ar" ? "rtl" : "ltr"}
          inDialog={editMode || nestedForm}
          title={t("Warehouses.form.address.label")}
          control={form.control}
          isLoading={isLoading}
        />

        <NotesSection
          inDialog={editMode || nestedForm}
          control={form.control}
          title={t("Warehouses.form.notes.label")}
        />
      </form>
    </Form>
  );
}

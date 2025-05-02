import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";
import CodeInput from "@/components/ui/code-input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateWarehouse, useUpdateWarehouse, useWarehouses } from "./warehouse.hooks";
import useWarehouseStore from "./warehouse.store";
import { Warehouse } from "./warehouse.type";

export const createWarehouseFormSchema = (t: (key: string) => string) => {
  const baseWarehouseFormSchema = z.object({
    name: z.string().min(1, t("Warehouses.form.name.required")),
    code: z.string().min(1, t("Warehouses.form.code.required")),
    capacity: z.string().optional(),
    is_active: z.boolean().default(true),
    notes: z.string().optional(),
  });

  const addressSchema = createAddressSchema(t);

  return baseWarehouseFormSchema.merge(addressSchema);
};

export type WarehouseFormValues = z.input<ReturnType<typeof createWarehouseFormSchema>>;

export function WarehouseForm({
  id,
  onSuccess,
  loading,
  defaultValues,
  editMode,
}: ModuleFormProps<Warehouse>) {
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
      name: "",
      code: "",
      short_address: "",
      building_number: "",
      street_name: "",
      city: "",
      region: "",
      country: "",
      zip_code: "",
      capacity: "",
      is_active: true,
      notes: "",
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
          console.error("Company ID missing in edit mode");
          toast.error(t("Companies.error.missing_id"));
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
              is_active: data.is_active ?? true,
              notes: data.notes?.trim() || null,
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
            notes: data.notes?.trim() || null,
            is_active: data.is_active ?? true,
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
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Companies.error.creating"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).warehouseForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "warehouse-form"} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      disabled={loading}
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
                        disabled={loading}
                      />
                    </CodeInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
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
                      disabled={loading}
                      value={field.value || ""}
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
                <FormLabel>{t("Warehouses.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Warehouses.form.notes.placeholder")}
                    className="min-h-[120px]"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <AddressFormSection
          title={t("Warehouses.form.address.label")}
          control={form.control}
          isLoading={loading}
        />
      </form>
    </Form>
  );
}

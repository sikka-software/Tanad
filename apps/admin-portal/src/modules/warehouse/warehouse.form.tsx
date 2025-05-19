import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CodeInput from "@/ui/inputs/code-input";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";
import UnitsInput from "@/ui/inputs/units-input";

import BooleanTabs from "@/components/ui/boolean-tabs";

import { AddressFormSection } from "@/forms/address-form-section";
import NotesSection from "@/forms/notes-section";

import { addressSchema } from "@/lib/schemas/address.schema";
import { getNotesValue } from "@/lib/utils";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useCreateWarehouse, useUpdateWarehouse, useWarehouses } from "@/warehouse/warehouse.hooks";
import useWarehouseStore from "@/warehouse/warehouse.store";
import { WarehouseCreateData, WarehouseUpdateData } from "@/warehouse/warehouse.type";

import { warehouses } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createWarehouseSchema = (t: (key: string) => string) => {
  const WarehouseSelectSchema = createInsertSchema(warehouses, {
    name: z.string().min(1, t("Warehouses.form.name.required")),
    code: z.string().min(1, t("Warehouses.form.code.required")),
    phone: z.string().optional(),
    email: z
      .string()
      .email({ message: t("Warehouses.form.email.invalid") })
      .optional(),
    manager: z.string().optional().nullable(),
    status: z.enum(CommonStatus, {
      message: t("CommonStatus.required"),
    }),
    capacity: z.number().optional().nullable(),

    // working_hours: z.string().optional().nullable(),

    area: z.string().optional().nullable(),
    notes: z.any().optional().nullable(),
    operating_hours: z.string().optional().nullable(),
    temperature_control: z.boolean().optional().nullable(),
    warehouse_type: z.string().optional().nullable(),
    safety_compliance: z.string().optional().nullable(),
    ...addressSchema,
  });
  return WarehouseSelectSchema;
};

export type WarehouseFormValues = z.input<ReturnType<typeof createWarehouseSchema>>;

export function WarehouseForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<WarehouseUpdateData | WarehouseCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutateAsync: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse();

  const { data: warehouses } = useWarehouses();

  const isLoading = useWarehouseStore((state) => state.isLoading);
  const setIsLoading = useWarehouseStore((state) => state.setIsLoading);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(createWarehouseSchema(t)),
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
      capacity: defaultValues?.capacity,
      status: defaultValues?.status || "active",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: WarehouseFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
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
              ...data,
              name: data.name.trim(),
              code: data.code.trim(),
              capacity: data.capacity,
              status: data.status as "active" | "inactive" | "draft" | "archived" | null,
              notes: data.notes,
              short_address: data.short_address?.trim() || undefined,
              building_number: data.building_number?.trim() || undefined,
              street_name: data.street_name?.trim() || undefined,
              city: data.city?.trim() || undefined,
              region: data.region?.trim() || undefined,
              country: data.country?.trim() || undefined,
              zip_code: data.zip_code?.trim() || undefined,
              area: data.area,
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
            ...data,
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
            name: data.name.trim(),
            code: data.code.trim(),
            capacity: data.capacity,
            notes: data.notes,
            status: data.status as "active" | "inactive" | "draft" | "archived" | null,
            short_address: data.short_address?.trim() || undefined,
            building_number: data.building_number?.trim() || undefined,
            street_name: data.street_name?.trim() || undefined,
            city: data.city?.trim() || undefined,
            region: data.region?.trim() || undefined,
            country: data.country?.trim() || undefined,
            zip_code: data.zip_code?.trim() || undefined,
            area: data.area,
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
      <form
        id={formHtmlId || "warehouse-form"}
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
                      inputProps={{
                        placeholder: t("Warehouses.form.code.placeholder"),
                        disabled: isLoading,
                        ...field,
                      }}
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
                  <FormLabel>{t("Warehouses.form.email.label")}</FormLabel>
                  <FormControl>
                    <Input
                      dir="ltr"
                      {...field}
                      type="email"
                      disabled={isLoading}
                      placeholder={t("Warehouses.form.email.placeholder")}
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
                  <FormLabel>{t("Warehouses.form.phone.label")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
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
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => {
                const [unit, setUnit] = useState("sqm");
                const initialNumber = (() => {
                  if (typeof field.value === "string") {
                    const match = field.value.match(/^(sqm|sqft)\s*(\d+(?:\.\d+)?)$/);
                    if (match) return match[2];
                  }
                  return "";
                })();
                const [areaValue, setAreaValue] = useState(initialNumber);
                return (
                  <FormItem>
                    <FormLabel>{t("Warehouses.form.area.label")}</FormLabel>
                    <FormControl>
                      <UnitsInput
                        label={undefined}
                        inputProps={{
                          type: "number",
                          placeholder: t("Warehouses.form.area.placeholder"),
                          value: areaValue,
                          onChange: (e) => {
                            setAreaValue(e.target.value);
                          },
                          onBlur: () => {
                            if (areaValue === "") {
                              field.onChange(undefined);
                            } else {
                              field.onChange(unit + " " + areaValue);
                            }
                          },
                          disabled: isLoading,
                        }}
                        selectProps={{
                          options: [
                            { value: "sqm", label: "m²" },
                            { value: "sqft", label: "ft²" },
                          ],
                          value: unit,
                          onValueChange: (newUnit) => {
                            setUnit(newUnit);
                            if (areaValue !== "") {
                              field.onChange(newUnit + " " + areaValue);
                            }
                          },
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("CommonStatus.label")}</FormLabel>
                  <FormControl>
                    <BooleanTabs
                      disabled={isLoading}
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
        <AddressFormSection
          dir={locale === "ar" ? "rtl" : "ltr"}
          inDialog={editMode || nestedForm}
          title={t("Warehouses.form.address.label")}
          control={form.control}
          disabled={isLoading}
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

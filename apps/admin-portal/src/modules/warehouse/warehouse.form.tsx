import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

import { AddressFormSection } from "@/components/forms/address-form-section";
import { createAddressSchema } from "@/components/forms/address-schema";

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

interface WarehouseFormProps {
  id?: string;
  loading?: boolean;
  onSubmit: (data: WarehouseFormValues) => void;
}

export function WarehouseForm({ id, onSubmit, loading }: WarehouseFormProps) {
  const t = useTranslations();
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

  if (typeof window !== "undefined") {
    (window as any).warehouseForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={id || "warehouse-form"}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
                  <Input
                    placeholder={t("Warehouses.form.code.placeholder")}
                    {...field}
                    disabled={loading}
                  />
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

          <AddressFormSection
            title={t("Warehouses.form.address.label")}
            control={form.control}
            isLoading={loading}
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
      </form>
    </Form>
  );
}

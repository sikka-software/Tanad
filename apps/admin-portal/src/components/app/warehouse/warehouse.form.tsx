import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

const createWarehouseFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Warehouses.form.name.required")),
    code: z.string().min(1, t("Warehouses.form.code.required")),
    address: z.string().min(1, t("Warehouses.form.address.required")),
    city: z.string().min(1, t("Warehouses.form.city.required")),
    state: z.string().min(1, t("Warehouses.form.state.required")),
    zip_code: z.string().min(1, t("Warehouses.form.zip_code.required")),
    capacity: z.string().optional(),
    is_active: z.boolean().default(true),
    notes: z.string().optional(),
  });

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
      address: "",
      city: "",
      state: "",
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
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Warehouses.form.address.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Warehouses.form.address.placeholder")}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Warehouses.form.city.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Warehouses.form.city.placeholder")}
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
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Warehouses.form.state.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Warehouses.form.state.placeholder")}
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
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Warehouses.form.zip_code.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Warehouses.form.zip_code.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("Warehouses.form.is_active.label")}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
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
      </form>
    </Form>
  );
}

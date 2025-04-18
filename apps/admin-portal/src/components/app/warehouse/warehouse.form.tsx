import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

import { createWarehouse, fetchWarehouseById, updateWarehouse } from "@/services/warehouseService";

import type { Warehouse, WarehouseCreateData } from "@/types/warehouse.type";

// Define the schema
const warehouseFormSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  capacity: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

// Define the form values type
type WarehouseFormValues = z.input<typeof warehouseFormSchema>;

interface WarehouseFormProps {
  id?: string;
  warehouse_id?: string;
  onSuccess?: (warehouse: Warehouse) => void;
  loading?: boolean;
  user_id: string | undefined;
  setLoading?: (loading: boolean) => void;
}

export function WarehouseForm({
  id = "warehouse-form",
  warehouse_id,
  onSuccess,
  loading: externalLoading = false,
  user_id,
  setLoading,
}: WarehouseFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  // Create schema with translations
  const getWarehouseSchema = () => {
    return warehouseFormSchema
      .refine(() => true, {
        message: t("Warehouses.form.name.required"),
        path: ["name"],
      })
      .refine(() => true, {
        message: t("Warehouses.form.code.required"),
        path: ["code"],
      })
      .refine(() => true, {
        message: t("Warehouses.form.address.required"),
        path: ["address"],
      })
      .refine(() => true, {
        message: t("Warehouses.form.city.required"),
        path: ["city"],
      })
      .refine(() => true, {
        message: t("Warehouses.form.state.required"),
        path: ["state"],
      })
      .refine(() => true, {
        message: t("Warehouses.form.zip_code.required"),
        path: ["zip_code"],
      });
  };

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(getWarehouseSchema()),
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

  // Fetch warehouse data if warehouse_id is provided (edit mode)
  useEffect(() => {
    if (warehouse_id) {
      setInternalLoading(true);
      fetchWarehouseById(warehouse_id)
        .then((warehouse) => {
          form.reset({
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address,
            city: warehouse.city,
            state: warehouse.state,
            zip_code: warehouse.zip_code,
            capacity: warehouse.capacity ? warehouse.capacity.toString() : "",
            is_active: warehouse.is_active,
            notes: warehouse.notes || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch warehouse:", error);
          toast.error(t("General.error_operation"), {
            description: t("Warehouses.messages.error_fetch"),
          });
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [warehouse_id, form, t]);

  const onSubmit: SubmitHandler<WarehouseFormValues> = async (data) => {
    setInternalLoading(true);
    if (!user_id) {
      toast.error(t("General.error_operation"), {
        description: t("General.not_authenticated"),
      });
      setInternalLoading(false);
      return;
    }

    try {
      const warehouseData = {
        name: data.name.trim(),
        code: data.code.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        is_active: data.is_active,
        notes: data.notes?.trim() || null,
      };

      let result: Warehouse;
      if (warehouse_id) {
        result = await updateWarehouse(warehouse_id, warehouseData);
        toast.success(t("General.successful_operation"), {
          description: t("Warehouses.messages.success_updated"),
        });
      } else {
        const warehouseCreateData = {
          ...warehouseData,
          user_id: user_id,
        };
        result = await createWarehouse(warehouseCreateData as unknown as WarehouseCreateData);
        toast.success(t("General.successful_operation"), {
          description: t("Warehouses.messages.success_created"),
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/warehouses");
      }
    } catch (error) {
      console.error("Failed to save warehouse:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Warehouses.messages.error_save"),
      });
    } finally {
      setInternalLoading(false);
    }
  };

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

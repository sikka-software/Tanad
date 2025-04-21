import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { RefObject, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { CurrencyInput } from "@/components/ui/currency-input";

export const createProductSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Products.form.name.required")),
    description: z.string().optional(),
    price: z
      .string()
      .min(1, t("Products.form.price.required"))
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
        t("Products.form.price.invalid"),
      ),
    sku: z.string().optional(),
    stock_quantity: z
      .string()
      .min(1, t("Products.form.stock_quantity.required"))
      .refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
        t("Products.form.stock_quantity.invalid"),
      ),
  });

export type ProductFormValues = z.input<ReturnType<typeof createProductSchema>>;

interface ProductFormProps {
  id?: string;
  loading?: boolean;

  onSubmit: (data: ProductFormValues) => void;
}

export function ProductForm({ id, onSubmit, loading }: ProductFormProps) {
  const t = useTranslations();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema(t)),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      sku: "",
      stock_quantity: "",
    },
  });

  if (typeof window !== "undefined") {
    (window as any).productForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "product-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="submit" hidden />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Products.form.name.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Products.form.name.placeholder")}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Products.form.description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Products.form.description.placeholder")}
                  rows={4}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Products.form.price.label")} *</FormLabel>
                <FormControl>
                  <CurrencyInput
                    showCommas={true}
                    value={field.value ? parseFloat(String(field.value)) : undefined}
                    onChange={(value) => field.onChange(value?.toString() || "")}
                    placeholder={t("Products.form.price.placeholder")}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Products.form.stock_quantity.label")} *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Products.form.sku.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Products.form.sku.placeholder")}
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

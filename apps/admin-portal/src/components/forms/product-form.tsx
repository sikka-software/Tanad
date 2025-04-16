import { RefObject, useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  onSuccess: (product: any) => void;
  userId: string | null;
  formRef?: RefObject<HTMLFormElement>;
  hideFormButtons?: boolean;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
}

export function ProductForm({
  id,
  onSuccess,
  userId,
  formRef,
  hideFormButtons = false,
  loading: externalLoading = false,
  setLoading,
}: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

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

  const onSubmit = async (data: ProductFormValues) => {
    if (!userId) {
      toast.error(t("General.error_operation"), {
        description: t("Products.error.not_authenticated"),
      });
      return;
    }

    setInternalLoading(true);
    setLoading?.(true);
    try {
      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: data.price,
          sku: data.sku?.trim() || null,
          stock_quantity: data.stock_quantity,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Products.error.create"));
      }

      const result = await response.json();

      toast.success(t("General.successful_operation"), {
        description: t("Products.success.created"),
      });

      onSuccess(result.product);
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Products.error.create"),
      });
    } finally {
      setInternalLoading(false);
      setLoading?.(false);
    }
  };

  return (
    <Form {...form}>
      <form ref={formRef} id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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

        {!hideFormButtons && (
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/products")}
              disabled={loading}
            >
              {t("General.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("Products.creating_product") : t("Products.create_product")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

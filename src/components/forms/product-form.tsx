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

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be a positive number",
    ),
  sku: z.string().optional(),
  stock_quantity: z
    .string()
    .min(1, "Stock quantity is required")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
      "Stock quantity must be a positive number",
    ),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess: (product: any) => void;
  userId: string | null;
  formRef?: RefObject<HTMLFormElement>;
  hideFormButtons?: boolean;
}

export function ProductForm({
  onSuccess,
  userId,
  formRef,
  hideFormButtons = false,
}: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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
      toast.error(t("Products.error.title"), {
        description: t("Products.error.not_authenticated"),
      });
      return;
    }

    setLoading(true);
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

      toast.success(t("Products.success.title"), {
        description: t("Products.success.created"),
      });

      onSuccess(result.product);
    } catch (error) {
      toast.error(t("Products.error.title"), {
        description: error instanceof Error ? error.message : t("Products.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="submit" hidden />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Products.product_name")} *</FormLabel>
              <FormControl>
                <Input placeholder={t("Products.enter_product_name")} {...field} />
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
              <FormLabel>{t("Products.description")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("Products.enter_description")} rows={4} {...field} />
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
                <FormLabel>{t("Products.price")} *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                <FormLabel>{t("Products.stock_quantity")} *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
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
              <FormLabel>{t("Products.sku")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Products.enter_sku")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideFormButtons && (
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/products")}>
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

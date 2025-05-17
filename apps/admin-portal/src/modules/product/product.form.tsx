import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CodeInput from "@/ui/inputs/code-input";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { Input } from "@/ui/inputs/input";
import { Textarea } from "@/ui/textarea";

import NotesSection from "@/components/forms/notes-section";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateProduct, useUpdateProduct, useProducts } from "@/product/product.hooks";
import useProductStore from "@/product/product.store";
import { ProductUpdateData, ProductCreateData } from "@/product/product.type";

import { products } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createProductSchema = (t: (key: string) => string) => {
  const ProductSelectSchema = createInsertSchema(products, {
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
    notes: z.any().optional().nullable(),
    stock_quantity: z
      .string()
      .min(1, t("Products.form.stock_quantity.required"))
      .refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
        t("Products.form.stock_quantity.invalid"),
      ),
  });
  return ProductSelectSchema;
};

export type ProductFormValues = z.input<ReturnType<typeof createProductSchema>>;

export function ProductForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ProductUpdateData | ProductCreateData>) {
  const t = useTranslations();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const { data: products } = useProducts();

  const isLoading = useProductStore((state) => state.isLoading);
  const setIsLoading = useProductStore((state) => state.setIsLoading);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema(t)),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      sku: "",
      stock_quantity: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    if (!user?.id || !enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Product ID missing in edit mode");
          toast.error(t("Products.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateProduct(
          {
            id: defaultValues.id,
            data: {
              name: data.name.trim(),
              description: data.description?.trim() || null,
              price: parseFloat(data.price?.trim() || "0"),
              sku: data.sku?.trim() || null,
              stock_quantity: data.stock_quantity?.trim()
                ? parseInt(data.stock_quantity.trim())
                : undefined,
              notes: data.notes,
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
        await createProduct(
          {
            user_id: user.id,
            enterprise_id: enterprise.id,
            name: data.name.trim(),
            description: data.description?.trim() || null,
            price: parseFloat(data.price?.trim() || "0"),
            sku: data.sku?.trim() || null,
            stock_quantity: data.stock_quantity?.trim()
              ? parseInt(data.stock_quantity.trim())
              : undefined,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save product:", error);
      toast.error(t("General.error_operation"), {
        description: t("Products.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).productForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
        <div className="form-container">
          <div className="form-fields-cols-2">
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Products.form.sku.label")}</FormLabel>
                  <FormControl>
                    <CodeInput
                      onSerial={() => {
                        const nextNumber = (products?.length || 0) + 1;
                        const paddedNumber = String(nextNumber).padStart(4, "0");
                        form.setValue("sku", `SKU-${paddedNumber}`);
                      }}
                      onRandom={() => {
                        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        let randomCode = "";
                        for (let i = 0; i < 5; i++) {
                          randomCode += randomChars.charAt(
                            Math.floor(Math.random() * randomChars.length),
                          );
                        }
                        form.setValue("sku", `SKU-${randomCode}`);
                      }}
                      inputProps={{
                        placeholder: t("Products.form.sku.placeholder"),
                        disabled: isLoading,
                        ...field,
                      }}
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
                      disabled={isLoading}
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
                    <Input type="number" min="0" placeholder="0" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <NotesSection
          inDialog={editMode}
          control={form.control}
          title={t("Products.form.notes.label")}
        />
      </form>
    </Form>
  );
}

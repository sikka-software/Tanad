import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { CurrencyInput } from "@/ui/currency-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import CodeInput from "@/components/ui/code-input";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateProduct, useUpdateProduct, useProducts } from "./product.hooks";
import useProductStore from "./product.store";
import { ProductUpdateData, ProductCreateData } from "./product.type";

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
    notes: z.any().optional().nullable(),
    stock_quantity: z
      .string()
      .min(1, t("Products.form.stock_quantity.required"))
      .refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
        t("Products.form.stock_quantity.invalid"),
      ),
  });

export type ProductFormValues = z.input<ReturnType<typeof createProductSchema>>;

export function ProductForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ProductUpdateData | ProductCreateData>) {
  const t = useTranslations();

  const { profile, membership } = useUserStore();
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();

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
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }
    if (!membership?.enterprise_id) {
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
              notes: data.notes?.trim() || null,
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
            name: data.name.trim(),
            description: data.description?.trim() || null,
            price: parseFloat(data.price?.trim() || "0"),
            sku: data.sku?.trim() || null,
            stock_quantity: data.stock_quantity?.trim()
              ? parseInt(data.stock_quantity.trim())
              : undefined,
            user_id: profile?.id || "",
            enterprise_id: membership.enterprise_id,
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
        <div className="form-container">
          <input type="submit" hidden />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    >
                      <Input
                        placeholder={t("Products.form.sku.placeholder")}
                        {...field}
                        disabled={isLoading}
                      />
                    </CodeInput>
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
        <NotesSection control={form.control} title={t("Products.form.notes.label")} />
      </form>
    </Form>
  );
}

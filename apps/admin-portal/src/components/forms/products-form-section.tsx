import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo, useCallback } from "react";
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";
import { useForm, useFieldArray, FormProvider, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/combobox-add";
import { FormField, FormItem, FormControl, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { useProducts } from "@/modules/product/product.hooks";
import useProductStore from "@/modules/product/product.store";

import { CurrencyInput } from "../ui/currency-input";
import { SARSymbol } from "../ui/sar-symbol";

// Define the shape of a single item - adjust if needed based on InvoiceFormValues
interface InvoiceItem {
  product_id?: string;
  description: string;
  quantity: string;
  unit_price: string;
}

// Define the props for the component
interface ProductFormSectionProps {
  control: Control<any>; // Use a more specific type if possible, e.g., Control<InvoiceFormValues>
  fields: FieldArrayWithId<any, "items", "id">[]; // Adjust 'any' based on your form values type
  append: UseFieldArrayAppend<any, "items">; // Adjust 'any'
  remove: UseFieldArrayRemove;
  onAddNewProduct: () => void;
  handleProductSelection: (index: number, productId: string) => void; // Function to handle product selection
  title: string;
  isLoading?: boolean;
}

export function ProductsFormSection({
  control,
  fields,
  append,
  remove,
  onAddNewProduct,
  handleProductSelection,
  title,
  isLoading = false,
}: ProductFormSectionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const form = useFormContext(); // Get form context if needed, or pass directly if required elsewhere
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const productOptions = useMemo(
    () =>
      productsData?.map((product) => ({
        label: `${product.name} (SAR ${product.price.toFixed(2)})`,
        value: product.id,
      })),
    [productsData],
  );

  return (
    <div>
      {/* Header similar to AddressFormSection */}
      <div className="bg-muted top-12 sticky z-10 flex !min-h-12 items-center justify-between gap-4 border-y border-b px-2">
        <h2 className="ms-2 text-xl font-bold">{title}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={
            () => append({ product_id: "", description: "", quantity: "1", unit_price: "0" }) // Use passed append function, ensure default value structure matches item type
          }
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 size-4" />
          {t("Invoices.products.add_product")}
        </Button>
      </div>

      {/* Table Section */}
      <div className="p-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Invoices.products.product")}</TableHead>
                <TableHead>{t("Invoices.products.quantity")}</TableHead>
                <TableHead>{t("Invoices.products.unit_price")}</TableHead>
                <TableHead>{t("Forms.description.label")}</TableHead>
                <TableHead>{t("Invoices.products.subtotal")}</TableHead>
                <TableHead></TableHead> {/* Action column header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length > 0 ? (
                fields.map((field, index) => {
                  // Watch values needed for subtotal calculation directly within the loop
                  const quantity = useWatch({ control, name: `items.${index}.quantity` });
                  const unitPrice = useWatch({ control, name: `items.${index}.unit_price` });
                  const subtotal =
                    quantity && unitPrice
                      ? (parseFloat(quantity || "0") * parseFloat(unitPrice || "0")).toFixed(2)
                      : "0.00";

                  return (
                    <TableRow key={field.id}>
                      {/* Product */}
                      <TableCell>
                        <FormField
                          control={control}
                          name={`items.${index}.product_id`}
                          render={({ field: formField }) => ( // Renamed to avoid conflict with outer 'field'
                            <FormItem className="space-y-0">
                              <FormControl>
                                <ComboboxAdd
                                  direction={locale === "ar" ? "rtl" : "ltr"}
                                  data={productOptions || []}
                                  disabled={isLoading}
                                  containerClassName="min-w-[150px] w-full"
                                  isLoading={productsLoading}
                                  defaultValue={formField.value}
                                  valueKey={"value"} // Use value from productOptions
                                  onChange={(value) => {
                                    formField.onChange(value || null);
                                    handleProductSelection(index, value);
                                  }}
                                  renderOption={(item) => (
                                    <div className="flex flex-col">
                                      <span>{item.label}</span>
                                    </div>
                                  )}
                                  texts={{
                                    placeholder: t("Invoices.products.select_product"),
                                    searchPlaceholder: t("Invoices.products.search_products"),
                                    noItems: t("Invoices.products.no_products_found"),
                                  }}
                                  addText={t("Invoices.products.add_new_product")}
                                  onAddClick={onAddNewProduct}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Quantity */}
                      <TableCell>
                        <FormField
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field: formField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  {...formField}
                                  className="w-24"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Unit Price */}
                      <TableCell>
                        <FormField
                          control={control}
                          name={`items.${index}.unit_price`}
                          render={({ field: formField }) => (
                            <FormItem className="max-w-[200px] space-y-0">
                              <FormControl>
                                <CurrencyInput
                                  showCommas={true}
                                  value={formField.value ? parseFloat(formField.value) : undefined}
                                  onChange={(value) => formField.onChange(value?.toString() || "")}
                                  placeholder={t("Invoices.products.unit_price.placeholder")}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <FormField
                          control={control}
                          name={`items.${index}.description`}
                          render={({ field: formField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  placeholder={t("Forms.description.placeholder")}
                                  {...formField}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* Subtotal */}
                      <TableCell>
                        <div className="flex flex-row items-center gap-1 text-right">
                          {subtotal}
                          <SARSymbol className="size-4" />
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="size-8 p-0"
                            disabled={isLoading}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("products.no_products")} {/* Ensure this translation key exists */}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo } from "react";
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
  FieldError,
} from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { CurrencyInput, MoneyFormatter } from "@/ui/currency-input";
import { FormField, FormItem, FormControl, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { useProducts } from "@/modules/product/product.hooks";
import useUserStore from "@/stores/use-user-store";

import FormSectionHeader from "./form-section-header";

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
  isError?: FieldError;
}

// --- Helper Types ---
type FormValues = any; // Replace 'any' with your actual form values type
// Define a minimal Product type needed here
interface Product {
  id: string;
  name: string;
  price: number;
  // Add other fields if necessary for handleProductSelection or other logic
}

// --- Product Row Component ---
interface ProductRowProps {
  field: FieldArrayWithId<FormValues, "items", "id">;
  index: number;
  control: Control<FormValues>;
  remove: UseFieldArrayRemove;
  locale: string;
  productOptions: { label: string; value: string; price?: number }[] | undefined;
  isLoading?: boolean;
  productsLoading?: boolean;
  productsData: Product[] | undefined;
  setValue: ReturnType<typeof useFormContext>["setValue"];
  handleProductSelection: (index: number, productId: string) => void;
  onAddNewProduct: () => void;
  t: ReturnType<typeof useTranslations>;
  canDelete: boolean;
}

const ProductRow: React.FC<ProductRowProps> = React.memo(
  ({
    field,
    index,
    control,
    remove,
    locale,
    productOptions,
    isLoading,
    productsLoading,
    productsData,
    setValue,
    handleProductSelection,
    onAddNewProduct,
    t,
    canDelete,
  }) => {
    const currency = useUserStore((state) => state.profile?.user_settings?.currency);
    const quantity = useWatch({ control, name: `items.${index}.quantity` });
    const unitPrice = useWatch({ control, name: `items.${index}.unit_price` });

    const subtotalNumber =
      typeof quantity === "number" && typeof unitPrice === "number" ? quantity * unitPrice : 0;
    const subtotal = subtotalNumber.toFixed(2);

    return (
      <TableRow key={field.id}>
        {/* Product */}
        <TableCell>
          <FormField
            control={control}
            name={`items.${index}.product_id`}
            render={({ field: formField }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <ComboboxAdd
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    data={productOptions || []}
                    disabled={isLoading}
                    containerClassName="min-w-[150px] w-full"
                    isLoading={productsLoading}
                    defaultValue={formField.value}
                    popoverClassName="w-full"
                    valueKey={"value"}
                    onChange={(value) => {
                      formField.onChange(value || null);
                      if (value && productsData) {
                        const selectedProduct = productsData.find((p) => p.id === value);
                        if (selectedProduct) {
                          setValue(`items.${index}.unit_price`, selectedProduct.price, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }
                      handleProductSelection(index, value as string);
                    }}
                    renderOption={(option) => (
                      <div className="flex w-full flex-row items-center justify-between gap-2">
                        <span>{option.label}</span>
                        <div className="flex flex-row items-center gap-1 text-sm text-gray-500">
                          <span>{MoneyFormatter(option.price)}</span>
                          {
                            getCurrencySymbol(currency || "sar", {
                              sarClassName: "!size-2.5",
                            }).symbol
                          }
                        </div>
                      </div>
                    )}
                    texts={{
                      placeholder: t("ProductsFormSection.select_product"),
                      searchPlaceholder: t("ProductsFormSection.search_products"),
                      noItems: t("ProductsFormSection.no_products_found"),
                    }}
                    addText={t("ProductsFormSection.add_new_product")}
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
                    value={formField.value}
                    onChange={(valueFromInput) => {
                      let numValue: number | undefined;
                      if (typeof valueFromInput === "string") {
                        numValue = parseFloat(valueFromInput);
                      } else if (typeof valueFromInput === "number") {
                        numValue = valueFromInput;
                      } else {
                        // Handles undefined, null, etc. by setting numValue to undefined effectively leading to NaN check
                        numValue = parseFloat(valueFromInput as any); // Let parseFloat produce NaN for undefined/null
                      }
                      formField.onChange(isNaN(numValue as number) ? undefined : numValue);
                    }}
                    placeholder={t("ProductsFormSection.unit_price.placeholder")}
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
                    placeholder={t("ProductsFormSection.description.placeholder")}
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
            {MoneyFormatter(subtotalNumber)}
            {getCurrencySymbol(currency || "sar").symbol}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell>
          {canDelete && (
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
  },
);
ProductRow.displayName = "ProductRow"; // Add display name for easier debugging

// --- Main Products Form Section Component ---

export function ProductsFormSection({
  control,
  fields,
  append,
  remove,
  onAddNewProduct,
  handleProductSelection,
  title,
  isLoading = false,
  isError,
}: ProductFormSectionProps) {
  const t = useTranslations();
  const { setValue } = useFormContext<FormValues>();
  const locale = useLocale();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const productOptions = useMemo(
    () =>
      productsData?.map((product) => ({
        label: product.name,
        value: product.id,
        price: product.price,
      })),
    [productsData],
  );

  return (
    <div>
      <FormSectionHeader
        title={title}
        onCreate={() =>
          append({ product_id: undefined, description: "", quantity: 1, unit_price: 0 })
        }
        onCreateText={t("ProductsFormSection.add_product")}
        onCreateDisabled={isLoading}
        isError={isError}
        onErrorText={t("ProductsFormSection.required")}
      />
      {/* Table Section */}
      <div className="p-4">
        <div className="overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ProductsFormSection.product")}</TableHead>
                <TableHead>{t("ProductsFormSection.quantity.label")}</TableHead>
                <TableHead>{t("ProductsFormSection.unit_price.label")}</TableHead>
                <TableHead>{t("ProductsFormSection.description.label")}</TableHead>
                <TableHead>{t("ProductsFormSection.subtotal")}</TableHead>
                <TableHead></TableHead> {/* Action column header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length > 0 ? (
                fields.map((field, index) => {
                  // Render the extracted row component
                  return (
                    <ProductRow
                      key={field.id} // Use stable key
                      field={field}
                      index={index}
                      control={control}
                      remove={remove}
                      locale={locale}
                      productOptions={productOptions}
                      isLoading={isLoading}
                      productsLoading={productsLoading}
                      productsData={productsData}
                      setValue={setValue}
                      handleProductSelection={handleProductSelection}
                      onAddNewProduct={onAddNewProduct}
                      t={t}
                      canDelete={fields.length > 1}
                    />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("ProductsFormSection.no_products")}{" "}
                    {/* Ensure this translation key exists */}
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

import { zodResolver } from "@hookform/resolvers/zod";
import { flexRender, getCoreRowModel, useReactTable, type Row } from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
// Added FormProvider and useFormContext
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
  const { data: products, isLoading: productsLoading } = useProducts();

  const productOptions = products?.map((product) => ({
    label: `${product.name} ($${product.price.toFixed(2)})`,
    value: product.id,
  }));

  // Define table columns for the products
  const columns = useMemo(
    () => [
      {
        id: "product",
        header: t("Invoices.products.product"),
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          return (
            <FormField
              control={control} // Use passed control
              name={`items.${index}.product_id`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <ComboboxAdd
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={productOptions || []}
                      disabled={isLoading}
                      containerClassName="min-w-[150px] w-full"
                      isLoading={productsLoading}
                      defaultValue={field.value}
                      valueKey={"id"}
                      // labelKey={"name"}
                      onChange={(value) => {
                        field.onChange(value || null);
                        handleProductSelection(index, value);
                      }}
                      renderOption={(item) => {
                        return (
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            {/* <span className="text-muted-foreground text-sm">{item.value}</span> */}
                          </div>
                        );
                      }}
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
          );
        },
      },
      {
        id: "quantity",
        header: t("Invoices.products.quantity"),
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          return (
            <FormField
              control={control} // Use passed control
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...field}
                      className="w-24"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        },
      },
      {
        id: "unit_price",
        header: t("Invoices.products.unit_price"),
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          return (
            <FormField
              control={control} // Use passed control
              name={`items.${index}.unit_price`}
              render={({ field }) => (
                <FormItem className="max-w-[200px] space-y-0">
                  <FormControl>
                    <CurrencyInput
                      showCommas={true}
                      value={field.value ? parseFloat(field.value) : undefined}
                      onChange={(value) => field.onChange(value?.toString() || "")}
                      placeholder={t("Invoices.products.unit_price.placeholder")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        },
      },
      {
        id: "description",
        header: t("Forms.description.label"),
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          return (
            <FormField
              control={control} // Use passed control
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      placeholder={t("Forms.description.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        },
      },
      {
        id: "subtotal",
        header: t("Invoices.products.subtotal"),
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          // Access form values directly using control if useFormContext is not used or reliable
          const quantity = control._getWatch(`items.${index}.quantity`);
          const unitPrice = control._getWatch(`items.${index}.unit_price`);
          const subtotal =
            quantity && unitPrice
              ? (parseFloat(quantity || "0") * parseFloat(unitPrice || "0")).toFixed(2)
              : "0.00";

          return (
            <div className="flex flex-row items-center gap-1 text-right">
              {subtotal}
              <SARSymbol className="size-4" />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<any> }) => {
          const index = row.index;
          return (
            fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)} // Use passed remove function
                className="size-8 p-0"
                disabled={isLoading}
              >
                <Trash2 className="size-4 text-red-500" />
              </Button>
            )
          );
        },
      },
    ],
    // Ensure dependencies cover all props and external states used within columns
    [
      control,
      productOptions,
      productsLoading,
      handleProductSelection,
      onAddNewProduct,
      t,
      fields.length, // Re-render columns if number of fields changes (for actions visibility)
      remove,
      isLoading,
    ],
  );

  // Set up the table
  const data = useMemo(() => fields.map((field, i) => ({ ...field, index: i })), [fields]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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

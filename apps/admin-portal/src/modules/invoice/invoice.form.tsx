import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { useForm, useFieldArray, FieldError, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import CodeInput from "@/ui/inputs/code-input";
import { DateInput } from "@/ui/inputs/date-input";
import NumberInput from "@/ui/inputs/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/components/forms/notes-section";
import ProductsFormSection from "@/components/forms/products-form-section";

import { getNotesValue, validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import ClientCombobox from "@/client/client.combobox";
import { useClients } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";

import { useInvoices } from "@/invoice/invoice.hooks";
import { useCreateInvoice, useUpdateInvoice } from "@/invoice/invoice.hooks";
import useInvoiceStore from "@/invoice/invoice.store";
import {
  InvoiceUpdateData,
  InvoiceCreateData,
  InvoiceItem,
  InvoiceStatus,
} from "@/invoice/invoice.type";

import { ProductForm } from "@/product/product.form";
import { useProducts } from "@/product/product.hooks";
import useProductStore from "@/product/product.store";

import { invoices } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createInvoiceSchema = (t: (key: string) => string) => {
  const InvoiceSelectSchema = createInsertSchema(invoices, {
    client_id: z
      .string({
        message: t("Invoices.form.client.required"),
      })
      .min(1, t("Invoices.form.client.required")),
    invoice_number: z.string().min(1, t("Invoices.form.invoice_number.required")),

    issue_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Invoices.form.issue_date.invalid")),
    due_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Invoices.form.due_date.invalid")),

    status: z.enum(InvoiceStatus, {
      message: t("Invoices.form.status.required"),
    }),
    subtotal: z.number().min(0, t("Invoices.form.subtotal.required")),
    tax_rate: z.number().min(0, t("Invoices.form.tax_rate.required")),
    notes: z.any().optional().nullable(),
  });

  const InvoiceItemsSchema = z
    .array(
      z.object({
        product_id: z.string().optional(),
        description: z.string(),
        quantity: z
          .number({ invalid_type_error: t("ProductsFormSection.quantity.invalid") })
          .min(1, t("ProductsFormSection.quantity.required")),
        unit_price: z
          .number({ invalid_type_error: t("ProductsFormSection.unit_price.invalid") })
          .min(0, t("ProductsFormSection.unit_price.required")),
      }),
    )
    .min(1, t("ProductsFormSection.items.required"))
    .refine(
      (items) => items.every((item) => item.description?.trim() !== "" || item.product_id),
      t("ProductsFormSection.items.required"),
    );

  return InvoiceSelectSchema.extend({
    items: InvoiceItemsSchema,
  });
};

export type InvoiceFormValues = z.input<ReturnType<typeof createInvoiceSchema>>;

export function InvoiceForm({
  formHtmlId,
  editMode,
  onSuccess,
  defaultValues,
  nestedForm,
}: ModuleFormProps<InvoiceUpdateData | InvoiceCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: updateInvoice } = useUpdateInvoice();

  const isSavingInvoice = useInvoiceStore((state) => state.isLoading);
  const setIsSavingInvoice = useInvoiceStore((state) => state.setIsLoading);

  const isSavingProduct = useProductStore((state) => state.isLoading);
  const setIsSavingProduct = useProductStore((state) => state.setIsLoading);

  const isSavingClient = useClientStore((state) => state.isLoading);
  const setIsSavingClient = useClientStore((state) => state.setIsLoading);

  const { data: invoices } = useInvoices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);

  const { data: products, isLoading: isFetchingProducts } = useProducts();
  const { data: clients, isLoading: isFetchingClients } = useClients();

  const formDefaultValues = {
    // ...defaultValues,
    client_id: defaultValues?.client_id || "",
    invoice_number: defaultValues?.invoice_number || "",
    issue_date: defaultValues?.issue_date ? new Date(defaultValues.issue_date) : undefined,
    due_date: defaultValues?.due_date ? new Date(defaultValues.due_date) : undefined,
    status: defaultValues?.status || "draft",
    subtotal: defaultValues?.subtotal || 0,
    tax_rate: defaultValues?.tax_rate || 0,
    notes: getNotesValue(defaultValues as any),
    items: defaultValues?.items
      ? (defaultValues.items as InvoiceItem[]).map((item) => ({
          product_id: item.product_id ?? "",
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      : [{ product_id: "", description: "", quantity: 1, unit_price: 0.0 }],
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema(t)),
    defaultValues: formDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
    defaultValue: form.getValues("items"),
  });

  const calculateSubtotal = useCallback((items: InvoiceFormValues["items"]) => {
    return items.reduce((sum, item) => {
      const quantity = item.quantity || 0;
      const price = item.unit_price || 0;
      const numericQuantity = Number(quantity);
      const numericPrice = Number(price);
      if (isNaN(numericQuantity) || isNaN(numericPrice)) {
        return sum;
      }
      return sum + numericQuantity * numericPrice;
    }, 0);
  }, []);

  useEffect(() => {
    const itemsToCalculate = Array.isArray(watchedItems) ? watchedItems : [];
    const newSubtotal = calculateSubtotal(itemsToCalculate);
    form.setValue("subtotal", newSubtotal, { shouldValidate: true, shouldDirty: true });
  }, [watchedItems, calculateSubtotal, form.setValue]);

  const handleProductSelection = (index: number, product_id: string) => {
    const selectedProduct = products?.find((product) => product.id === product_id);
    if (selectedProduct) {
      form.setValue(`items.${index}.unit_price`, selectedProduct.price);
      form.setValue(`items.${index}.description`, selectedProduct.description || "");
    }
  };

  const handleSubmit = async (data: InvoiceFormValues) => {
    setIsSavingInvoice(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsSavingInvoice(false);
      return;
    }

    const itemsPayload = data.items.map((item) => ({
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    try {
      if (editMode && defaultValues?.id) {
        const invoiceDataForUpdate = {
          id: defaultValues.id as string,
          client_id: data.client_id,
          invoice_number: data.invoice_number,
          issue_date: data.issue_date.toISOString(),
          due_date: data.due_date?.toISOString() || null,
          status: data.status,
          subtotal: data.subtotal,
          tax_rate: data.tax_rate,
          notes: data.notes || null,
          items: itemsPayload,
        };

        await updateInvoice(
          {
            id: defaultValues.id as string,
            data: invoiceDataForUpdate,
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
        await createInvoice(
          {
            client_id: data.client_id,
            invoice_number: data.invoice_number,
            issue_date: data.issue_date.toISOString(),
            due_date: data.due_date?.toISOString() || null,
            status: data.status,
            subtotal: data.subtotal,
            tax_rate: data.tax_rate,
            notes: data.notes || null,
            items: itemsPayload,
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
      console.error("Failed to save invoice:", error);
      toast.error(t("General.error_operation"), {
        description: editMode ? t("Invoices.error.update") : t("Invoices.error.create"),
      });
    } finally {
      setIsSavingInvoice(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).invoiceForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form
          id={formHtmlId || "invoice-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.status.label")} *</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Invoices.form.status.placeholder")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {InvoiceStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`Invoices.form.status.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.invoice_number.label")} *</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          const nextNumber = (invoices?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("invoice_number", `INV-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("invoice_number", `INV-${randomCode}`);
                        }}
                        inputProps={{
                          placeholder: t("Invoices.form.invoice_number.placeholder"),
                          disabled: isSavingInvoice,
                          ...field,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ClientCombobox
                formName="client_id"
                label={t("Invoices.form.client.label")}
                control={form.control}
                clients={clients || []}
                loadingCombobox={isFetchingClients}
                isSaving={isSavingClient}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
              />
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.tax_rate.label")} (%)</FormLabel>
                    <FormControl>
                      <NumberInput
                        disabled={isSavingInvoice}
                        placeholder={t("Forms.zip_code.placeholder")}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Invoices.form.issue_date.label")} *</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("Invoices.form.issue_date.placeholder")}
                        value={
                          typeof field.value === "string"
                            ? parseDate(field.value)
                            : (field.value ?? null)
                        }
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isSavingInvoice}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Invoices.form.due_date.label")} *</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("Invoices.form.due_date.placeholder")}
                        value={
                          typeof field.value === "string"
                            ? parseDate(field.value)
                            : (field.value ?? null)
                        }
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isSavingInvoice}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <ProductsFormSection
            control={form.control as any}
            fields={fields}
            append={append}
            remove={remove}
            onAddNewProduct={() => setIsNewProductDialogOpen(true)}
            handleProductSelection={handleProductSelection}
            title={t("ProductsFormSection.title")}
            isFetching={isFetchingProducts}
            isError={form.formState.errors.items as FieldError}
            disabled={isSavingInvoice}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Invoices.form.notes.label")}
          />
        </form>
      </Form>

      {/* <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Pages.Clients.add")}
        formId="client-form"
        cancelText={t("cancel")}
        submitText={t("save")}
        loadingSave={isClientSaving}
      >
        <ClientForm
          formHtmlId="client-form"
          nestedForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setIsClientSaving(false);
          }}
        />
      </FormDialog> */}
      <FormDialog
        open={isNewProductDialogOpen}
        onOpenChange={setIsNewProductDialogOpen}
        title={t("Pages.Products.add")}
        formId="product-form"
        cancelText={t("cancel")}
        submitText={t("save")}
        loadingSave={isSavingProduct}
      >
        <ProductForm
          formHtmlId="product-form"
          nestedForm
          onSuccess={() => {
            setIsNewProductDialogOpen(false);
            setIsSavingProduct(false);
          }}
        />
      </FormDialog>
    </>
  );
}

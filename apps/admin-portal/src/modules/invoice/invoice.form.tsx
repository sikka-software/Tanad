import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldError } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/components/forms/notes-section";
import { ProductsFormSection } from "@/components/forms/products-form-section";
import CodeInput from "@/components/ui/code-input";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { ClientForm } from "@/client/client.form";

import { useInvoices } from "@/modules/invoice/invoice.hooks";
import {
  InvoiceUpdateData,
  InvoiceCreateData,
  InvoiceItem,
  InvoiceStatus,
} from "@/modules/invoice/invoice.type";
import useUserStore from "@/stores/use-user-store";

import { useClients } from "../client/client.hooks";
import useClientStore from "../client/client.store";
import { useCreateInvoice, useUpdateInvoice } from "../invoice/invoice.hooks";
import useInvoiceStore from "../invoice/invoice.store";
import { ProductForm } from "../product/product.form";
import { useProducts } from "../product/product.hooks";
import useProductStore from "../product/product.store";

const createInvoiceSchema = (t: (key: string) => string) =>
  z.object({
    client_id: z.string().min(1, t("Invoices.form.client.required")),
    invoice_number: z.string().min(1, t("Invoices.form.invoice_number.required")),
    issue_date: z.date({
      required_error: t("Invoices.form.issue_date.required"),
    }),
    due_date: z.date({
      required_error: t("Invoices.form.due_date.required"),
    }),
    status: z.enum(InvoiceStatus, {
      message: t("Invoices.form.status.required"),
    }),
    subtotal: z.number().min(0, t("Invoices.form.subtotal.required")),
    tax_rate: z.number().min(0, t("Invoices.form.tax_rate.required")),
    notes: z.any().optional().nullable(),
    items: z
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
      ),
  });

export type InvoiceFormValues = z.infer<ReturnType<typeof createInvoiceSchema>>;

export function InvoiceForm({
  formHtmlId,
  editMode,
  onSuccess,
  defaultValues,
  nestedForm,
}: ModuleFormProps<InvoiceUpdateData | InvoiceCreateData>) {
  const t = useTranslations();
  const locale = useLocale();
  const { profile, membership } = useUserStore();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: updateInvoice } = useUpdateInvoice();

  const isProductSaving = useProductStore((state) => state.isLoading);
  const setIsProductSaving = useProductStore((state) => state.setIsLoading);

  const isClientSaving = useClientStore((state) => state.isLoading);
  const setIsClientSaving = useClientStore((state) => state.setIsLoading);

  const { data: invoices } = useInvoices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: clients, isLoading: clientsLoading } = useClients();

  const isLoading = useInvoiceStore((state) => state.isLoading);
  const setIsLoading = useInvoiceStore((state) => state.setIsLoading);

  const formDefaultValues = {
    client_id: defaultValues?.client_id || "",
    invoice_number: defaultValues?.invoice_number || "",
    issue_date: defaultValues?.issue_date
      ? new Date(defaultValues.issue_date as string)
      : new Date(),
    due_date: defaultValues?.due_date
      ? new Date(defaultValues.due_date as string)
      : new Date(new Date().setDate(new Date().getDate() + 30)),
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
      : [{ product_id: "", description: "", quantity: 1, unit_price: 0 }],
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema(t)),
    defaultValues: formDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Add this new function to calculate subtotal
  const calculateSubtotal = (items: InvoiceFormValues["items"]) => {
    return items.reduce((sum, item) => {
      const quantity = item.quantity || 0;
      const price = item.unit_price || 0;
      return sum + quantity * price;
    }, 0);
  };

  // Watch items and tax_rate for changes to update totals
  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("tax_rate");

  useEffect(() => {
    const subtotal = calculateSubtotal(watchedItems);
    form.setValue("subtotal", subtotal);
  }, [watchedItems, form]);

  const handleProductSelection = (index: number, product_id: string) => {
    const selectedProduct = products?.find((product) => product.id === product_id);
    if (selectedProduct) {
      form.setValue(`items.${index}.unit_price`, selectedProduct.price);
      form.setValue(`items.${index}.description`, selectedProduct.description || "");
    }
  };

  const handleSubmit = async (data: InvoiceFormValues) => {
    setIsLoading(true);
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).invoiceForm = form;
  }

  // Format clients for ComboboxAdd
  const clientOptions = clients?.map((client) => ({
    label: client.company ? `${client.name} (${client.company})` : client.name,
    value: client.id,
  }));

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId || "invoice-form"} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.client.label")} *</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={clientOptions || []}
                        isLoading={clientsLoading}
                        defaultValue={field.value}
                        onChange={(value) => field.onChange(value || null)}
                        texts={{
                          placeholder: t("Invoices.form.client.select_client"),
                          searchPlaceholder: t("Pages.Clients.search"),
                          noItems: t("Pages.Clients.no_clients_found"),
                        }}
                        addText={t("Pages.Clients.add")}
                        onAddClick={() => setIsDialogOpen(true)}
                      />
                    </FormControl>
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
                      >
                        <Input
                          placeholder={t("Invoices.form.invoice_number.placeholder")}
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
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.subtotal.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value.toFixed(2)}
                        readOnly
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.tax_rate.label")} (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
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
                name="issue_date"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.issue_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={value}
                        onSelect={onChange}
                        placeholder={t("Invoices.form.issue_date.placeholder")}
                        ariaInvalid={form.formState.errors.issue_date !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.due_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={value}
                        onSelect={onChange}
                        placeholder={t("Invoices.form.due_date.placeholder")}
                        ariaInvalid={form.formState.errors.due_date !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
          </div>

          <ProductsFormSection
            control={form.control as any}
            fields={fields}
            append={append}
            remove={remove}
            onAddNewProduct={() => setIsNewProductDialogOpen(true)}
            handleProductSelection={handleProductSelection}
            title={t("ProductsFormSection.title")}
            isLoading={isLoading}
            isError={form.formState.errors.items as FieldError}
          />
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Invoices.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
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
      </FormDialog>
      <FormDialog
        open={isNewProductDialogOpen}
        onOpenChange={setIsNewProductDialogOpen}
        title={t("Pages.Products.add")}
        formId="product-form"
        cancelText={t("cancel")}
        submitText={t("save")}
        loadingSave={isProductSaving}
      >
        <ProductForm
          formHtmlId="product-form"
          nestedForm
          onSuccess={() => {
            setIsNewProductDialogOpen(false);
            setIsProductSaving(false);
          }}
        />
      </FormDialog>
    </>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { createClient } from "@/utils/supabase/component";

import { ProductsFormSection } from "@/components/forms/products-form-section";
import CodeInput from "@/components/ui/code-input";

import { ModuleFormProps } from "@/types/common.type";

import { ClientForm } from "@/client/client.form";

import { useInvoices } from "@/modules/invoice/invoice.hooks";
import { Invoice } from "@/modules/invoice/invoice.type";
import useUserStore from "@/stores/use-user-store";

import { CompanyFormValues } from "../company/company.form";
import { useUpdateCompany } from "../company/company.hooks";
import { createCompany, updateCompany } from "../company/company.service";
import useCompanyStore from "../company/company.store";
import { useCreateInvoice, useUpdateInvoice } from "../invoice/invoice.hooks";
import useInvoiceStore from "../invoice/invoice.store";
import { ProductForm } from "../product/product.form";

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
    status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]),
    subtotal: z.number().min(0, t("Invoices.form.subtotal.required")),
    tax_rate: z.number().min(0, t("Invoices.form.tax_rate.required")),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          product_id: z.string().optional(),
          description: z.string(),
          quantity: z
            .string()
            .min(1, t("Invoices.form.quantity.required"))
            .refine(
              (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
              t("Invoices.form.quantity.required"),
            ),
          unit_price: z
            .string()
            .min(1, t("Invoices.form.price.required"))
            .refine(
              (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
              t("Invoices.form.price.required"),
            ),
        }),
      )
      .min(1, t("Invoices.form.items.required"))
      .refine(
        (items) => items.every((item) => item.description?.trim() !== "" || item.product_id),
        t("Invoices.form.items.required"),
      ),
  });

export type InvoiceFormValues = z.infer<ReturnType<typeof createInvoiceSchema>>;

export function InvoiceForm({ id, editMode, onSuccess, defaultValues }: ModuleFormProps<Invoice>) {
  const t = useTranslations();
  const locale = useLocale();
  const { profile, membership } = useUserStore();
  const { mutateAsync: createInvoice, isPending: isCreating } = useCreateInvoice();
  const { mutateAsync: updateInvoice, isPending: isUpdating } = useUpdateInvoice();

  const supabase = createClient();
  const router = useRouter();
  const { data: invoices } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [user_id, setuser_id] = useState<string | undefined>();
  const [productsLoading, setProductsLoading] = useState(true);

  const isLoading = useInvoiceStore((state) => state.isLoading);
  const setIsLoading = useInvoiceStore((state) => state.setIsLoading);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema(t)),
    defaultValues: {
      client_id: "",
      invoice_number: "",
      issue_date: new Date(),
      due_date: undefined,
      status: "draft",
      subtotal: 0,
      tax_rate: 0,
      notes: "",
      items: [{ product_id: "", description: "", quantity: "1", unit_price: "0" }],
    },
  });

  useEffect(() => {
    // Get the current user ID and fetch clients
    const getClients = async () => {
      setClientsLoading(true);

      // Get user ID
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setuser_id(userData.user.id);
      }

      // Fetch clients
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, company")
          .order("name");

        if (error) throw error;

        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error(t("General.error_operation"), {
          description: t("General.error_load_clients"),
        });
      } finally {
        setClientsLoading(false);
      }
    };

    getClients();
  }, [t]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Add this new function to calculate subtotal
  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + quantity * price;
    }, 0);
  };

  // Watch items and tax_rate for changes to update totals
  const items = form.watch("items");
  const tax_rate = form.watch("tax_rate");

  useEffect(() => {
    const subtotal = calculateSubtotal(items);
    form.setValue("subtotal", subtotal);
  }, [items, form]);

  const handleProductSelection = (index: number, product_id: string) => {
    const selectedProduct = products.find((product) => product.id === product_id);
    if (selectedProduct) {
      form.setValue(`items.${index}.unit_price`, selectedProduct.price.toString());
      form.setValue(`items.${index}.description`, selectedProduct.description || "");
    }
  };

  // Format clients for ComboboxAdd
  const clientOptions = clients.map((client) => ({
    label: client.company ? `${client.name} (${client.company})` : client.name,
    value: client.id,
  }));

  const handleSubmit = async (data: InvoiceFormValues) => {
    setIsLoading(true);
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Company ID missing in edit mode");
          toast.error(t("Companies.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateInvoice(
          {
            id: defaultValues.id,
            data: {
              client_id: data.client_id,
              invoice_number: data.invoice_number,
              issue_date: data.issue_date,
              due_date: data.due_date,
              status: data.status,
              subtotal: data.subtotal,
              tax_rate: data.tax_rate,
              notes: data.notes,
              items: data.items,
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
        await createInvoice(
          {
            user_id: profile?.id || "",
            client_id: data.client_id,
            invoice_number: data.invoice_number,
            issue_date: data.issue_date,
            due_date: data.due_date,
            status: data.status,
            subtotal: data.subtotal,
            tax_rate: data.tax_rate,
            notes: data.notes,
            items: data.items,
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
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: t("Companies.error.creating"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).invoiceForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={id || "invoice-form"} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoices.form.client.label")} *</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        data={clientOptions}
                        isLoading={clientsLoading}
                        defaultValue={field.value}
                        onChange={(value) => field.onChange(value || null)}
                        texts={{
                          placeholder: t("Invoices.form.client.select_client"),
                          searchPlaceholder: t("Invoices.form.client.search_clients"),
                          noItems: t("Invoices.form.client.no_clients"),
                        }}
                        addText={t("Invoices.form.client.add_new_client")}
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
                          disabled={loading}
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
                      <SelectItem value="draft">{t("Invoices.form.status.draft")}</SelectItem>
                      <SelectItem value="pending">{t("Invoices.form.status.pending")}</SelectItem>
                      <SelectItem value="paid">{t("Invoices.form.status.paid")}</SelectItem>
                      <SelectItem value="overdue">{t("Invoices.form.status.overdue")}</SelectItem>
                      <SelectItem value="cancelled">
                        {t("Invoices.form.status.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Invoices.form.notes.label")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("Invoices.form.notes.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Use the new ProductFormSection component */}
          <ProductsFormSection
            control={form.control}
            fields={fields}
            append={append}
            remove={remove}
            onAddNewProduct={() => setIsNewProductDialogOpen(true)}
            handleProductSelection={handleProductSelection}
            title={t("Invoices.products.title")}
            isLoading={loading}
          />
          {/* <div className="mt-4 text-right">
            <div className="text-sm text-gray-600">
              Tax Amount: ${((form.watch("subtotal") * form.watch("tax_rate")) / 100).toFixed(2)}
            </div>
            <div className="text-lg font-semibold">
              Total: $
              {(
                form.watch("subtotal") +
                (form.watch("subtotal") * form.watch("tax_rate")) / 100
              ).toFixed(2)}
            </div>
          </div> */}
        </form>
      </Form>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Clients.add_new")}
        formId="client-form"
        cancelText={t("cancel")}
        submitText={t("save")}
      >
        <ClientForm id="client-form" />
      </FormDialog>
      <FormDialog
        open={isNewProductDialogOpen}
        onOpenChange={setIsNewProductDialogOpen}
        title={t("Products.add_new")}
        formId="product-form"
        cancelText={t("cancel")}
        submitText={t("save")}
      >
        <ProductForm id="product-form" />
      </FormDialog>
    </>
  );
}

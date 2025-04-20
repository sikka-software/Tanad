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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

import { ClientForm } from "@/modules/client/client.form";
import { createClient } from "@/utils/supabase/component";

const createInvoiceSchema = (t: (key: string) => string) =>
  z.object({
    client_id: z.string().min(1, t("Invoices.form.client_id.required")),
    invoice_number: z.string().min(1, t("Invoices.form.invoice_number.required")),
    issue_date: z.date({
      required_error: t("Invoices.form.issue_date.required"),
    }),
    due_date: z.date({
      required_error: t("Invoices.form.due_date.required"),
    }),
    status: z.string().min(1, t("Invoices.form.status.required")),
    subtotal: z.number().min(0, t("Invoices.form.subtotal.required")),
    tax_rate: z.number().min(0, t("Invoices.form.tax_rate.required")),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          product_id: z.string().optional(),
          description: z.string().min(1, t("Invoices.form.description.required")),
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

interface InvoiceFormProps {
  id?: string;
  loading?: boolean;
  onSubmit: (data: InvoiceFormValues) => Promise<void>;
}

export function InvoiceForm({ id, loading: externalLoading, onSubmit }: InvoiceFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(externalLoading || false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [user_id, setuser_id] = useState<string | undefined>();
  const [clientsLoading, setClientsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const t = useTranslations("Invoices");
  const locale = useLocale();

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
        toast.error(t("error.load_clients"));
      } finally {
        setClientsLoading(false);
      }
    };

    getClients();
  }, [t]);

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price")
          .order("name");

        if (error) throw error;

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  // const handleClientAdded = async () => {
  //   // Close the dialog
  //   setIsDialogOpen(false);

  //   // Refresh the clients list
  //   try {
  //     const { data, error } = await supabase
  //       .from("clients")
  //       .select("id, name, company")
  //       .order("name");

  //     if (error) throw error;

  //     setClients(data || []);

  //     // Show success message
  //     toast.success(t("General.successful_operation"), {
  //       description: t("client_added"),
  //     });
  //   } catch (error) {
  //     console.error("Error refreshing clients:", error);
  //   }
  // };

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

  // Format products for ComboboxAdd
  const productOptions = products.map((product) => ({
    label: `${product.name} ($${parseFloat(product.price).toFixed(2)})`,
    value: product.id,
  }));

  // Define table columns for the products
  const columns = useMemo(
    () => [
      {
        id: "product",
        header: t("products.product"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.product_id`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <ComboboxAdd
                      data={productOptions}
                      isLoading={productsLoading}
                      defaultValue={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleProductSelection(index, value);
                      }}
                      texts={{
                        placeholder: t("products.select_product"),
                        searchPlaceholder: t("products.search_products"),
                        noItems: t("products.no_products_found"),
                      }}
                      addText={t("products.add_new_product")}
                      onAddClick={() => setIsNewProductDialogOpen(true)}
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
        header: t("products.quantity"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input type="number" min="1" step="1" {...field} className="w-24" />
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
        header: t("products.unit_price"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.unit_price`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      className="w-32"
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
        header: t("description"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input placeholder={t("products.product_description")} {...field} />
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
        header: t("products.subtotal"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <div className="text-right">
              $
              {form.watch(`items.${index}.quantity`) && form.watch(`items.${index}.unit_price`)
                ? (
                    parseFloat(form.watch(`items.${index}.quantity`) || "0") *
                    parseFloat(form.watch(`items.${index}.unit_price`) || "0")
                  ).toFixed(2)
                : "0.00"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )
          );
        },
      },
    ],
    [form, fields, productOptions, productsLoading, handleProductSelection, remove],
  );

  // Set up the table
  const data = useMemo(() => fields.map((_, i) => ({ index: i })), [fields]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Form {...form}>
        <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("client")} *</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      data={clientOptions}
                      isLoading={clientsLoading}
                      defaultValue={field.value}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("select_client"),
                        searchPlaceholder: t("search_clients"),
                        noItems: t("no_clients"),
                      }}
                      addText={t("add_new_client")}
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
                  <FormLabel>{t("invoice_number")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enter_invoice_number")} {...field} />
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
                  <FormLabel>{t("subtotal")}</FormLabel>
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
                  <FormLabel>{t("tax_rate")} (%)</FormLabel>
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
                  <FormLabel>{t("issue_date")} *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={value}
                      onSelect={onChange}
                      placeholder={t("select_issue_date")}
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
                  <FormLabel>{t("due_date")} *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={value}
                      onSelect={onChange}
                      placeholder={t("select_due_date")}
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
                <FormLabel>{t("status")} *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_status")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">{t("status.draft")}</SelectItem>
                    <SelectItem value="pending">{t("status.pending")}</SelectItem>
                    <SelectItem value="paid">{t("status.paid")}</SelectItem>
                    <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
                    <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Products Section with Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("products.title")}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ product_id: "", description: "", quantity: "1", unit_price: "" })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("products.add_product")}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
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
                        {t("products.no_products")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notes")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("enter_notes")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 text-right">
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
          </div>
        </form>
      </Form>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("add_new_client")}
        formId="client-form"
        cancelText={t("cancel")}
        submitText={t("save")}
      >
        <ClientForm id="client-form" />
      </FormDialog>

      <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("products.add_new_product")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormLabel>{t("products.name")} *</FormLabel>
                <Input id="name" placeholder={`${t("products.name")}...`} />
              </div>
              <div>
                <FormLabel>{t("price")} *</FormLabel>
                <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <FormLabel>{t("stock_quantity")}</FormLabel>
                <Input id="stock_quantity" type="number" min="0" step="1" placeholder="0" />
              </div>
              <div className="col-span-2">
                <FormLabel>{t("description")}</FormLabel>
                <Textarea id="description" placeholder={t("products.product_description")} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setIsNewProductDialogOpen(false)}
                variant="outline"
                className="mr-2"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // In a real implementation, this would save the product
                  toast.info("Product creation functionality not yet implemented");
                  setIsNewProductDialogOpen(false);
                }}
              >
                {t("products.save_product")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

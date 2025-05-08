import { zodResolver } from "@hookform/resolvers/zod";
import FormSectionHeader from "@root/src/components/forms/form-section-header";
import NotesSection from "@root/src/components/forms/notes-section";
import { getNotesValue } from "@root/src/lib/utils";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { createClient } from "@/utils/supabase/component";

import { ModuleFormProps } from "@/types/common.type";

import { ClientForm, type ClientFormValues } from "@/client/client.form";
import { Client } from "@/client/client.type";

import { Product } from "@/product/product.type";

import useUserStore from "@/stores/use-user-store";

import { QuoteCreateData, QuoteUpdateData } from "./quote.type";

export interface QuoteItem {
  product_id?: string;
  description: string;
  quantity: string;
  unit_price: string;
}

export interface QuoteFormValues {
  client_id: string;
  quote_number: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  tax_rate: number;
  subtotal?: number;
  notes?: string | null;
  items: QuoteItem[];
}

export function QuoteForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<QuoteUpdateData | QuoteCreateData>) {
  const supabase = createClient();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useUserStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const quoteSchema = z.object({
    client_id: z.string().min(1, t("Quotes.validation.client_required")),
    quote_number: z.string().min(1, t("Quotes.validation.quote_number_required")),
    issue_date: z.string().min(1, t("Quotes.validation.issue_date_required")),
    expiry_date: z.string().min(1, t("Quotes.validation.expiry_date_required")),
    status: z.string().min(1, t("Quotes.validation.status_required")),
    tax_rate: z.number().min(0, t("Quotes.validation.tax_rate_positive")),
    notes: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          product_id: z.string().optional(),
          description: z.string().min(1, t("Quotes.validation.item_description_required")),
          quantity: z
            .string()
            .min(1, t("Quotes.validation.item_quantity_required"))
            .refine(
              (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
              t("Quotes.validation.item_quantity_positive"),
            ),
          unit_price: z
            .string()
            .min(1, t("Quotes.validation.item_price_required"))
            .refine(
              (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
              t("Quotes.validation.item_price_positive"),
            ),
        }),
      )
      .min(1, t("Quotes.validation.items_required"))
      .refine(
        (items) => items.every((item) => item.description?.trim() !== "" || item.product_id),
        t("Quotes.validation.item_description_or_product"),
      ),
  });

  const form = useForm<z.input<typeof quoteSchema>>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      client_id: defaultValues?.client_id || "",
      quote_number: defaultValues?.quote_number || "",
      issue_date: defaultValues?.issue_date || "",
      expiry_date: defaultValues?.expiry_date || "",
      status: defaultValues?.status || "draft",
      tax_rate: defaultValues?.tax_rate || 0,
      notes: getNotesValue(defaultValues),
      items: defaultValues?.items || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items") || [];
  const tax_rate = form.watch("tax_rate") || 0;

  const subtotal = items.reduce((acc: number, item: QuoteItem) => {
    const quantity = parseFloat(item.quantity || "0");
    const unit_price = parseFloat(item.unit_price || "0");
    return acc + quantity * unit_price;
  }, 0);

  const tax = (subtotal * tax_rate) / 100;
  const total = subtotal + tax;

  useEffect(() => {
    // Get the current user ID and fetch clients
    const getClients = async () => {
      setClientsLoading(true);

      // Fetch clients with all fields and company details
      try {
        const { data, error } = await supabase
          .from("clients")
          .select(
            `
            *,
            company_details:companies (name)
          `,
          )
          .order("name");

        if (error) throw error;

        setClients(data as Client[]);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error(t("Quotes.error.load_clients"));
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
        const { data, error } = await supabase.from("products").select("*").order("name");

        if (error) throw error;

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(t("Quotes.error.load_products"));
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate subtotal whenever items change
  useEffect(() => {
    const calculateSubtotal = () => {
      const subtotal = items.reduce((acc: number, item: QuoteItem) => {
        const quantity = parseFloat(item.quantity || "0");
        const unit_price = parseFloat(item.unit_price || "0");
        return acc + quantity * unit_price;
      }, 0);
    };

    calculateSubtotal();
  }, [items]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: `${client.name}`,
      })),
    [clients],
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
        description: product.description,
        price: product.price,
      })),
    [products],
  );

  const handleClientAdded = async (data: ClientFormValues) => {
    try {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert([
          {
            ...data,
            user_id: user?.id,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      setClients((prev) => [...prev, newClient]);
      form.setValue("client_id", newClient.id);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(t("Quotes.error.create_client"));
    }
  };

  const handleProductSelection = (index: number, product_id: string) => {
    const product = products.find((p) => p.id === product_id);
    if (product) {
      form.setValue(`items.${index}.description`, product.description || "");
      form.setValue(`items.${index}.unit_price`, product.price.toString());
    }
  };

  const calculateSubtotal = (items: QuoteItem[]) => {
    return items.reduce((acc: number, item: QuoteItem) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unit_price = parseFloat(item.unit_price) || 0;
      return acc + quantity * unit_price;
    }, 0);
  };

  // Define table columns for the products
  const columns = useMemo(
    () => [
      {
        id: "product",
        header: t("Quotes.products.product"),
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
                        placeholder: t("Quotes.products.select_product"),
                        searchPlaceholder: t("Quotes.products.search_products"),
                        noItems: t("Quotes.products.no_products_found"),
                      }}
                      addText={t("Quotes.products.add_new_product")}
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
        header: t("Quotes.products.quantity"),
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
        header: t("Quotes.products.unit_price"),
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
        header: t("Quotes.products.description"),
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input placeholder={t("Quotes.products.product_description")} {...field} />
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
        header: t("Quotes.products.subtotal"),
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
    [form, fields, productOptions, productsLoading, handleProductSelection, remove, t],
  );

  // Set up the table
  const data = useMemo(() => fields.map((_, i) => ({ index: i })), [fields]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Remove the subtotal form field since it's calculated
  const SubtotalDisplay = () => (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium">{t("Quotes.products.subtotal")}</span>
      <Input type="text" value={`${subtotal.toFixed(2)}`} readOnly disabled />
    </div>
  );

  const handleSubmit = (data: QuoteFormValues) => {
    const formattedData: QuoteFormValues = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };
    console.log(data);
  };

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.client.label")} *</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        data={clientOptions}
                        isLoading={clientsLoading}
                        defaultValue={field.value}
                        onChange={(value) => field.onChange(value || null)}
                        renderOption={(option) => {
                          return (
                            <div className="flex items-center gap-2">
                              <span>{option.label}</span>
                              <span className="text-sm text-gray-500">{option.description}</span>
                            </div>
                          );
                        }}
                        texts={{
                          placeholder: t("Quotes.form.client.placeholder"),
                          searchPlaceholder: t("Quotes.clients.search_clients"),
                          noItems: t("Quotes.clients.no_clients"),
                        }}
                        addText={t("Clients.add_new")}
                        onAddClick={() => setIsDialogOpen(true)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quote_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.quote_number.label")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Quotes.form.quote_number.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SubtotalDisplay />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.tax_rate")}</FormLabel>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.issue_date.label")} *</FormLabel>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                      }
                      placeholder={t("Quotes.form.issue_date.placeholder")}
                      ariaInvalid={form.formState.errors.issue_date !== undefined}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.expiry_date.label")} *</FormLabel>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                      }
                      placeholder={t("Quotes.form.expiry_date.placeholder")}
                      ariaInvalid={form.formState.errors.expiry_date !== undefined}
                    />
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
                  <FormLabel>{t("Quotes.form.status.title")} *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Quotes.form.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">{t("Quotes.form.status.draft")}</SelectItem>
                      <SelectItem value="sent">{t("Quotes.form.status.sent")}</SelectItem>
                      <SelectItem value="accepted">{t("Quotes.form.status.accepted")}</SelectItem>
                      <SelectItem value="rejected">{t("Quotes.form.status.rejected")}</SelectItem>
                      <SelectItem value="expired">{t("Quotes.form.status.expired")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormSectionHeader title={t("Quotes.form.header")} />
          <div className="form-container">
            {/* Products Section with Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t("Quotes.products.title")}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ product_id: "", description: "", quantity: "1", unit_price: "" })
                  }
                >
                  <PlusCircle className="me-2 h-4 w-4" />
                  {t("Quotes.products.add_product")}
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
                          {t("Quotes.products.no_products")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between md:col-start-2">
                <span className="text-sm font-medium">{t("Quotes.subtotal")}</span>
                <span className="text-sm">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between md:col-start-2">
                <span className="text-sm font-medium">{t("Quotes.tax")}</span>
                <span className="text-sm">${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between md:col-start-2">
                <span className="text-sm font-medium">{t("Quotes.total")}</span>
                <span className="text-sm font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <NotesSection control={form.control} title={t("Quotes.notes")} />
        </form>
      </Form>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Clients.add_new")}
        formId="client-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
      >
        <ClientForm formHtmlId="client-form" />
      </FormDialog>
    </>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import FormSectionHeader from "@root/src/components/forms/form-section-header";
import NotesSection from "@root/src/components/forms/notes-section";
import { getNotesValue } from "@root/src/lib/utils";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FieldError, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/combobox-add";
import { CurrencyInput } from "@/ui/currency-input";
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

import {
  QuoteCreateData,
  QuoteUpdateData,
  QuoteItem as DbQuoteItem,
  QuoteItemClientData,
  Quote as FetchedQuoteData,
} from "./quote.type";
import { ProductsFormSection } from "@root/src/components/forms/products-form-section";

const createQuoteFormSchema = (t: (key: string) => string) =>
  z.object({
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
            .number({ invalid_type_error: t("Quotes.validation.item_quantity_invalid") })
            .min(1, t("Quotes.validation.item_quantity_positive")),
          unit_price: z
            .number({ invalid_type_error: t("Quotes.validation.item_price_invalid") })
            .min(0, t("Quotes.validation.item_price_positive")),
          id: z.string().optional(),
        }),
      )
      .min(1, t("Quotes.validation.items_required")),
  });

export type QuoteFormValues = z.input<ReturnType<typeof createQuoteFormSchema>>;

export function QuoteForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<FetchedQuoteData | QuoteCreateData | QuoteUpdateData>) {
  const supabase = createClient();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { profile, membership, enterprise } = useUserStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(createQuoteFormSchema(t)),
    defaultValues: {
      client_id: defaultValues?.client_id || "",
      quote_number: defaultValues?.quote_number || "",

      issue_date: defaultValues?.issue_date || format(new Date(), "yyyy-MM-dd"),
      expiry_date:
        defaultValues?.expiry_date ||
        format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
      status: (defaultValues?.status as QuoteFormValues["status"]) || "draft",
      tax_rate: defaultValues?.tax_rate ?? 0,
      notes: getNotesValue(defaultValues as any),
      items:
        defaultValues && "items" in defaultValues && defaultValues.items
          ? (defaultValues.items as DbQuoteItem[]).map((item) => ({
              product_id: item.product_id ?? undefined,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              id: item.id,
            }))
          : [{ product_id: undefined, description: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items") || [];
  const watchedTaxRate = form.watch("tax_rate") || 0;

  const subtotal = useMemo(() => {
    return watchedItems.reduce((acc: number, item: QuoteFormValues["items"][number]) => {
      const quantity = item.quantity || 0;
      const unit_price = item.unit_price || 0;
      return acc + quantity * unit_price;
    }, 0);
  }, [watchedItems]);

  const tax = (subtotal * watchedTaxRate) / 100;
  const total = subtotal + tax;

  useEffect(() => {
    const getClients = async () => {
      setClientsLoading(true);
      try {
        const { data, error } = await supabase.from("clients").select("*").order("name");
        if (error) throw error;
        setClients((data as Client[]) || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error(t("Quotes.error.load_clients"));
      } finally {
        setClientsLoading(false);
      }
    };
    getClients();
  }, [supabase, t]);

  useEffect(() => {
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
  }, [supabase, t]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: `${client.name}${client.company ? ` (${client.company})` : ""}`,
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
    if (!profile?.id) return toast.error(t("Authentication.login_required"));
    try {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert([{ ...data, user_id: profile.id }])
        .select("*")
        .single();
      if (error) throw error;
      if (newClient) {
        setClients((prev) => [...prev, newClient as Client]);
        form.setValue("client_id", newClient.id);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(t("Quotes.error.create_client"));
    }
  };

  const handleProductSelection = (index: number, product_id: string | undefined) => {
    if (!product_id) return;
    const product = products.find((p) => p.id === product_id);
    if (product) {
      form.setValue(`items.${index}.description`, product.description || "");
      form.setValue(`items.${index}.unit_price`, product.price);
    }
  };

  const columns = useMemo<ColumnDef<QuoteFormValues["items"][number] & { index: number }>[]>(
    () => [
      {
        accessorKey: "product_id",
        header: t("Quotes.products.product"),
        cell: ({ row }) => {
          const index = row.original.index;
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
                        handleProductSelection(index, value as string | undefined);
                      }}
                      texts={{
                        placeholder: t("Quotes.products.select_product"),
                        searchPlaceholder: t("Quotes.products.search_products"),
                        noItems: t("Quotes.products.no_products_found"),
                      }}
                      addText={t("Quotes.products.add_new_product")}
                      onAddClick={() => setIsNewProductDialogOpen(true)}
                      containerClassName="w-full min-w-[150px]"
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
        accessorKey: "quantity",
        header: t("Quotes.products.quantity"),
        cell: ({ row }) => {
          const index = row.original.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-24"
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
        accessorKey: "unit_price",
        header: t("Quotes.products.unit_price"),
        cell: ({ row }) => {
          const index = row.original.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.unit_price`}
              render={({ field }) => (
                <FormItem className="max-w-[150px] space-y-0">
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={(inputValue) => {
                        let numericValue: number | undefined;
                        if (typeof inputValue === "string") {
                          numericValue = parseFloat(inputValue);
                        } else if (typeof inputValue === "number") {
                          numericValue = inputValue;
                        } else {
                          numericValue = undefined;
                        }
                        field.onChange(isNaN(numericValue as number) ? undefined : numericValue);
                      }}
                      placeholder="0.00"
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
        accessorKey: "description",
        header: t("Quotes.products.description"),
        cell: ({ row }) => {
          const index = row.original.index;
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
        cell: ({ row }) => {
          const item = row.original;
          const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
          return <div className="text-right">{itemSubtotal.toFixed(2)}</div>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const index = row.original.index;
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
    [
      form.control,
      productOptions,
      productsLoading,
      handleProductSelection,
      remove,
      t,
      fields.length,
    ],
  );

  const tableData = useMemo(() => fields.map((field, index) => ({ ...field, index })), [fields]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSubmit = async (formData: QuoteFormValues) => {
    if (!profile?.id || !membership?.enterprise_id) {
      toast.error(t("Authentication.login_required_enterprise"));
      return;
    }

    const itemsToSubmitForCreate: QuoteItemClientData[] = formData.items.map((item) => ({
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const itemsToSubmitForUpdate: (QuoteItemClientData & { id?: string })[] = formData.items.map(
      (item) => ({
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        ...(item.id && { id: item.id }),
      }),
    );

    try {
      if (editMode && defaultValues && "id" in defaultValues && defaultValues.id) {
        const updatePayload: QuoteUpdateData = {
          id: defaultValues.id,
          client_id: formData.client_id,
          quote_number: formData.quote_number,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          user_id: profile.id,
          enterprise_id: membership.enterprise_id,
          items: itemsToSubmitForUpdate,
        };
        // TODO: Implement actual API call
        // await updateQuoteMutation.mutateAsync(updatePayload);
        console.log("Update Payload:", updatePayload);
        toast.success(t("Quotes.success.updated"));
      } else {
        const createPayload: QuoteCreateData = {
          client_id: formData.client_id,
          quote_number: formData.quote_number,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          user_id: profile.id,
          enterprise_id: membership.enterprise_id,
          items: itemsToSubmitForCreate,
        };
        // TODO: Implement actual API call
        // await createQuoteMutation.mutateAsync(createPayload);
        console.log("Create Payload:", createPayload);
        toast.success(t("Quotes.success.created"));
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving quote:", err);
      toast.error(t("Quotes.error.save"));
    }
    console.log("Form Data:", formData);
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
              <div>
                <FormLabel>{t("Quotes.products.subtotal")}</FormLabel>
                <Input type="text" value={subtotal.toFixed(2)} readOnly disabled />
              </div>

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
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                        }
                        placeholder={t("Quotes.form.issue_date.placeholder")}
                        aria-invalid={form.formState.errors.issue_date !== undefined}
                      />
                    </FormControl>
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
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                        }
                        placeholder={t("Quotes.form.expiry_date.placeholder")}
                        aria-invalid={form.formState.errors.expiry_date !== undefined}
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

          <ProductsFormSection
            control={form.control}
            fields={fields}
            append={append}
            remove={remove}
            onAddNewProduct={() => setIsNewProductDialogOpen(true)}
            handleProductSelection={handleProductSelection}
            title={t("Quotes.products.title")}
            isLoading={productsLoading}
            isError={form.formState.errors.items as FieldError}
          />
          {/* <FormSectionHeader
            title={t("Quotes.products.title")}
            onCreate={() =>
              append({ product_id: undefined, description: "", quantity: 1, unit_price: 0 })
            }
            onCreateText={t("Quotes.products.add_product")}
          />
          <div className="form-container">
            <div className="space-y-2">
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

            <div className="mt-4 grid gap-2 md:grid-cols-3 md:justify-items-end">
              <div className="flex items-center justify-between md:col-span-1 md:col-start-3">
                <span className="text-sm font-medium">{t("Quotes.subtotal")}</span>
                <span className="text-sm">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between md:col-span-1 md:col-start-3">
                <span className="text-sm font-medium">
                  {t("Quotes.tax")} ({watchedTaxRate}%)
                </span>
                <span className="text-sm">${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between md:col-span-1 md:col-start-3">
                <span className="text-sm font-medium">{t("Quotes.total")}</span>
                <span className="text-sm font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div> */}
          <NotesSection control={form.control} title={t("Quotes.notes")} />
        </form>
      </Form>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Clients.add_new")}
        formId="client-form-quote"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
      >
        <ClientForm
          formHtmlId="client-form-quote"
          onSuccess={(newClientData?: Client) => {
            if (newClientData && newClientData.id) {
              setClients((prevClients) => [...prevClients, newClientData]);
              form.setValue("client_id", newClientData.id);
              setIsDialogOpen(false);
              toast.success(t("Quotes.success.client_added"));
            } else {
              setIsDialogOpen(false);
              toast.info(t("Quotes.info.client_added_refresh_manually"));
            }
          }}
        />
      </FormDialog>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ComboboxAdd } from "@/components/ui/combobox-add";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

import { ClientForm } from "./client-form";

const quoteSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  quote_number: z.string().min(1, "Quote number is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  status: z.string().min(1, "Status is required"),
  subtotal: z.number().min(0, "Subtotal must be a positive number"),
  tax_rate: z.number().min(0, "Tax rate must be a positive number"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z
          .string()
          .min(1, "Quantity is required")
          .refine(
            (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
            "Quantity must be a positive number",
          ),
        unit_price: z
          .string()
          .min(1, "Price is required")
          .refine(
            (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
            "Price must be a positive number",
          ),
      }),
    )
    .min(1, "At least one item is required")
    .refine(
      (items) => items.every((item) => item.description?.trim() !== "" || item.product_id),
      "Each item must have either a product selected or a description entered",
    ),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  onSuccess?: () => void;
}

export function QuoteForm({ onSuccess }: QuoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const t = useTranslations("Quotes");
  const locale = useLocale();

  const form = useForm<QuoteFormValues>({
    defaultValues: {
      client_id: "",
      quote_number: "",
      issue_date: "",
      expiry_date: "",
      status: "draft",
      subtotal: 0,
      tax_rate: 0,
      notes: "",
      items: [
        {
          product_id: "",
          description: "",
          quantity: "1",
          unit_price: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    // Get the current user ID and fetch clients
    const getUserIdAndClients = async () => {
      setClientsLoading(true);

      // Get user ID
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserId(userData.user.id);
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

    getUserIdAndClients();
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

  // Calculate subtotal whenever items change
  useEffect(() => {
    const calculateSubtotal = () => {
      const subtotal = form.watch("items").reduce((acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return acc + quantity * unitPrice;
      }, 0);

      form.setValue("subtotal", subtotal);
    };

    calculateSubtotal();
  }, [form.watch("items")]);

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

  const handleClientAdded = (newClient: any) => {
    const clientForList = {
      id: newClient.id,
      name: newClient.name,
      company: newClient.company,
    };
    setClients((prev) => [...prev, clientForList]);
    form.setValue("client_id", newClient.id);
    setIsDialogOpen(false);
  };

  const handleProductSelection = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.description`, product.description);
      form.setValue(`items.${index}.unit_price`, product.price.toString());
    }
  };

  const calculateSubtotal = (items: any[]) => {
    return items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return acc + quantity * unitPrice;
    }, 0);
  };

  const onSubmit = async (data: QuoteFormValues) => {
    setLoading(true);
    try {
      // Calculate final amounts
      const subtotal = calculateSubtotal(data.items);
      const taxAmount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + taxAmount;

      // First create the quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([
          {
            client_id: data.client_id,
            quote_number: data.quote_number.trim(),
            issue_date: data.issue_date,
            expiry_date: data.expiry_date,
            status: data.status,
            subtotal: subtotal,
            tax_rate: data.tax_rate,
            notes: data.notes?.trim() || null,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Then add quote items
      const quoteItems = data.items.map((item) => ({
        quote_id: quote.id,
        product_id: item.product_id || null,
        description: item.description || "",
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(quoteItems);

      if (itemsError) throw itemsError;

      toast.success(t("success.title"), {
        description: t("success.created"),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/quotes");
      }
    } catch (error) {
      toast.error(t("error.title"), {
        description: error instanceof Error ? error.message : t("error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

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
        id: "unitPrice",
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
    [form, fields, productOptions, productsLoading, handleProductSelection, remove, t],
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onChange={field.onChange}
                      renderOption={(option) => {
                        console.log(option);
                        return (
                          <div className="flex items-center gap-2">
                            <span>{option.label}</span>
                            <span className="text-sm text-gray-500">{option.description}</span>
                          </div>
                        );
                      }}
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
              name="quote_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("quote_number")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enter_quote_number")} {...field} />
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("issue_date")} *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>{t("expiry_date")} *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                <FormLabel>{t("status.title")} *</FormLabel>
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
                    <SelectItem value="sent">{t("status.sent")}</SelectItem>
                    <SelectItem value="accepted">{t("status.accepted")}</SelectItem>
                    <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                    <SelectItem value="expired">{t("status.expired")}</SelectItem>
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t("submitting") : t("create_quote")}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("add_new_client")}</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSuccess={(newClient: any) => handleClientAdded(newClient)}
            userId={userId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

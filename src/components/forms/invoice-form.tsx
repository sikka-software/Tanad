import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { ClientForm } from "@/components/forms/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Amount must be a positive number",
    ),
  due_date: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().optional(),
        description: z.string().optional(),
        quantity: z.string().min(1, "Quantity is required"),
        unit_price: z.string().min(1, "Price is required"),
      }),
    )
    .optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const t = useTranslations("Invoices");

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

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: "",
      invoice_number: "",
      amount: "",
      due_date: "",
      status: "draft",
      notes: "",
      items: [{ product_id: "", description: "", quantity: "1", unit_price: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      // First create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            client_id: data.client_id,
            invoice_number: data.invoice_number.trim(),
            amount: parseFloat(data.amount),
            due_date: data.due_date,
            status: data.status,
            notes: data.notes?.trim() || null,
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Then add invoice items if they exist
      if (data.items && data.items.length > 0) {
        const invoiceItems = data.items.map((item) => ({
          invoice_id: invoice.id,
          description: item.description || "",
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          amount: parseFloat(item.quantity) * parseFloat(item.unit_price),
        }));

        const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      toast.success(t("success.title"), {
        description: t("success.created"),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/invoices");
      }
    } catch (error) {
      toast.error(t("error.title"), {
        description: error instanceof Error ? error.message : t("error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = async () => {
    // Close the dialog
    setIsDialogOpen(false);

    // Refresh the clients list
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company")
        .order("name");

      if (error) throw error;

      setClients(data || []);

      // Show success message
      toast.success(t("client_added"));
    } catch (error) {
      console.error("Error refreshing clients:", error);
    }
  };

  const handleProductSelection = (index: number, productId: string) => {
    const selectedProduct = products.find((product) => product.id === productId);
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
        header: "Product",
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
                        placeholder: "Select product",
                        searchPlaceholder: "Search products",
                        noItems: "No products found",
                      }}
                      addText="Add new product"
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
        header: "Quantity",
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
        header: "Unit Price",
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
        header: "Description",
        cell: ({ row }: any) => {
          const index = row.index;
          return (
            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input placeholder="Product description" {...field} />
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
        header: "Subtotal",
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")} *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("due_date")} *</FormLabel>
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
                <FormLabel>{t("status")} *</FormLabel>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t("submitting") : t("create_invoice")}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("add_new_client")}</DialogTitle>
          </DialogHeader>
          <ClientForm onSuccess={handleClientAdded} userId={userId} />
        </DialogContent>
      </Dialog>

      <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormLabel>Name *</FormLabel>
                <Input id="name" placeholder="Product name" />
              </div>
              <div>
                <FormLabel>Price *</FormLabel>
                <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <FormLabel>Stock Quantity</FormLabel>
                <Input id="stock_quantity" type="number" min="0" step="1" placeholder="0" />
              </div>
              <div className="col-span-2">
                <FormLabel>Description</FormLabel>
                <Textarea id="description" placeholder="Product description" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setIsNewProductDialogOpen(false)}
                variant="outline"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // In a real implementation, this would save the product
                  toast.info("Product creation functionality not yet implemented");
                  setIsNewProductDialogOpen(false);
                }}
              >
                Save Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { ClientForm } from "@/components/forms/client-form";
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
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientsLoading, setClientsLoading] = useState(true);

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
        toast.error("Failed to load clients");
      } finally {
        setClientsLoading(false);
      }
    };

    getUserIdAndClients();
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
    },
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("invoices").insert([
        {
          client_id: data.client_id,
          invoice_number: data.invoice_number.trim(),
          amount: parseFloat(data.amount),
          due_date: data.due_date,
          status: data.status,
          notes: data.notes?.trim() || null,
        },
      ]);

      if (error) throw error;

      toast.success("Success", {
        description: "Invoice created successfully",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/invoices");
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An error occurred",
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
      toast.success("Client added successfully");
    } catch (error) {
      console.error("Error refreshing clients:", error);
    }
  };

  // Format clients for ComboboxAdd
  const clientOptions = clients.map((client) => ({
    label: client.company ? `${client.name} (${client.company})` : client.name,
    value: client.id,
  }));

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
                  <FormLabel>Client *</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      data={clientOptions}
                      isLoading={clientsLoading}
                      defaultValue={field.value}
                      onChange={field.onChange}
                      texts={{
                        placeholder: "Select a client",
                        searchPlaceholder: "Search clients...",
                        noItems: "No clients found",
                      }}
                      addText="Add New Client"
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
                  <FormLabel>Invoice Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice number" {...field} />
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
                  <FormLabel>Amount *</FormLabel>
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
                  <FormLabel>Due Date *</FormLabel>
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
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter any additional notes" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm userId={userId} onSuccess={handleClientAdded} />
        </DialogContent>
      </Dialog>
    </>
  );
}

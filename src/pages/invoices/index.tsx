import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  status: string;
  notes: string | null;
  client: Client;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select(
            `
            *,
            client:client_id (
              id,
              name,
              company,
              email,
              phone
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching invoices"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Invoices</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/add">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
            Create Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    Invoice #{invoice.invoice_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {invoice.client.company}
                  </p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Issue Date</span>
                    <span className="text-sm">
                      {format(new Date(invoice.issue_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Due Date</span>
                    <span className="text-sm">
                      {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold">
                      ${invoice.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      {invoice.client.name} • {invoice.client.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowLeft } from "lucide-react";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddInvoicePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/invoices" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add New Invoice</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowLeft, FileText, Receipt, User, Calendar, CreditCard } from "lucide-react";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function AddInvoicePage() {
  const router = useRouter();
  const t = useTranslations("Invoices");

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline" 
              size="icon" 
              onClick={() => router.push("/invoices")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("add_new")}</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/invoices")}
          >
            Cancel
          </Button>
        </div>
        <p className="mt-2 text-muted-foreground">
          Create a new invoice by filling out the form below. All fields marked with * are required.
        </p>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main form */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Enter the details for the new invoice</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <InvoiceForm />
          </CardContent>
        </Card>
        
        {/* Help sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Client Selection</h4>
                    <p className="text-sm text-muted-foreground">Choose an existing client or add a new one.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Invoice Number</h4>
                    <p className="text-sm text-muted-foreground">Use a unique invoice number for easy tracking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Receipt className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Products</h4>
                    <p className="text-sm text-muted-foreground">Add products from your catalog or enter new ones.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Due Date</h4>
                    <p className="text-sm text-muted-foreground">Set a clear payment deadline for the client.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Payment Status</h4>
                    <p className="text-sm text-muted-foreground">Mark the invoice status (draft, pending, etc).</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};

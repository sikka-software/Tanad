import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon, CheckCircle, FileText, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { DateInput } from "@/ui/inputs/date-input";
import NumberInput from "@/ui/inputs/number-input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { Input } from "@/components/ui/inputs/input";
import { ZatcaQRCode } from "@/components/zatca/ZatcaQRCode";

import {
  TEST_SELLER_NAMES,
  TEST_VAT_NUMBERS,
  generateTestInvoiceData,
} from "@/lib/zatca/zatca-test-utils";
import { calculateVAT } from "@/lib/zatca/zatca-utils";

import { useClients } from "@/client/client.hooks";

import { useCreateInvoice } from "@/invoice/invoice.hooks";

import useUserStore from "@/stores/use-user-store";

export default function ZatcaInvoicePage() {
  const t = useTranslations();
  const router = useRouter();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { data: clients } = useClients();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvoices, setGeneratedInvoices] = useState<any[]>([]);

  // Add form methods with correct date type
  const formMethods = useForm({
    defaultValues: {
      clientId: "",
      invoiceNumber: `ZATCA-TEST-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      issueDate: today(getLocalTimeZone()), // Use today from internationalized/date
      dueDate: today(getLocalTimeZone()), // Use today from internationalized/date
      sellerName: "Mansour Company",
      vatNumber: "310122393500003",
      subtotal: 100,
      taxRate: 15,
      productDescription: "ZATCA Test Product",
      quantity: 1,
    },
  });

  const handleCreateTestInvoice = async () => {
    if (!user?.id || !enterprise?.id) {
      toast.error("User information required", {
        description: "Please ensure you are logged in with a valid enterprise.",
      });
      return;
    }

    if (!clients || clients.length === 0) {
      toast.error("No clients available", {
        description: "Please create at least one client first.",
      });
      return;
    }

    const formValues = formMethods.getValues();
    if (!formValues.clientId) {
      toast.error("Client required", {
        description: "Please select a client for the invoice.",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Calculate VAT amount
      const taxAmount = calculateVAT(formValues.subtotal, formValues.taxRate);

      // Convert CalendarDate to JS Date for API
      const issueJsDate = formValues.issueDate
        ? formValues.issueDate.toDate(getLocalTimeZone())
        : new Date();

      const dueJsDate = formValues.dueDate
        ? formValues.dueDate.toDate(getLocalTimeZone())
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Construct invoice payload
      const invoicePayload = {
        client_id: formValues.clientId,
        invoice_number: formValues.invoiceNumber,
        issue_date: issueJsDate.toISOString(),
        due_date: dueJsDate.toISOString(),
        status: "draft" as const,
        subtotal: formValues.subtotal,
        tax_rate: formValues.taxRate / 100, // Converting percentage to decimal for database
        notes: null,
        items: [
          {
            description: formValues.productDescription,
            quantity: formValues.quantity,
            unit_price: formValues.subtotal / formValues.quantity,
            product_id: null,
          },
        ],
        zatca_enabled: true,
        seller_name: formValues.sellerName,
        vat_number: formValues.vatNumber,
      };

      // Create invoice
      const response = await createInvoice(invoicePayload);

      // Add to list of generated invoices
      setGeneratedInvoices((prev) =>
        [
          {
            id: response.id,
            invoice_number: invoicePayload.invoice_number,
            client_name:
              clients.find((c) => c.id === formValues.clientId)?.name || "Unknown Client",
            total: formValues.subtotal + taxAmount,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 5),
      ); // Keep only the latest 5

      // Generate new random invoice number for next creation
      const newInvoiceNumber = `ZATCA-TEST-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;
      formMethods.setValue("invoiceNumber", newInvoiceNumber);

      toast.success("Test invoice created successfully", {
        description: `Invoice #${invoicePayload.invoice_number} has been saved`,
        action: {
          label: "View Invoice",
          onClick: () => router.push(`/invoices/${response.id}`),
        },
      });
    } catch (error) {
      console.error("Failed to create test invoice:", error);
      toast.error("Failed to create test invoice", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRandomData = () => {
    const testData = generateTestInvoiceData();
    formMethods.setValue("sellerName", testData.sellerName);
    formMethods.setValue("vatNumber", testData.vatNumber);
    formMethods.setValue("subtotal", testData.subtotal);
    formMethods.setValue("taxRate", testData.taxRate);
    formMethods.setValue("productDescription", "ZATCA Random Test Product");
    toast.success("Random ZATCA test data generated");
  };

  return (
    <FormProvider {...formMethods}>
      <>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Test Invoice with ZATCA Data</CardTitle>
                <CardDescription>
                  Create test invoices with ZATCA-compliant data directly in the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateRandomData}
                    className="ml-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Random Data
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client">Client *</Label>
                      <Select
                        value={formMethods.watch("clientId")}
                        onValueChange={(value) => formMethods.setValue("clientId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="invoice-number">Invoice Number *</Label>
                      <Input
                        id="invoice-number"
                        value={formMethods.watch("invoiceNumber")}
                        onChange={(e) => formMethods.setValue("invoiceNumber", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="issue-date">Issue Date *</Label>
                      <DateInput
                        placeholder="Select issue date"
                        value={formMethods.watch("issueDate")}
                        onChange={(date) => formMethods.setValue("issueDate", date)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <DateInput
                        placeholder="Select due date"
                        value={formMethods.watch("dueDate")}
                        onChange={(date) => formMethods.setValue("dueDate", date)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="seller-name">Seller Name (ZATCA)</Label>
                      <Select
                        value={formMethods.watch("sellerName")}
                        onValueChange={(value) => formMethods.setValue("sellerName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a seller name" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_SELLER_NAMES.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="vat-number">VAT Registration Number (ZATCA)</Label>
                      <Select
                        value={formMethods.watch("vatNumber")}
                        onValueChange={(value) => formMethods.setValue("vatNumber", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a VAT number" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_VAT_NUMBERS.map((vat) => (
                            <SelectItem key={vat} value={vat}>
                              {vat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="subtotal">Subtotal</Label>
                        <NumberInput
                          id="subtotal"
                          value={formMethods.watch("subtotal")}
                          onChange={(value) => formMethods.setValue("subtotal", Number(value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <NumberInput
                          id="tax-rate"
                          value={formMethods.watch("taxRate")}
                          onChange={(value) => formMethods.setValue("taxRate", Number(value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="product-description">Product Description</Label>
                        <Input
                          id="product-description"
                          value={formMethods.watch("productDescription")}
                          onChange={(e) =>
                            formMethods.setValue("productDescription", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <NumberInput
                          id="quantity"
                          value={formMethods.watch("quantity")}
                          onChange={(value) => formMethods.setValue("quantity", Number(value))}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-4">
                  <div className="text-muted-foreground mb-2 text-sm">Preview QR Code</div>
                  <ZatcaQRCode
                    sellerName={formMethods.watch("sellerName")}
                    vatNumber={formMethods.watch("vatNumber")}
                    invoiceTimestamp={
                      formMethods.watch("issueDate")
                        ? formMethods.watch("issueDate").toDate(getLocalTimeZone()).toISOString()
                        : new Date().toISOString()
                    }
                    invoiceTotal={
                      formMethods.watch("subtotal") +
                      calculateVAT(formMethods.watch("subtotal"), formMethods.watch("taxRate"))
                    }
                    vatAmount={calculateVAT(
                      formMethods.watch("subtotal"),
                      formMethods.watch("taxRate"),
                    )}
                    size={120}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={handleCreateTestInvoice}
                  disabled={isGenerating}
                  className="ml-auto"
                >
                  {isGenerating ? (
                    "Creating Invoice..."
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create Test Invoice
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Invoices</CardTitle>
                <CardDescription>Latest generated test invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedInvoices.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    No test invoices generated yet
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {generatedInvoices.map((invoice) => (
                      <li key={invoice.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{invoice.invoice_number}</div>
                            <div className="text-muted-foreground text-sm">
                              {invoice.client_name}
                            </div>
                            <div className="mt-1 flex items-center">
                              <CalendarIcon className="text-muted-foreground mr-1 h-3 w-3" />
                              <span className="text-muted-foreground text-xs">
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{invoice.total.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ZATCA Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">What is ZATCA?</h3>
                  <p className="text-muted-foreground text-sm">
                    The Zakat, Tax and Customs Authority (ZATCA) in Saudi Arabia requires businesses
                    to generate QR codes on invoices for VAT compliance.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Phase 1 Requirements</h3>
                  <ul className="text-muted-foreground list-inside list-disc text-sm">
                    <li>Seller Name</li>
                    <li>VAT Registration Number (15 digits)</li>
                    <li>Invoice Timestamp</li>
                    <li>Invoice Total (with VAT)</li>
                    <li>VAT Amount</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Your test invoices are ZATCA Phase 1 compliant
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    </FormProvider>
  );
}

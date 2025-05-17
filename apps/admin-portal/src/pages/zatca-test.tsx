import { Copy, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import NumberInput from "@/ui/inputs/number-input";
import { Label } from "@/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { Input } from "@/components/ui/inputs/input";
import { ZatcaQRCode } from "@/components/zatca/ZatcaQRCode";

import {
  TEST_SELLER_NAMES,
  generateTestInvoiceData,
  generateTestVatNumber,
} from "@/lib/zatca/zatca-test-utils";
import { calculateVAT, generateZatcaQRString } from "@/lib/zatca/zatca-utils";

import { useClients } from "@/client/client.hooks";

import { useCreateInvoice } from "@/invoice/invoice.hooks";

import useUserStore from "@/stores/use-user-store";

export default function ZatcaTestPage() {
  const t = useTranslations();
  const router = useRouter();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { data: clients } = useClients();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Manual entry test
  const [sellerName, setSellerName] = useState<string>("Mansour Company");
  const [vatNumber, setVatNumber] = useState<string>("310122393500003");
  const [invoiceTimestamp, setInvoiceTimestamp] = useState<string>(new Date().toISOString());
  const [invoiceTotal, setInvoiceTotal] = useState<number>(115);
  const [vatAmount, setVatAmount] = useState<number>(15);

  // Auto-generate test
  const [autoSellerName, setAutoSellerName] = useState<string>("");
  const [autoVatNumber, setAutoVatNumber] = useState<string>("");
  const [autoInvoiceData, setAutoInvoiceData] = useState<any>(null);
  const [autoQrString, setAutoQrString] = useState<string>("");

  const [qrSize, setQrSize] = useState<number>(200);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(message);
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const generateQrString = () => {
    try {
      const qrString = generateZatcaQRString({
        sellerName,
        vatNumber,
        invoiceTimestamp,
        invoiceTotal,
        vatAmount,
      });
      return qrString;
    } catch (error) {
      console.error("Error generating QR string:", error);
      toast.error("Failed to generate QR string");
      return "";
    }
  };

  const handleGenerateRandom = () => {
    try {
      // Generate random test data
      const testData = generateTestInvoiceData();
      setAutoSellerName(testData.sellerName);
      setAutoVatNumber(testData.vatNumber);
      setAutoInvoiceData(testData);

      // Generate QR string
      const qrString = generateZatcaQRString({
        sellerName: testData.sellerName,
        vatNumber: testData.vatNumber,
        invoiceTimestamp: testData.invoiceTimestamp,
        invoiceTotal: testData.total,
        vatAmount: testData.vatAmount,
      });

      setAutoQrString(qrString);
      toast.success("Generated random ZATCA test data");
    } catch (error) {
      console.error("Error generating random data:", error);
      toast.error("Failed to generate random data");
    }
  };

  const handleGenerateTestInvoice = async () => {
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

    try {
      setIsGeneratingInvoice(true);
      // Use a random client from the available clients
      const randomClient = clients[Math.floor(Math.random() * clients.length)];

      // Generate test data
      const testData = generateTestInvoiceData();

      // Construct invoice payload
      const invoicePayload = {
        client_id: randomClient.id,
        invoice_number: `ZATCA-TEST-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: "draft" as const,
        subtotal: testData.subtotal,
        tax_rate: testData.taxRate / 100, // Converting percentage to decimal for database
        notes: null,
        items: [
          {
            description: "ZATCA Test Product",
            quantity: 1,
            unit_price: testData.subtotal,
            product_id: null,
          },
        ],
        zatca_enabled: true,
        seller_name: testData.sellerName,
        vat_number: testData.vatNumber,
        tax_amount: testData.vatAmount,
      };

      // Create invoice
      const response = await createInvoice(invoicePayload);

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
      setIsGeneratingInvoice(false);
    }
  };

  const handleRandomVatNumber = () => {
    setVatNumber(generateTestVatNumber());
  };

  const handleRandomSellerName = () => {
    setSellerName(TEST_SELLER_NAMES[Math.floor(Math.random() * TEST_SELLER_NAMES.length)]);
  };

  const handleCalculateVAT = (subtotal: number, taxRate: number) => {
    const vat = calculateVAT(subtotal, taxRate);
    const total = subtotal + vat;
    setVatAmount(vat);
    setInvoiceTotal(total);
    toast.success("VAT calculated successfully");
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          Use these tools to test ZATCA Phase 1 implementation features, generate dummy data, and
          validate QR codes for development purposes.
        </p>
        <Button
          onClick={handleGenerateTestInvoice}
          disabled={isGeneratingInvoice}
          className="ml-auto"
        >
          {isGeneratingInvoice ? (
            "Creating Invoice..."
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Test Invoice
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="auto">Auto-Generated Test Data</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual ZATCA QR Data Entry</CardTitle>
              <CardDescription>
                Enter invoice details to generate a ZATCA-compliant QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="seller-name">Seller Name</Label>
                      <Input
                        id="seller-name"
                        value={sellerName}
                        onChange={(e: any) => setSellerName(e.target.value)}
                        placeholder="Enter seller name"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRandomSellerName}>
                      Random
                    </Button>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="vat-number">VAT Registration Number</Label>
                      <Input
                        id="vat-number"
                        value={vatNumber}
                        onChange={(e: any) => setVatNumber(e.target.value)}
                        placeholder="15-digit VAT number"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRandomVatNumber}>
                      Random
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="invoice-timestamp">Invoice Timestamp</Label>
                    <Input
                      id="invoice-timestamp"
                      value={invoiceTimestamp}
                      onChange={(e: any) => setInvoiceTimestamp(e.target.value)}
                      placeholder="ISO timestamp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="subtotal">Subtotal</Label>
                      <NumberInput
                        id="subtotal"
                        placeholder="0.00"
                        defaultValue={100}
                        onChange={(value: any) => {
                          const subtotal = Number(value);
                          if (!isNaN(subtotal)) {
                            // Auto-calculate VAT at 15%
                            handleCalculateVAT(subtotal, 15);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <NumberInput
                        id="tax-rate"
                        placeholder="15"
                        defaultValue={15}
                        onChange={(value: any) => {
                          const taxRate = Number(value);
                          const subtotal = invoiceTotal - vatAmount;
                          if (!isNaN(taxRate) && !isNaN(subtotal)) {
                            handleCalculateVAT(subtotal, taxRate);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="vat-amount">VAT Amount</Label>
                      <NumberInput
                        id="vat-amount"
                        placeholder="0.00"
                        value={vatAmount}
                        onChange={(value: any) => setVatAmount(Number(value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoice-total">Invoice Total</Label>
                      <NumberInput
                        id="invoice-total"
                        placeholder="0.00"
                        value={invoiceTotal}
                        onChange={(value: any) => setInvoiceTotal(Number(value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qr-size">QR Code Size (px)</Label>
                    <NumberInput
                      id="qr-size"
                      placeholder="200"
                      value={qrSize}
                      onChange={(value: any) => setQrSize(Number(value))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-6 text-center">
                <h3 className="text-sm font-medium">Generated QR Code</h3>
                <ZatcaQRCode
                  sellerName={sellerName}
                  vatNumber={vatNumber}
                  invoiceTimestamp={invoiceTimestamp}
                  invoiceTotal={invoiceTotal}
                  vatAmount={vatAmount}
                  size={qrSize}
                />

                <div className="text-muted-foreground mt-2 text-sm">
                  Scan with any ZATCA-compliant app to verify
                </div>
              </div>

              <div className="rounded-md border p-4">
                <Label className="block text-sm font-medium text-gray-700">
                  TLV-encoded Base64 string for QR code:
                </Label>
                <div className="mt-1 flex">
                  <div className="relative flex-1">
                    <pre className="max-h-24 overflow-auto rounded-md bg-slate-50 p-2 text-xs">
                      {generateQrString()}
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(generateQrString(), "QR string copied to clipboard")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="default"
                onClick={() => {
                  const qrString = generateQrString();
                  if (qrString) {
                    toast.success("QR code generated successfully");
                  }
                }}
              >
                Regenerate QR Code
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generated ZATCA Test Data</CardTitle>
              <CardDescription>
                Generate valid random test data for ZATCA Phase 1 compliance testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleGenerateRandom}>Generate Random ZATCA Data</Button>

              {autoInvoiceData && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">Seller Name</Label>
                        <div className="flex items-center gap-2">
                          <Input value={autoSellerName} readOnly />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(autoSellerName, "Seller name copied to clipboard")
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-sm">VAT Number</Label>
                        <div className="flex items-center gap-2">
                          <Input value={autoVatNumber} readOnly />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(autoVatNumber, "VAT number copied to clipboard")
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-sm">Invoice Timestamp</Label>
                        <div className="flex items-center gap-2">
                          <Input value={autoInvoiceData.invoiceTimestamp} readOnly />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(
                                autoInvoiceData.invoiceTimestamp,
                                "Timestamp copied to clipboard",
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-muted-foreground text-sm">Subtotal</Label>
                          <Input value={autoInvoiceData.subtotal.toFixed(2)} readOnly />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Tax Rate (%)</Label>
                          <Input value={autoInvoiceData.taxRate.toFixed(2)} readOnly />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-muted-foreground text-sm">VAT Amount</Label>
                          <Input value={autoInvoiceData.vatAmount.toFixed(2)} readOnly />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Invoice Total</Label>
                          <Input value={autoInvoiceData.total.toFixed(2)} readOnly />
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-sm">QR Code Size (px)</Label>
                        <NumberInput
                          id="auto-qr-size"
                          placeholder="200"
                          value={qrSize}
                          onChange={(value) => setQrSize(Number(value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-6 text-center">
                    <h3 className="text-sm font-medium">Generated QR Code</h3>
                    <ZatcaQRCode
                      sellerName={autoSellerName}
                      vatNumber={autoVatNumber}
                      invoiceTimestamp={autoInvoiceData.invoiceTimestamp}
                      invoiceTotal={autoInvoiceData.total}
                      vatAmount={autoInvoiceData.vatAmount}
                      size={qrSize}
                    />

                    <div className="text-muted-foreground mt-2 text-sm">
                      Scan with any ZATCA-compliant app to verify
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <Label className="block text-sm font-medium text-gray-700">
                      TLV-encoded Base64 string for QR code:
                    </Label>
                    <div className="mt-1 flex">
                      <div className="relative flex-1">
                        <pre className="max-h-24 overflow-auto rounded-md bg-slate-50 p-2 text-xs">
                          {autoQrString}
                        </pre>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(autoQrString, "QR string copied to clipboard")
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ZATCA Testing Reference</CardTitle>
          <CardDescription>Useful information for ZATCA Phase 1 compliance testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">VAT Number Format</h3>
              <p className="text-muted-foreground text-sm">
                Saudi Arabian VAT numbers are 15 digits and should start with the digit 3. Example:
                310122393500003
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Required Fields</h3>
              <ul className="text-muted-foreground list-inside list-disc text-sm">
                <li>Seller Name (Tag 1)</li>
                <li>VAT Registration Number (Tag 2)</li>
                <li>Invoice Timestamp (Tag 3)</li>
                <li>Invoice Total with tax (Tag 4)</li>
                <li>VAT Amount (Tag 5)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium">Testing Apps</h3>
              <p className="text-muted-foreground text-sm">
                You can validate the generated QR codes using the ZATCA official app or any
                ZATCA-compliant verification app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

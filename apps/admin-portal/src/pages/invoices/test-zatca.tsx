import { CheckCircle, Download, FileText, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import { processZatcaInvoice, validateZatcaInvoice } from "@/lib/zatca/zatca-phase2-integration";
import { generateTestInvoice } from "@/lib/zatca/zatca-test-utils";
import { generateZatcaXml } from "@/lib/zatca/zatca-xml";

export default function InvoiceZatcaTestPage() {
  const [testInvoice, setTestInvoice] = useState<any>(null);
  const [generatedXml, setGeneratedXml] = useState<string>("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateTestInvoiceData = () => {
    const invoice = generateTestInvoice({
      invoiceNumber: `TEST-${Date.now()}`,
    });
    setTestInvoice(invoice);
    toast.success("Test invoice data generated");
  };

  const generateXmlFromInvoice = () => {
    if (!testInvoice) {
      toast.error("Generate test invoice first");
      return;
    }

    try {
      const xml = generateZatcaXml({
        invoiceNumber: testInvoice.invoice_number,
        issueDate: testInvoice.issue_date,
        dueDate: testInvoice.due_date,
        invoiceType: "SIMPLIFIED",

        sellerName: testInvoice.seller_name,
        sellerVatNumber: testInvoice.vat_number,
        sellerAddress: {
          street: "King Fahd Road",
          buildingNumber: "8091",
          city: "Riyadh",
          postalCode: "12214",
          countryCode: "SA",
          district: "Al Olaya",
        },

        buyerName: "Test Customer",
        buyerVatNumber: "355434621636323",
        buyerAddress: {
          street: "Prince Mohammed Bin Salman Road",
          buildingNumber: "3458",
          city: "Jeddah",
          postalCode: "23715",
          countryCode: "SA",
          district: "Al Hamra",
        },

        paymentMeans: {
          code: "10",
          description: "Cash payment",
        },

        items: testInvoice.items.map((item: any) => ({
          name: item.description,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          vatRate: testInvoice.tax_rate * 100,
          vatAmount: item.unit_price * item.quantity * testInvoice.tax_rate,
          subtotal: item.unit_price * item.quantity,
          total: item.unit_price * item.quantity * (1 + testInvoice.tax_rate),
        })),

        subtotal: testInvoice.subtotal,
        vatAmount: testInvoice.tax_amount,
        total: testInvoice.total,
      });

      setGeneratedXml(xml);
      toast.success("ZATCA XML generated from invoice data");
    } catch (error) {
      toast.error("Failed to generate XML");
      console.error("XML generation error:", error);
    }
  };

  const validateGeneratedXml = async () => {
    if (!generatedXml) {
      toast.error("Generate XML first");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await validateZatcaInvoice(generatedXml);
      setValidationResult(result);

      if (result.success) {
        toast.success("XML validation completed");
      } else {
        toast.error("XML validation failed");
      }
    } catch (error) {
      toast.error("Validation failed");
      console.error("Validation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processFullWorkflow = async () => {
    if (!generatedXml) {
      toast.error("Generate XML first");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processZatcaInvoice(generatedXml);
      setProcessingResult(result);

      if (result.success) {
        toast.success("ZATCA processing completed");
      } else {
        toast.error("ZATCA processing failed");
      }
    } catch (error) {
      toast.error("Processing failed");
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadXml = () => {
    if (!generatedXml) {
      toast.error("No XML to download");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([generatedXml], { type: "application/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `zatca-test-${testInvoice?.invoice_number || "invoice"}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("XML downloaded");
  };

  const downloadSignedXml = () => {
    if (!processingResult?.signedXml) {
      toast.error("No signed XML available");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([processingResult.signedXml], { type: "application/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `zatca-signed-${testInvoice?.invoice_number || "invoice"}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Signed XML downloaded");
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoice ZATCA Testing</h1>
        <Badge variant="outline">Test Environment</Badge>
      </div>

      {/* Step 1: Generate Test Invoice */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Generate Test Invoice Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateTestInvoiceData} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Generate Test Invoice
          </Button>

          {testInvoice && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-medium">Generated Invoice Data:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Invoice Number:</strong> {testInvoice.invoice_number}
                </div>
                <div>
                  <strong>Seller:</strong> {testInvoice.seller_name}
                </div>
                <div>
                  <strong>VAT Number:</strong> {testInvoice.vat_number}
                </div>
                <div>
                  <strong>Total:</strong> {testInvoice.total.toFixed(2)} SAR
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Generate XML */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Generate ZATCA XML</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateXmlFromInvoice}
            disabled={!testInvoice}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate ZATCA XML
          </Button>

          {generatedXml && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="secondary">XML Generated</Badge>
                <Button variant="outline" size="sm" onClick={downloadXml}>
                  <Download className="mr-1 h-4 w-4" />
                  Download XML
                </Button>
              </div>
              <div className="text-muted-foreground text-xs">
                XML Length: {generatedXml.length.toLocaleString()} characters
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Validate XML */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Validate XML</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={validateGeneratedXml}
            disabled={!generatedXml || isProcessing}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isProcessing ? "Validating..." : "Validate XML"}
          </Button>

          {validationResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={validationResult.validationPassed ? "default" : "destructive"}>
                  {validationResult.validationPassed ? "VALIDATION PASSED" : "VALIDATION FAILED"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{validationResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Full ZATCA Processing */}
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Full ZATCA Processing (Phase 2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={processFullWorkflow}
            disabled={!generatedXml || isProcessing}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Process with ZATCA SDK"}
          </Button>

          {processingResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={processingResult.success ? "default" : "destructive"}>
                  {processingResult.success ? "PROCESSING SUCCESS" : "PROCESSING FAILED"}
                </Badge>
                {processingResult.validationPassed && (
                  <Badge variant="secondary">Validation Passed</Badge>
                )}
              </div>

              <p className="text-muted-foreground text-sm">{processingResult.message}</p>

              {processingResult.success && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {processingResult.hash && (
                    <div>
                      <strong className="text-sm">Invoice Hash:</strong>
                      <p className="bg-muted mt-1 rounded p-2 font-mono text-xs break-all">
                        {processingResult.hash}
                      </p>
                    </div>
                  )}

                  {processingResult.qrCode && (
                    <div>
                      <strong className="text-sm">QR Code:</strong>
                      <p className="bg-muted mt-1 rounded p-2 font-mono text-xs break-all">
                        {processingResult.qrCode.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {processingResult.signedXml && (
                <Button variant="outline" onClick={downloadSignedXml}>
                  <Download className="mr-1 h-4 w-4" />
                  Download Signed XML
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. <strong>Generate Test Data:</strong> Creates a random invoice with ZATCA-compliant
            data
          </p>
          <p>
            2. <strong>Generate XML:</strong> Converts invoice data to UBL 2.1 XML format
          </p>
          <p>
            3. <strong>Validate:</strong> Checks XML against ZATCA requirements
          </p>
          <p>
            4. <strong>Process:</strong> Runs full ZATCA workflow (validation → hash → sign → QR)
          </p>
          <p className="text-muted-foreground mt-4">
            <strong>Note:</strong> This uses your existing ZATCA integration and test utilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

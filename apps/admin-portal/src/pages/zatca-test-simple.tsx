import { AlertTriangle, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import { generateZatcaXml } from "@/lib/zatca/zatca-xml";

export default function ZatcaTestSimplePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [xmlContent, setXmlContent] = useState<string>("");

  const generateTestXML = () => {
    setIsGenerating(true);

    try {
      // Test data with proper VAT calculations
      const subtotal = 989.0;
      const vatRate = 15; // 15%
      const vatAmount = Math.round(subtotal * 0.15 * 100) / 100; // 148.35
      const total = subtotal + vatAmount; // 1137.35

      const testInvoiceData = {
        invoiceNumber: "INV-TEST-FIXED-001",
        issueDate: new Date().toISOString(),
        invoiceType: "STANDARD" as const,
        supplyDate: new Date().toISOString(),

        // Seller with valid ZATCA VAT number
        sellerName: "Test Company LLC",
        sellerVatNumber: "310123456789003",
        sellerAddress: {
          street: "King Fahd Road",
          buildingNumber: "1234",
          city: "Riyadh",
          postalCode: "12214",
          district: "Al Olaya",
          countryCode: "SA",
        },

        // Buyer information
        buyerName: "Test Buyer LLC",
        buyerVatNumber: "399876543210003",
        buyerAddress: {
          street: "Prince Sultan Road",
          buildingNumber: "5678",
          city: "Jeddah",
          postalCode: "23715",
          district: "Al Hamra",
          countryCode: "SA",
        },

        // Payment information
        paymentMeans: {
          code: "10",
          description: "Cash payment",
        },

        // Line items with proper VAT calculation
        items: [
          {
            name: "Test Product",
            description: "Test Product Description",
            quantity: 1,
            unitPrice: subtotal,
            vatRate: vatRate,
            vatAmount: vatAmount,
            subtotal: subtotal,
            total: total,
          },
        ],

        // Totals
        subtotal: subtotal,
        vatAmount: vatAmount,
        total: total,

        // ZATCA Phase 2 fields
        invoiceCounterValue: 1,
        previousInvoiceHash:
          "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
      };

      const xml = generateZatcaXml(testInvoiceData);
      setXmlContent(xml);

      // Create download
      const element = document.createElement("a");
      const file = new Blob([xml], { type: "application/xml" });
      element.href = URL.createObjectURL(file);
      element.download = `zatca-test-fixed-${Date.now()}.xml`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("ZATCA XML Generated Successfully", {
        description: "XML file has been downloaded with all validation fixes applied.",
      });
    } catch (error) {
      console.error("Failed to generate ZATCA XML:", error);
      toast.error("Failed to generate XML", {
        description: "Please check the console for error details.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateXML = () => {
    if (!xmlContent) {
      toast.error("No XML to validate", {
        description: "Please generate XML first.",
      });
      return;
    }

    const validationResults = [];

    // Check for signature structure
    if (xmlContent.includes("urn:oasis:names:specification:ubl:signature:1")) {
      validationResults.push({ type: "success", message: "✅ Signature ID structure correct" });
    } else {
      validationResults.push({ type: "error", message: "❌ Missing signature ID structure" });
    }

    // Check for signature method
    if (xmlContent.includes("urn:oasis:names:specification:ubl:dsig:enveloped:xades")) {
      validationResults.push({ type: "success", message: "✅ Signature method correct" });
    } else {
      validationResults.push({ type: "error", message: "❌ Missing signature method" });
    }

    // Check for VAT number format
    const vatMatch = xmlContent.match(/<cbc:CompanyID>(\d{15})<\/cbc:CompanyID>/);
    if (vatMatch && vatMatch[1].startsWith("3") && vatMatch[1].endsWith("3")) {
      validationResults.push({ type: "success", message: "✅ VAT number format correct" });
    } else {
      validationResults.push({ type: "error", message: "❌ Invalid VAT number format" });
    }

    // Check for VAT rate
    if (xmlContent.includes("<cbc:Percent>15.00</cbc:Percent>")) {
      validationResults.push({ type: "success", message: "✅ VAT rate is 15%" });
    } else {
      validationResults.push({ type: "warning", message: "⚠️ VAT rate might not be 15%" });
    }

    // Check for placeholder values
    if (!xmlContent.includes("[PLACEHOLDER_")) {
      validationResults.push({ type: "success", message: "✅ No placeholder values found" });
    } else {
      validationResults.push({ type: "error", message: "❌ Contains placeholder values" });
    }

    // Display results
    const successCount = validationResults.filter((r) => r.type === "success").length;
    const errorCount = validationResults.filter((r) => r.type === "error").length;

    if (errorCount === 0) {
      toast.success(`Validation Passed (${successCount}/${validationResults.length})`, {
        description: "XML should pass ZATCA validation.",
      });
    } else {
      toast.error(`Validation Issues Found (${errorCount} errors)`, {
        description: "Check console for details.",
      });
    }

    console.log("Validation Results:", validationResults);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">ZATCA XML Test - Fixed Version</h1>
          <p className="text-muted-foreground">
            Generate and test ZATCA-compliant XML with all validation fixes applied.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Fixed Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Badge variant="outline" className="w-fit">
                  ✅ Removed invalid placeholder values
                </Badge>
                <Badge variant="outline" className="w-fit">
                  ✅ Fixed VAT calculation rounding (BR-CO-17, BR-S-09)
                </Badge>
                <Badge variant="outline" className="w-fit">
                  ✅ Added proper signature structure (BR-KSA-30, BR-KSA-28)
                </Badge>
                <Badge variant="outline" className="w-fit">
                  ✅ Valid VAT number format (15 digits, starts/ends with 3)
                </Badge>
                <Badge variant="outline" className="w-fit">
                  ✅ Phase 2 QR code with signature data
                </Badge>
                <Badge variant="outline" className="w-fit">
                  ✅ Proper certificate structure
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Test XML</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={generateTestXML}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate & Download XML
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={validateXML}
                  disabled={!xmlContent}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Validate XML
                </Button>
              </div>

              <div className="text-muted-foreground text-sm">
                <p>This will generate a test XML with:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Valid ZATCA VAT numbers (15 digits, starts/ends with 3)</li>
                  <li>Proper 15% VAT calculation with correct rounding</li>
                  <li>Phase 2 signature structure with mock certificate</li>
                  <li>Phase 2 QR code with signature data</li>
                  <li>All required ZATCA document references</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {xmlContent && (
            <Card>
              <CardHeader>
                <CardTitle>Generated XML Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">
                  {xmlContent.substring(0, 2000)}
                  {xmlContent.length > 2000 && "\n... (truncated)"}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

ZatcaTestSimplePage.messages = ["General"];

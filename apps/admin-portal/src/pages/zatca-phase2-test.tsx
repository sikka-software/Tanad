import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/inputs/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { generateTestZatcaXml } from "@/lib/zatca/zatca-test-utils";
import { calculateVAT } from "@/lib/zatca/zatca-utils";
import {
  validateXmlStructure,
  validateXmlWithZatca,
  type ZatcaValidationResult,
} from "@/lib/zatca/zatca-validation";
import { generateZatcaXml } from "@/lib/zatca/zatca-xml";

export default function ZatcaPhase2TestPage() {
  const t = useTranslations();
  const [xmlOutput, setXmlOutput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("generator");

  // Validation state
  const [validationXml, setValidationXml] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ZatcaValidationResult | null>(null);

  // Form state for manual invoice data entry
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceType: "SIMPLIFIED",
    sellerName: "Tanad Test Company",
    sellerVatNumber: "310122393500003", // ZATCA-compliant: 15 digits starting and ending with 3
    sellerAddress: {
      street: "King Fahd Road",
      buildingNumber: "8091",
      city: "Riyadh",
      postalCode: "12214",
      countryCode: "SA",
      district: "Al Olaya", // Required for KSA
    },
    buyerName: "Test Customer",
    buyerVatNumber: "311122393500003", // ZATCA-compliant: 15 digits starting and ending with 3
    buyerAddress: {
      street: "King Abdullah Road",
      buildingNumber: "7456",
      city: "Riyadh",
      postalCode: "11564",
      countryCode: "SA",
      district: "Al Malaz",
    },
    subtotal: 100,
    vatRate: 15,
    vatAmount: 15,
    total: 115,
    // ZATCA specific fields
    invoiceCounterValue: Math.floor(Math.random() * 1000) + 1, // ICV
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==", // PIH
    items: [
      {
        name: "Test Product",
        description: "ZATCA Phase 2 Test Product",
        quantity: 1,
        unitPrice: 100,
        vatRate: 15,
        vatAmount: 15,
        subtotal: 100,
        total: 115,
      },
    ],
  });

  const handleInputChange = (field: string, value: any) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));

    // Recalculate VAT amount if subtotal or VAT rate changes
    if (field === "subtotal" || field === "vatRate") {
      const subtotal = field === "subtotal" ? value : invoiceData.subtotal;
      const vatRate = field === "vatRate" ? value : invoiceData.vatRate;
      const vatAmount = calculateVAT(subtotal, vatRate);
      const total = subtotal + vatAmount;

      setInvoiceData((prev) => ({
        ...prev,
        vatAmount,
        total,
        items: [
          {
            ...prev.items[0],
            unitPrice: subtotal,
            vatRate,
            vatAmount,
            subtotal,
            total,
          },
        ],
      }));
    }
  };

  const generateRandomXML = () => {
    try {
      const xml = generateTestZatcaXml();
      setXmlOutput(xml);
      toast.success("ZATCA XML generated successfully");
    } catch (error) {
      console.error("Error generating test XML:", error);
      toast.error("Failed to generate ZATCA XML");
    }
  };

  const generateCustomXML = () => {
    try {
      const xml = generateZatcaXml({
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        invoiceType: invoiceData.invoiceType as "STANDARD" | "SIMPLIFIED",
        sellerName: invoiceData.sellerName,
        sellerVatNumber: invoiceData.sellerVatNumber,
        sellerAddress: invoiceData.sellerAddress,
        buyerName: invoiceData.buyerName,
        buyerVatNumber: invoiceData.buyerVatNumber,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        vatAmount: invoiceData.vatAmount,
        total: invoiceData.total,
      });
      setXmlOutput(xml);
      toast.success("Custom ZATCA XML generated successfully");
    } catch (error) {
      console.error("Error generating custom XML:", error);
      toast.error("Failed to generate custom ZATCA XML");
    }
  };

  const copyXmlToClipboard = () => {
    navigator.clipboard.writeText(xmlOutput);
    toast.success("XML copied to clipboard");
  };

  const downloadXml = () => {
    if (!xmlOutput) return;

    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zatca-invoice-${invoiceData.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("XML file downloaded");
  };

  const validateXmlAgainstZatca = async () => {
    if (!validationXml.trim()) {
      toast.error("Please enter XML content to validate");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // First, validate basic XML structure
      const structureValidation = validateXmlStructure(validationXml);

      if (!structureValidation.isValid) {
        setValidationResult({
          isValid: false,
          validationStatus: "ERROR",
          validationMessages: structureValidation.errors.map((error) => ({
            type: "ERROR",
            code: "STRUCTURE_ERROR",
            message: error,
          })),
          timestamp: new Date().toISOString(),
        });
        setIsValidating(false);
        return;
      }

      // Then validate against ZATCA requirements
      const result = await validateXmlWithZatca({
        xml: validationXml,
        invoiceType: "SIMPLIFIED",
        validateStructure: true,
        validateBusinessRules: true,
      });

      setValidationResult(result);

      if (result.isValid) {
        toast.success("XML validation completed successfully");
      } else {
        toast.error("XML validation failed - check validation results");
      }
    } catch (error) {
      console.error("Error validating XML:", error);
      toast.error("Failed to validate XML");
      setValidationResult({
        isValid: false,
        validationStatus: "ERROR",
        validationMessages: [
          {
            type: "ERROR",
            code: "VALIDATION_ERROR",
            message: "Unexpected error occurred during validation",
          },
        ],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyGeneratedToValidator = () => {
    if (!xmlOutput) {
      toast.error("No XML generated yet");
      return;
    }
    setValidationXml(xmlOutput);
    setActiveTab("validator");
    toast.success("XML copied to validator");
  };

  const getValidationBadgeColor = (status: ZatcaValidationResult["validationStatus"]) => {
    switch (status) {
      case "PASS":
        return "bg-green-500";
      case "WARNING":
        return "bg-yellow-500";
      case "FAIL":
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMessageIcon = (type: "ERROR" | "WARNING" | "INFO") => {
    switch (type) {
      case "ERROR":
        return "❌";
      case "WARNING":
        return "⚠️";
      case "INFO":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">ZATCA Phase 2 Test Page</h1>

      <Tabs defaultValue="generator" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="generator">XML Generator</TabsTrigger>
          <TabsTrigger value="validator">XML Validator</TabsTrigger>
          <TabsTrigger value="invoice">Test Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ZATCA Phase 2 XML Generator</CardTitle>
                <CardDescription>
                  Generate UBL 2.1 XML compliant with ZATCA Phase 2 requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="invoice-number" className="text-sm font-medium">
                    Invoice Number
                  </label>
                  <Input
                    id="invoice-number"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="seller-name" className="text-sm font-medium">
                    Seller Name
                  </label>
                  <Input
                    id="seller-name"
                    value={invoiceData.sellerName}
                    onChange={(e) => handleInputChange("sellerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vat-number" className="text-sm font-medium">
                    VAT Registration Number
                  </label>
                  <Input
                    id="vat-number"
                    value={invoiceData.sellerVatNumber}
                    onChange={(e) => handleInputChange("sellerVatNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subtotal" className="text-sm font-medium">
                    Subtotal
                  </label>
                  <Input
                    id="subtotal"
                    type="number"
                    value={invoiceData.subtotal}
                    onChange={(e) => handleInputChange("subtotal", parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vat-rate" className="text-sm font-medium">
                    VAT Rate (%)
                  </label>
                  <Input
                    id="vat-rate"
                    type="number"
                    value={invoiceData.vatRate}
                    onChange={(e) => handleInputChange("vatRate", parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="seller-district" className="text-sm font-medium">
                    Seller District (Required for KSA)
                  </label>
                  <Input
                    id="seller-district"
                    value={invoiceData.sellerAddress.district || ""}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        sellerAddress: { ...prev.sellerAddress, district: e.target.value },
                      }))
                    }
                    placeholder="e.g., Al Olaya, Al Malaz"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="invoice-counter" className="text-sm font-medium">
                    Invoice Counter Value (ICV)
                  </label>
                  <Input
                    id="invoice-counter"
                    type="number"
                    value={invoiceData.invoiceCounterValue}
                    onChange={(e) =>
                      handleInputChange("invoiceCounterValue", parseInt(e.target.value))
                    }
                    placeholder="Sequential invoice number"
                  />
                </div>

                <div className="flex justify-between">
                  <div>
                    <span className="mb-1 block text-sm font-medium">VAT Amount</span>
                    <span className="text-xl font-bold">
                      {invoiceData.vatAmount.toFixed(2)} SAR
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Total</span>
                    <span className="text-xl font-bold">{invoiceData.total.toFixed(2)} SAR</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Button className="flex-1" onClick={generateCustomXML}>
                    Generate Custom XML
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={generateRandomXML}>
                    Generate Random XML
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated XML</CardTitle>
                <CardDescription>XML output for ZATCA Phase 2 compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={xmlOutput} readOnly rows={20} className="font-mono text-xs" />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={copyXmlToClipboard}
                  disabled={!xmlOutput}
                  variant="outline"
                  className="flex-1"
                >
                  Copy XML
                </Button>
                <Button
                  onClick={downloadXml}
                  disabled={!xmlOutput}
                  variant="outline"
                  className="flex-1"
                >
                  Download XML
                </Button>
                <Button onClick={copyGeneratedToValidator} disabled={!xmlOutput} className="flex-1">
                  Validate XML
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validator">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ZATCA Phase 2 XML Validator</CardTitle>
                <CardDescription>
                  Validate your XML against ZATCA Phase 2 requirements using enhanced business rule
                  validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Validation Information:</strong>
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>
                          This validator performs enhanced business rule validation that simulates
                          ZATCA requirements
                        </li>
                        <li>
                          For <strong>production validation</strong>, you need a valid CSID
                          (Cryptographic Stamp Identifier) from ZATCA
                        </li>
                        <li>
                          Real ZATCA validation requires proper authentication and digital
                          signatures
                        </li>
                        <li>
                          This tool helps ensure your XML structure is correct before submitting to
                          ZATCA
                        </li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label htmlFor="validation-xml" className="text-sm font-medium">
                    Paste your UBL XML below to validate it against ZATCA Phase 2 requirements
                  </label>
                  <Textarea
                    id="validation-xml"
                    placeholder="Paste your XML here..."
                    value={validationXml}
                    onChange={(e) => setValidationXml(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h4 className="mb-2 font-medium">ZATCA API Endpoints (for reference):</h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Sandbox:</strong>{" "}
                      https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance/invoices
                    </p>
                    <p>
                      <strong>Simulation:</strong>{" "}
                      https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/compliance/invoices
                    </p>
                    <p>
                      <strong>Production:</strong>{" "}
                      https://gw-fatoora.zatca.gov.sa/e-invoicing/core/compliance/invoices
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={validateXmlAgainstZatca}
                  disabled={isValidating || !validationXml.trim()}
                >
                  {isValidating ? "Validating..." : "Validate XML with Enhanced Rules"}
                </Button>
              </CardFooter>
            </Card>

            {validationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Validation Results
                    <Badge className={getValidationBadgeColor(validationResult.validationStatus)}>
                      {validationResult.validationStatus}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Validation completed at {new Date(validationResult.timestamp).toLocaleString()}
                    {validationResult.requestId && ` • Request ID: ${validationResult.requestId}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationResult.validationMessages.map((message, index) => (
                      <Alert
                        key={index}
                        variant={message.type === "ERROR" ? "destructive" : "default"}
                      >
                        <AlertDescription className="flex items-start gap-2">
                          <span className="text-lg leading-none">
                            {getMessageIcon(message.type)}
                          </span>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {message.code}
                              </Badge>
                              {message.path && (
                                <span className="text-muted-foreground font-mono text-xs">
                                  {message.path}
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {validationResult.validationStatus === "PASS" && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Your XML structure is valid and ready for ZATCA Phase 2 integration! For
                        production use, ensure you have proper CSID authentication and digital
                        signatures.
                      </p>
                    </div>
                  )}

                  {validationResult.validationStatus === "WARNING" && (
                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Your XML has some warnings but should work. Address the warnings above
                        for full compliance.
                      </p>
                    </div>
                  )}

                  {validationResult.validationStatus === "FAIL" && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ Your XML has validation errors that must be fixed before submitting to
                        ZATCA.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>ZATCA Phase 2 Test Invoice</CardTitle>
              <CardDescription>Create and test a ZATCA-compliant invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The invoice test feature allows you to create a real invoice in the system with
                ZATCA Phase 2 compliance and test its XML generation.
              </p>
              <div className="bg-muted rounded-md p-4">
                <p className="text-muted-foreground text-sm italic">
                  Note: This feature will be implemented in the full ZATCA Phase 2 integration. For
                  now, please use the XML Generator tab to test the XML format.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Create Test Invoice (Coming Soon)
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { CheckCircle, FileText, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Textarea } from "@/ui/textarea";

interface ValidationResult {
  success: boolean;
  message: string;
  validationPassed: boolean;
  details?: {
    checks: Record<string, boolean>;
    passedChecks: number;
    totalChecks: number;
    xmlLength: number;
    hasPhase2Elements: boolean;
  };
}

export default function ZatcaTestPage() {
  const [xmlContent, setXmlContent] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlContent(content);
        toast.success("XML file loaded successfully");
      };
      reader.readAsText(file);
    }
  };

  const validateXml = async () => {
    if (!xmlContent.trim()) {
      toast.error("Please provide XML content to validate");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/zatca/test-xml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ xmlContent }),
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.success) {
        toast.success("XML validation completed");
      } else {
        toast.error("XML validation failed");
      }
    } catch (error) {
      toast.error("Failed to validate XML");
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const loadSampleXml = () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>ZATCA-TEST-001</cbc:ID>
  <cbc:UUID>d0965522-a309-472f-810a-3774de6c973b</cbc:UUID>
  <cbc:IssueDate>2025-01-15</cbc:IssueDate>
  <cbc:InvoiceTypeCode>388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Test Company</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Test Customer</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">15.00</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:TaxInclusiveAmount currencyID="SAR">115.00</cbc:TaxInclusiveAmount>
  </cac:LegalMonetaryTotal>
  
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>1</cbc:InvoicedQuantity>
  </cac:InvoiceLine>
</Invoice>`;
    setXmlContent(sampleXml);
    toast.success("Sample XML loaded");
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ZATCA XML Validator</h1>
        <Badge variant="outline">Test Environment</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              XML Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload XML File
              </Button>
              <Button variant="outline" onClick={loadSampleXml}>
                Load Sample
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Textarea
              placeholder="Paste your ZATCA XML content here or upload a file..."
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <Button
              onClick={validateXml}
              disabled={isValidating || !xmlContent.trim()}
              className="w-full"
            >
              {isValidating ? "Validating..." : "Validate XML"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult?.validationPassed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : validationResult ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={validationResult.validationPassed ? "default" : "destructive"}>
                    {validationResult.validationPassed ? "PASSED" : "FAILED"}
                  </Badge>
                  {validationResult.details?.hasPhase2Elements && (
                    <Badge variant="secondary">Phase 2 Elements Detected</Badge>
                  )}
                </div>

                <p className="text-muted-foreground text-sm">{validationResult.message}</p>

                {validationResult.details && (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Progress:</strong> {validationResult.details.passedChecks}/
                      {validationResult.details.totalChecks} checks passed
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(validationResult.details.checks).map(([check, passed]) => (
                        <div key={check} className="flex items-center gap-2 text-sm">
                          {passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={passed ? "text-green-700" : "text-red-700"}>
                            {check
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-muted-foreground text-xs">
                      XML Length: {validationResult.details.xmlLength.toLocaleString()} characters
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Upload or paste XML content and click "Validate XML" to see results.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. <strong>Upload your XML:</strong> Use the "Upload XML File" button or paste content
            directly
          </p>
          <p>
            2. <strong>Validate:</strong> Click "Validate XML" to check ZATCA compliance
          </p>
          <p>
            3. <strong>Review results:</strong> Check which ZATCA requirements are met
          </p>
          <p>
            4. <strong>Test with sample:</strong> Use "Load Sample" to see a basic ZATCA-compliant
            XML
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

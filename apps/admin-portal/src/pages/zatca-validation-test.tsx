import { AlertTriangle, CheckCircle, Download, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";

import {
  generateSimplifiedTestZatcaXml,
  generateTestZatcaXml,
  validateZatcaRequirements,
} from "@/lib/zatca/zatca-xml-test";

export default function ZatcaValidationTestPage() {
  const [standardXml, setStandardXml] = useState<string>("");
  const [simplifiedXml, setSimplifiedXml] = useState<string>("");
  const [standardValidation, setStandardValidation] = useState<any>(null);
  const [simplifiedValidation, setSimplifiedValidation] = useState<any>(null);

  const generateStandardXml = () => {
    try {
      const xml = generateTestZatcaXml();
      setStandardXml(xml);
      const validation = validateZatcaRequirements(xml);
      setStandardValidation(validation);
      toast.success("Standard invoice XML generated successfully");
    } catch (error) {
      console.error("Error generating standard XML:", error);
      toast.error("Failed to generate standard XML");
    }
  };

  const generateSimplifiedXml = () => {
    try {
      const xml = generateSimplifiedTestZatcaXml();
      setSimplifiedXml(xml);
      const validation = validateZatcaRequirements(xml);
      setSimplifiedValidation(validation);
      toast.success("Simplified invoice XML generated successfully");
    } catch (error) {
      console.error("Error generating simplified XML:", error);
      toast.error("Failed to generate simplified XML");
    }
  };

  const downloadXml = (xml: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([xml], { type: "application/xml" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const ValidationResults = ({ validation, title }: { validation: any; title: string }) => {
    if (!validation) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {title} Validation Results
            <Badge variant={validation.isValid ? "default" : "destructive"}>
              {validation.isValid ? "Valid" : "Invalid"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium text-red-600">
                <XCircle className="h-4 w-4" />
                Errors ({validation.errors.length})
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {validation.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Warnings ({validation.warnings.length})
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {validation.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-yellow-600">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.isValid &&
            validation.errors.length === 0 &&
            validation.warnings.length === 0 && (
              <p className="text-sm text-green-600">✅ All ZATCA requirements passed!</p>
            )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ZATCA XML Validation Test</h1>
        <p className="text-muted-foreground mt-2">
          Test ZATCA XML generation and validate against requirements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Standard Invoice */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Invoice (01)</CardTitle>
            <p className="text-muted-foreground text-sm">
              B2B invoice with full requirements including supply date
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={generateStandardXml} className="w-full">
                Generate Standard Invoice XML
              </Button>

              {standardXml && (
                <Button
                  variant="outline"
                  onClick={() => downloadXml(standardXml, "zatca-standard-test.xml")}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download XML
                </Button>
              )}

              <ValidationResults validation={standardValidation} title="Standard Invoice" />

              {standardXml && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Generated XML Preview:</h4>
                  <pre className="bg-muted max-h-40 overflow-auto rounded p-3 text-xs">
                    {standardXml.substring(0, 500)}...
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simplified Invoice */}
        <Card>
          <CardHeader>
            <CardTitle>Simplified Invoice (02)</CardTitle>
            <p className="text-muted-foreground text-sm">
              B2C invoice with simplified requirements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={generateSimplifiedXml} className="w-full">
                Generate Simplified Invoice XML
              </Button>

              {simplifiedXml && (
                <Button
                  variant="outline"
                  onClick={() => downloadXml(simplifiedXml, "zatca-simplified-test.xml")}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download XML
                </Button>
              )}

              <ValidationResults validation={simplifiedValidation} title="Simplified Invoice" />

              {simplifiedXml && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Generated XML Preview:</h4>
                  <pre className="bg-muted max-h-40 overflow-auto rounded p-3 text-xs">
                    {simplifiedXml.substring(0, 500)}...
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* ZATCA Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>ZATCA Requirements Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Critical Requirements (Errors)</h4>
              <ul className="space-y-1">
                <li>✅ VAT number format (15 digits, starts/ends with 3)</li>
                <li>✅ VAT rate validation (5% or 15% for standard rate)</li>
                <li>✅ Issue date not in future</li>
                <li>✅ Supply date for standard invoices (KSA-5)</li>
                <li>✅ Line item VAT amounts (KSA-11, KSA-12)</li>
                <li>✅ UBL 2.1 compliance</li>
                <li>✅ Valid base64 values (no placeholders)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Address Requirements (Warnings)</h4>
              <ul className="space-y-1">
                <li>✅ Street name (minimum 1 character)</li>
                <li>✅ Building number (4 digits for KSA)</li>
                <li>✅ Postal code (5 digits for KSA)</li>
                <li>✅ City name</li>
                <li>✅ District name</li>
                <li>✅ Country code</li>
                <li>✅ Buyer identification for standard invoices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

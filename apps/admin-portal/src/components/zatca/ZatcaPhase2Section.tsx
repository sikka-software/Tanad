/**
 * ZATCA Phase 2 Section Component
 * Provides UI for ZATCA Phase 2 processing including validation, signing, and QR generation
 */

import { Alert, AlertDescription } from '@/ui/alert';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Textarea } from '@/ui/textarea';
import {
    CheckCircle,
    Download,
    FileCheck,
    Hash,
    Loader2,
    QrCode,
    Shield,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    processZatcaInvoice,
    type ZatcaProcessingResult
} from '@/lib/zatca/zatca-phase2-integration';
import { generateZatcaXml } from '@/lib/zatca/zatca-xml';

interface ZatcaPhase2SectionProps {
  invoiceData: {
    invoiceNumber: string;
    issueDate: string;
    dueDate?: string;
    sellerName: string;
    sellerVatNumber: string;
    buyerName: string;
    buyerVatNumber?: string;
    items: Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      vatRate: number;
      vatAmount: number;
      subtotal: number;
      total: number;
    }>;
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  enabled?: boolean;
}

export function ZatcaPhase2Section({ invoiceData, enabled = true }: ZatcaPhase2SectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ZatcaProcessingResult | null>(null);
  const [generatedXml, setGeneratedXml] = useState<string>('');
  const [showXmlPreview, setShowXmlPreview] = useState(false);

  const generateXml = () => {
    try {
      const xml = generateZatcaXml({
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        invoiceType: 'STANDARD',
        sellerName: invoiceData.sellerName,
        sellerVatNumber: invoiceData.sellerVatNumber,
        sellerAddress: {
          countryCode: 'SA',
          city: 'Riyadh',
          district: 'Al Olaya'
        },
        buyerName: invoiceData.buyerName,
        buyerVatNumber: invoiceData.buyerVatNumber,
        buyerAddress: {
          countryCode: 'SA',
          city: 'Riyadh',
          district: 'Al Malaz'
        },
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        vatAmount: invoiceData.vatAmount,
        total: invoiceData.total
      });

      setGeneratedXml(xml);
      toast.success('ZATCA XML generated successfully');
      return xml;
    } catch (error) {
      console.error('Failed to generate ZATCA XML:', error);
      toast.error('Failed to generate ZATCA XML');
      return null;
    }
  };

  const processInvoice = async () => {
    if (!generatedXml) {
      const xml = generateXml();
      if (!xml) return;
    }

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const result = await processZatcaInvoice(generatedXml);
      setProcessingResult(result);

      if (result.success) {
        toast.success('ZATCA Phase 2 processing completed successfully');
      } else {
        toast.error('ZATCA Phase 2 processing failed: ' + result.message);
      }
    } catch (error) {
      console.error('ZATCA processing error:', error);
      toast.error('Failed to process invoice with ZATCA');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadXml = () => {
    if (!generatedXml) return;

    const blob = new Blob([generatedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zatca-invoice-${invoiceData.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSignedXml = () => {
    if (!processingResult?.signedXml) return;

    const blob = new Blob([processingResult.signedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zatca-signed-invoice-${invoiceData.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!enabled) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            ZATCA Phase 2 Processing
          </CardTitle>
          <CardDescription>
            ZATCA Phase 2 processing is disabled. Enable ZATCA compliance in invoice settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          ZATCA Phase 2 Processing
        </CardTitle>
        <CardDescription>
          Generate, validate, sign, and create QR codes for ZATCA Phase 2 compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XML Generation */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">1. Generate UBL 2.1 XML</h4>
            <p className="text-sm text-gray-600">Create ZATCA-compliant XML from invoice data</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateXml}
              disabled={isProcessing}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Generate XML
            </Button>
            {generatedXml && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowXmlPreview(!showXmlPreview)}
              >
                {showXmlPreview ? 'Hide' : 'Show'} Preview
              </Button>
            )}
          </div>
        </div>

        {/* XML Preview */}
        {showXmlPreview && generatedXml && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">Generated XML Preview</h5>
              <Button variant="outline" size="sm" onClick={downloadXml}>
                <Download className="h-4 w-4 mr-2" />
                Download XML
              </Button>
            </div>
            <Textarea
              value={generatedXml}
              readOnly
              className="h-32 text-xs font-mono"
            />
          </div>
        )}

        {/* ZATCA Processing */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">2. ZATCA Phase 2 Processing</h4>
            <p className="text-sm text-gray-600">Validate, generate hash, sign, and create QR code</p>
          </div>
          <Button
            onClick={processInvoice}
            disabled={isProcessing || !generatedXml}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Process with ZATCA'}
          </Button>
        </div>

        {/* Processing Results */}
        {processingResult && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              {processingResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className="font-medium">Processing Results</h4>
            </div>

            <Alert className={processingResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                {processingResult.message}
              </AlertDescription>
            </Alert>

            {/* Individual Results */}
            <div className="grid grid-cols-2 gap-4">
              {/* Validation */}
              <div className="flex items-center gap-2">
                {processingResult.validationPassed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Validation</span>
                <Badge variant={processingResult.validationPassed ? 'default' : 'destructive'}>
                  {processingResult.validationPassed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>

              {/* Hash */}
              <div className="flex items-center gap-2">
                {processingResult.hash ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <Hash className="h-4 w-4" />
                <span className="text-sm">Hash Generated</span>
              </div>

              {/* Signature */}
              <div className="flex items-center gap-2">
                {processingResult.signedXml ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <Shield className="h-4 w-4" />
                <span className="text-sm">Digital Signature</span>
              </div>

              {/* QR Code */}
              <div className="flex items-center gap-2">
                {processingResult.qrCode ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <QrCode className="h-4 w-4" />
                <span className="text-sm">QR Code</span>
              </div>
            </div>

            {/* Hash Display */}
            {processingResult.hash && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Invoice Hash</h5>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
                  {processingResult.hash}
                </div>
              </div>
            )}

            {/* QR Code Display */}
            {processingResult.qrCode && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">QR Code Data</h5>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
                  {processingResult.qrCode}
                </div>
              </div>
            )}

            {/* Download Actions */}
            {processingResult.signedXml && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadSignedXml}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Signed XML
                </Button>
              </div>
            )}

            {/* Details */}
            {processingResult.details && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Processing Details</summary>
                <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {processingResult.details}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
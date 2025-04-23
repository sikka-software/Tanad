import jsPDF from "jspdf";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/ui/page-title";

import { createQRCodeDataURL } from "@/utils/qrcode";
import { generateZatcaQrCode, generateZatcaXML } from "@/utils/zatca";

export default function ZatcaTestPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    sellerName: "Test Company Ltd",
    vatNumber: "310122393500003",
    timestamp: new Date().toISOString(),
    invoiceTotal: "115.00",
    vatAmount: "15.00",
    buyerName: "Test Customer",
    invoiceId: "INV-2023-001",
    created: Math.floor(Date.now() / 1000),
    currency: "SAR",
  });

  // Generate QR code image when base64 data changes
  useEffect(() => {
    if (qrCode) {
      createQRCodeDataURL(qrCode, 200)
        .then((dataURL) => {
          setQrCodeDataURL(dataURL);
        })
        .catch((error) => {
          console.error("Error generating QR code image:", error);
          toast.error("Error generating QR code image");
        });
    }
  }, [qrCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate QR Code
      const qrCodeBase64 = await generateZatcaQrCode({
        sellerName: formData.sellerName,
        vatNumber: formData.vatNumber,
        timestamp: formData.timestamp,
        invoiceTotal: formData.invoiceTotal,
        vatAmount: formData.vatAmount,
      });

      // Generate XML
      const xml = await generateZatcaXML({
        invoice: {
          id: formData.invoiceId,
          created: formData.created,
          currency: formData.currency,
        },
        vatNumber: formData.vatNumber,
        sellerName: formData.sellerName,
        buyerName: formData.buyerName,
        vatAmount: parseFloat(formData.vatAmount),
        totalWithVAT: parseFloat(formData.invoiceTotal),
      });

      setQrCode(qrCodeBase64);
      setXmlContent(xml);

      toast.success("ZATCA data generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating ZATCA data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setPdfGenerating(true);
    try {
      // Create PDF directly without html2canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set some default styles
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");

      // Add title
      const title = "Tax Invoice";
      const titleWidth =
        (pdf.getStringUnitWidth(title) * pdf.getFontSize()) / pdf.internal.scaleFactor;
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.text(title, (pageWidth - titleWidth) / 2, 20);

      // Add seller info
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(formData.sellerName, 20, 35);
      pdf.setFont("helvetica", "normal");
      pdf.text(`VAT: ${formData.vatNumber}`, 20, 42);
      pdf.text(`Date: ${new Date(formData.timestamp).toLocaleDateString()}`, 20, 49);
      pdf.text(`Invoice #: ${formData.invoiceId}`, 20, 56);

      // Add buyer info
      pdf.setFont("helvetica", "bold");
      pdf.text("Customer:", 20, 70);
      pdf.setFont("helvetica", "normal");
      pdf.text(formData.buyerName, 50, 70);

      // Add horizontal line
      pdf.line(20, 75, 190, 75);

      // Add table headers
      pdf.setFont("helvetica", "bold");
      pdf.text("Item", 20, 85);
      pdf.text("Amount", 170, 85, { align: "right" });
      pdf.line(20, 88, 190, 88);

      // Add items
      pdf.setFont("helvetica", "normal");
      const subtotal = parseFloat(formData.invoiceTotal) - parseFloat(formData.vatAmount);
      pdf.text("Goods/Services", 20, 95);
      pdf.text(`${subtotal.toFixed(2)} ${formData.currency}`, 170, 95, { align: "right" });

      // Add VAT
      const vatPercent = ((parseFloat(formData.vatAmount) / subtotal) * 100).toFixed(0);
      pdf.text(`VAT (${vatPercent}%)`, 20, 105);
      pdf.text(`${parseFloat(formData.vatAmount).toFixed(2)} ${formData.currency}`, 170, 105, {
        align: "right",
      });

      // Add total
      pdf.line(20, 110, 190, 110);
      pdf.setFont("helvetica", "bold");
      pdf.text("Total", 20, 118);
      pdf.text(`${parseFloat(formData.invoiceTotal).toFixed(2)} ${formData.currency}`, 170, 118, {
        align: "right",
      });

      // Add QR code
      if (qrCodeDataURL) {
        pdf.addImage(qrCodeDataURL, "PNG", 140, 30, 40, 40);
      } else {
        // Fallback if QR code image isn't available
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("ZATCA compliant invoice", 140, 35);
        pdf.text(`Scan QR code to verify`, 140, 40);
      }

      // Add footer
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const footerText1 = "This is a computer generated invoice and requires no signature.";
      const footerText2 = "Generated in compliance with ZATCA requirements.";
      pdf.text(footerText1, pageWidth / 2, 270, { align: "center" });
      pdf.text(footerText2, pageWidth / 2, 275, { align: "center" });

      // Save the PDF
      pdf.save(`ZATCA_Invoice_${formData.invoiceId}.pdf`);

      toast.success("PDF invoice generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  // Format XML for better display
  const formatXML = (xml: string) => {
    try {
      const serializer = new XMLSerializer();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "application/xml");
      return serializer.serializeToString(xmlDoc);
    } catch (error) {
      console.error("Error formatting XML:", error);
      return xml;
    }
  };

  return (
    <div>
      <CustomPageMeta title="ZATCA Test" />
      <PageTitle
        texts={{
          title: "ZATCA Invoice Test",
          submit_form: "Generate ZATCA Data",
          cancel: "Cancel",
        }}
      />

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerName">Seller Name</Label>
                  <Input
                    id="sellerName"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input
                    id="invoiceId"
                    name="invoiceId"
                    value={formData.invoiceId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timestamp">Timestamp</Label>
                  <Input
                    id="timestamp"
                    name="timestamp"
                    value={formData.timestamp}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerName">Buyer Name</Label>
                  <Input
                    id="buyerName"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceTotal">Invoice Total (with VAT)</Label>
                  <Input
                    id="invoiceTotal"
                    name="invoiceTotal"
                    value={formData.invoiceTotal}
                    onChange={handleInputChange}
                    required
                    type="number"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatAmount">VAT Amount</Label>
                  <Input
                    id="vatAmount"
                    name="vatAmount"
                    value={formData.vatAmount}
                    onChange={handleInputChange}
                    required
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Generating..." : "Generate ZATCA Data"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {(qrCode || xmlContent) && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated ZATCA Data</CardTitle>
                {qrCode && (
                  <Button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    variant="outline"
                    size="sm"
                  >
                    {pdfGenerating ? "Generating..." : "Download PDF Invoice"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div ref={invoiceRef} className="rounded-lg bg-white p-4">
                  <h2 className="mb-4 text-center text-xl font-bold">Tax Invoice</h2>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">{formData.sellerName}</p>
                      <p>VAT: {formData.vatNumber}</p>
                      <p>Date: {new Date(formData.timestamp).toLocaleDateString()}</p>
                      <p>Invoice #: {formData.invoiceId}</p>
                    </div>
                    <div className="flex justify-end">
                      {qrCodeDataURL && (
                        <img src={qrCodeDataURL} alt="ZATCA QR Code" width={120} height={120} />
                      )}
                    </div>
                  </div>

                  <div className="mb-4 border-t border-b py-2">
                    <p>
                      <span className="font-semibold">Customer:</span> {formData.buyerName}
                    </p>
                  </div>

                  <table className="mb-4 w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Item</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">Goods/Services</td>
                        <td className="py-2 text-right">
                          {(
                            parseFloat(formData.invoiceTotal) - parseFloat(formData.vatAmount)
                          ).toFixed(2)}{" "}
                          {formData.currency}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-2">
                          VAT (
                          {(
                            (parseFloat(formData.vatAmount) /
                              (parseFloat(formData.invoiceTotal) -
                                parseFloat(formData.vatAmount))) *
                            100
                          ).toFixed(0)}
                          %)
                        </td>
                        <td className="py-2 text-right">
                          {parseFloat(formData.vatAmount).toFixed(2)} {formData.currency}
                        </td>
                      </tr>
                      <tr className="border-t font-bold">
                        <td className="py-2">Total</td>
                        <td className="py-2 text-right">
                          {parseFloat(formData.invoiceTotal).toFixed(2)} {formData.currency}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-center text-sm text-gray-500">
                    <p>This is a computer generated invoice and requires no signature.</p>
                    <p>Generated in compliance with ZATCA requirements.</p>
                  </div>
                </div>

                {qrCode && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-medium">TLV-encoded base64 data:</p>
                    <p className="font-mono text-xs break-all">{qrCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {xmlContent && (
              <Card>
                <CardHeader>
                  <CardTitle>XML Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-80 overflow-auto rounded-md bg-gray-50 p-3">
                    <pre className="font-mono text-xs whitespace-pre-wrap">
                      {formatXML(xmlContent)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale || "en"}.json`)).default,
    },
  };
};

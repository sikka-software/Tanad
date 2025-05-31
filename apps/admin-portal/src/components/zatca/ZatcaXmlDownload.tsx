import { Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { generateZatcaXml } from "@/lib/zatca/zatca-xml";

import { Invoice } from "@/modules/invoice/invoice.type";

interface ZatcaXmlDownloadProps {
  invoice: Invoice;
  className?: string;
}

export function ZatcaXmlDownload({ invoice, className }: ZatcaXmlDownloadProps) {
  const t = useTranslations();
  const [xmlContent, setXmlContent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Transform invoice data to the format expected by generateZatcaXml
  const generateXml = () => {
    try {
      if (!invoice) {
        toast.error("Invalid invoice data");
        return;
      }

      if (!invoice.seller_name || !invoice.vat_number) {
        toast.error("Missing ZATCA required information", {
          description: "Seller name and VAT number are required for ZATCA compliance",
        });
        return;
      }

      const invoiceItems = invoice.items || [];
      if (invoiceItems.length === 0) {
        toast.error("Invoice must have at least one item");
        return;
      }

      // Map invoice items to ZATCA format
      const zatcaItems = invoiceItems.map((item) => ({
        name: item.description || "Item",
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        vatRate: (invoice.tax_rate || 0) * 100, // Convert decimal to percentage
        vatAmount: (item.unit_price || 0) * (item.quantity || 1) * (invoice.tax_rate || 0),
        subtotal: (item.unit_price || 0) * (item.quantity || 1),
        total: (item.unit_price || 0) * (item.quantity || 1) * (1 + (invoice.tax_rate || 0)),
      }));

      // Create ZATCA invoice data structure
      const zatcaInvoiceData = {
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date || new Date().toISOString(),
        dueDate: invoice.due_date || undefined,
        invoiceType: "SIMPLIFIED" as const, // Default to simplified, can be made dynamic based on invoice type

        sellerName: invoice.seller_name,
        sellerVatNumber: invoice.vat_number,
        sellerAddress: {
          countryCode: "SA", // Default to Saudi Arabia
          // Add more seller address fields if available
        },

        buyerName: invoice.client?.name || "Customer",
        // Use a more generic VatNumber field - the client doesn't have a tax_number field
        buyerVatNumber: undefined,
        buyerAddress: {
          // Use the available address fields from client
          street: invoice.client?.street_name || "",
          buildingNumber: invoice.client?.building_number || "",
          city: invoice.client?.city || "",
          postalCode: invoice.client?.zip_code || "",
          countryCode: invoice.client?.country || "SA", // Default to Saudi Arabia
        },

        items: zatcaItems,
        subtotal: invoice.subtotal || 0,
        vatAmount: invoice.tax_amount || 0,
        total: invoice.total || 0,
      };

      // Generate XML
      const xml = generateZatcaXml(zatcaInvoiceData);
      setXmlContent(xml);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error generating ZATCA XML:", error);
      toast.error("Failed to generate ZATCA XML");
    }
  };

  const downloadXml = () => {
    if (!xmlContent) {
      toast.error("No XML content to download");
      return;
    }

    try {
      // Create a blob from the XML string
      const blob = new Blob([xmlContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `zatca-invoice-${invoice.invoice_number}.xml`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("XML downloaded successfully");
    } catch (error) {
      console.error("Error downloading XML:", error);
      toast.error("Failed to download XML");
    }
  };

  const copyXmlToClipboard = () => {
    if (!xmlContent) {
      toast.error("No XML content to copy");
      return;
    }

    navigator.clipboard
      .writeText(xmlContent)
      .then(() => toast.success("XML copied to clipboard"))
      .catch(() => toast.error("Failed to copy XML to clipboard"));
  };

  return (
    <>
      <Button
        onClick={generateXml}
        variant="outline"
        size="sm"
        className={`flex items-center gap-1.5 ${className}`}
      >
        <FileText className="h-4 w-4" />
        {t("Invoices.zatca_generate_xml", { fallback: "Generate ZATCA XML" })}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("Invoices.zatca_xml_title", { fallback: "ZATCA Phase 2 XML" })}
            </DialogTitle>
            <DialogDescription>
              {t("Invoices.zatca_xml_description", {
                fallback: "UBL 2.1 XML for ZATCA Phase 2 compliance",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Textarea value={xmlContent} readOnly rows={20} className="font-mono text-xs" />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={copyXmlToClipboard}>
              {t("General.copy_to_clipboard", { fallback: "Copy to Clipboard" })}
            </Button>
            <Button onClick={downloadXml}>
              <Download className="mr-2 h-4 w-4" />
              {t("Invoices.zatca_download_xml", { fallback: "Download XML" })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZatcaComplianceBadge } from "@/components/zatca/ZatcaComplianceBadge";
import { ZatcaQRCode } from "@/components/zatca/ZatcaQRCode";
import { ZatcaXmlDownload } from "@/components/zatca/ZatcaXmlDownload";

import { calculateVAT } from "@/lib/zatca/zatca-utils";

import { Invoice } from "@/modules/invoice/invoice.type";

interface InvoiceZatcaSectionProps {
  invoice: Invoice;
  className?: string;
}

export function InvoiceZatcaSection({ invoice, className }: InvoiceZatcaSectionProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2">("phase1");

  // Return early if ZATCA is not enabled for this invoice
  if (!invoice.zatca_enabled) {
    return null;
  }

  // Calculate tax amount if not provided
  const taxAmount =
    invoice.tax_amount || calculateVAT(invoice.subtotal || 0, invoice.tax_rate || 0);

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {t("Invoices.zatca_section_title", { fallback: "ZATCA Compliance" })}
          </h3>
          <div className="flex items-center gap-2">
            <ZatcaComplianceBadge invoice={invoice} phase={activeTab === "phase1" ? 1 : 2} />
            <ZatcaXmlDownload invoice={invoice} />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "phase1" | "phase2")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="phase1">
              {t("Invoices.zatca_phase1", { fallback: "Phase 1 (QR Code)" })}
            </TabsTrigger>
            <TabsTrigger value="phase2">
              {t("Invoices.zatca_phase2", { fallback: "Phase 2 (UBL XML)" })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phase1" className="space-y-4">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* ZATCA QR Code */}
              <div className="flex-shrink-0">
                <ZatcaQRCode
                  sellerName={invoice.seller_name || ""}
                  vatNumber={invoice.vat_number || ""}
                  invoiceTimestamp={
                    invoice.issue_date
                      ? new Date(invoice.issue_date).toISOString()
                      : new Date().toISOString()
                  }
                  invoiceTotal={parseFloat((invoice.total || 0).toFixed(2))}
                  vatAmount={parseFloat(taxAmount.toFixed(2))}
                  size={120}
                />
              </div>

              {/* ZATCA Details */}
              <div className="flex-grow space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("Invoices.zatca_seller_name", { fallback: "Seller Name" })}
                  </p>
                  <p className="font-medium">{invoice.seller_name || "-"}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("Invoices.zatca_vat_number", { fallback: "VAT Registration Number" })}
                  </p>
                  <p className="font-medium">{invoice.vat_number || "-"}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("Invoices.zatca_tax_amount", { fallback: "VAT Amount" })}
                  </p>
                  <p className="font-medium">{taxAmount.toFixed(2)} SAR</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="phase2" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm">
                  {t("Invoices.zatca_phase2_explanation", {
                    fallback:
                      "ZATCA Phase 2 compliance requires generating a UBL 2.1 XML file with specific fields and structure. Use the 'Generate ZATCA XML' button to create and download the XML file for this invoice.",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">
                    {t("Invoices.zatca_invoice_details", { fallback: "Invoice Details" })}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.invoice_number", { fallback: "Invoice Number" })}
                      </p>
                      <p className="text-sm">{invoice.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.issue_date", { fallback: "Issue Date" })}
                      </p>
                      <p className="text-sm">
                        {invoice.issue_date
                          ? new Date(invoice.issue_date).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.total_amount", { fallback: "Total Amount" })}
                      </p>
                      <p className="text-sm">{invoice.total?.toFixed(2) || "0.00"} SAR</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">
                    {t("Invoices.zatca_buyer_details", { fallback: "Buyer Details" })}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.buyer_name", { fallback: "Buyer Name" })}
                      </p>
                      <p className="text-sm">{invoice.client?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.buyer_city", { fallback: "City" })}
                      </p>
                      <p className="text-sm">{invoice.client?.city || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {t("Invoices.buyer_country", { fallback: "Country" })}
                      </p>
                      <p className="text-sm">{invoice.client?.country || "Saudi Arabia"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

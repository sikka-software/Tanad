import { useTranslations } from "next-intl";
import { useState } from "react";

import { ZatcaComplianceBadge } from "@/components/zatca/ZatcaComplianceBadge";
import { ZatcaQRCode } from "@/components/zatca/ZatcaQRCode";

import { calculateVAT } from "@/lib/zatca/zatca-utils";

interface InvoiceZatcaSectionProps {
  invoice: any;
  className?: string;
}

export function InvoiceZatcaSection({ invoice, className }: InvoiceZatcaSectionProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

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
          <ZatcaComplianceBadge invoice={invoice} />
        </div>

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

        {isExpanded && (
          <div className="bg-muted/50 mt-4 rounded p-3 text-sm">
            <p className="mb-2 font-medium">
              {t("Invoices.zatca_qr_info", { fallback: "QR Code Information" })}:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                {t("Invoices.zatca_qr_info_1", {
                  fallback: "This QR code complies with ZATCA Phase 1 requirements",
                })}
              </li>
              <li>
                {t("Invoices.zatca_qr_info_2", {
                  fallback:
                    "It contains seller name, VAT number, timestamp, invoice total, and VAT amount",
                })}
              </li>
              <li>
                {t("Invoices.zatca_qr_info_3", {
                  fallback:
                    "The data is encoded in TLV (Tag-Length-Value) format as required by ZATCA",
                })}
              </li>
            </ul>
          </div>
        )}

        <button
          type="button"
          className="text-primary hover:text-primary/80 text-sm font-medium underline-offset-4 hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded
            ? t("General.show_less", { fallback: "Show Less" })
            : t("General.show_more", { fallback: "Show More" })}
        </button>
      </div>
    </div>
  );
}

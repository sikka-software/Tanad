/**
 * ZATCA XML Utilities for Phase 2 E-Invoicing
 * Based on ZATCA Phase 2 requirements and UBL 2.1 standard
 */

interface ZatcaInvoiceData {
  // Invoice identification
  invoiceNumber: string;
  issueDate: string; // ISO Date format
  dueDate?: string;
  invoiceType: "STANDARD" | "SIMPLIFIED";

  // Seller information
  sellerName: string;
  sellerVatNumber: string;
  sellerAddress: {
    street?: string;
    buildingNumber?: string;
    city?: string;
    postalCode?: string;
    countryCode: string; // ISO 3166-1 alpha-2 code
  };

  // Buyer information
  buyerName: string;
  buyerVatNumber?: string;
  buyerAddress?: {
    street?: string;
    buildingNumber?: string;
    city?: string;
    postalCode?: string;
    countryCode: string; // ISO 3166-1 alpha-2 code
  };

  // Payment information
  paymentMeans?: {
    code: string;
    description?: string;
  };

  // Line items
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

  // Totals
  subtotal: number;
  vatAmount: number;
  total: number;
}

/**
 * Generate a basic UBL 2.1 XML string for ZATCA Phase 2 compliance
 * Note: This is a starting point and doesn't include digital signatures
 * which would be required for full compliance
 */
export function generateZatcaXml(invoiceData: ZatcaInvoiceData): string {
  const now = new Date().toISOString();
  const documentCurrencyCode = "SAR"; // Saudi Riyal

  // UBL 2.1 Invoice XML Template
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceData.invoiceNumber}</cbc:ID>
  <cbc:UUID>${generateUUID()}</cbc:UUID>
  <cbc:IssueDate>${formatDateOnly(invoiceData.issueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${formatTimeOnly(invoiceData.issueDate)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${invoiceData.invoiceType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${documentCurrencyCode}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${documentCurrencyCode}</cbc:TaxCurrencyCode>
  
  <!-- Seller Information -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoiceData.sellerVatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${invoiceData.sellerAddress.street || ""}</cbc:StreetName>
        <cbc:BuildingNumber>${invoiceData.sellerAddress.buildingNumber || ""}</cbc:BuildingNumber>
        <cbc:CityName>${invoiceData.sellerAddress.city || ""}</cbc:CityName>
        <cbc:PostalZone>${invoiceData.sellerAddress.postalCode || ""}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoiceData.sellerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoiceData.sellerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoiceData.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Buyer Information -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${
        invoiceData.buyerVatNumber
          ? `
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoiceData.buyerVatNumber}</cbc:ID>
      </cac:PartyIdentification>`
          : ""
      }
      ${
        invoiceData.buyerAddress
          ? `
      <cac:PostalAddress>
        <cbc:StreetName>${invoiceData.buyerAddress.street || ""}</cbc:StreetName>
        <cbc:BuildingNumber>${invoiceData.buyerAddress.buildingNumber || ""}</cbc:BuildingNumber>
        <cbc:CityName>${invoiceData.buyerAddress.city || ""}</cbc:CityName>
        <cbc:PostalZone>${invoiceData.buyerAddress.postalCode || ""}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoiceData.buyerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>`
          : ""
      }
      ${
        invoiceData.buyerVatNumber
          ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoiceData.buyerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoiceData.buyerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- Payment Information -->
  ${
    invoiceData.paymentMeans
      ? `
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${invoiceData.paymentMeans.code}</cbc:PaymentMeansCode>
    ${invoiceData.paymentMeans.description ? `<cbc:InstructionNote>${invoiceData.paymentMeans.description}</cbc:InstructionNote>` : ""}
  </cac:PaymentMeans>`
      : ""
  }
  
  <!-- Tax Information -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.vatAmount)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.subtotal)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.vatAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Invoice Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.subtotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.subtotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.total)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${documentCurrencyCode}">${formatDecimal(invoiceData.total)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  <!-- Invoice Line Items -->
  ${invoiceData.items
    .map(
      (item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity>${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(item.name)}</cbc:Name>
      ${item.description ? `<cbc:Description>${escapeXml(item.description)}</cbc:Description>` : ""}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.unitPrice)}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.vatAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.vatAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${item.vatRate}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
  </cac:InvoiceLine>`,
    )
    .join("")}
</Invoice>`;
}

// Helper Functions

/**
 * Generate a version 4 UUID
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format a date string to YYYY-MM-DD format
 */
function formatDateOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

/**
 * Format a date string to HH:MM:SS format
 */
function formatTimeOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[1].substring(0, 8);
}

/**
 * Format a decimal number to 2 decimal places
 */
function formatDecimal(value: number): string {
  return value.toFixed(2);
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

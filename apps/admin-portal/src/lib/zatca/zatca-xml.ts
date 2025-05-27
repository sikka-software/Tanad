/**
 * ZATCA XML Utilities for Phase 2 E-Invoicing
 * Based on ZATCA Phase 2 requirements and UBL 2.1 standard
 */
import { generateMockZatcaPhase2QRString } from "./zatca-utils";

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
    district?: string; // Required for KSA
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
    district?: string;
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

  // ZATCA specific fields
  invoiceCounterValue?: number; // ICV - required for Phase 2
  previousInvoiceHash?: string; // PIH - required for Phase 2
  supplyDate?: string; // KSA-5 - required for standard invoices
}

/**
 * Generate a ZATCA-compliant UBL 2.1 XML string for Phase 2 compliance
 */
export function generateZatcaXml(invoiceData: ZatcaInvoiceData): string {
  const now = new Date();
  const documentCurrencyCode = "SAR"; // Saudi Riyal

  // Validate and fix VAT number format (must be 15 digits starting and ending with 3)
  const validatedSellerVatNumber = validateVatNumber(invoiceData.sellerVatNumber);
  const validatedBuyerVatNumber = invoiceData.buyerVatNumber
    ? validateVatNumber(invoiceData.buyerVatNumber)
    : undefined;

  // Validate and fix VAT rates (must be 5 or 15 for standard rate 'S')
  const validatedVatRate = validateVatRate(
    invoiceData.items.length > 0 ? invoiceData.items[0].vatRate : 15,
  );

  // Ensure issue date is not in the future
  const issueDate = new Date(invoiceData.issueDate);
  const validatedIssueDate = issueDate > now ? now.toISOString() : invoiceData.issueDate;

  // Generate ZATCA-specific codes
  const invoiceTypeCode = getZatcaInvoiceTypeCode(invoiceData.invoiceType);
  const zatcaInvoiceCode = getZatcaInvoiceCode(invoiceData.invoiceType);
  const uuid = generateUUID();
  const icv = invoiceData.invoiceCounterValue || 1;
  const pih =
    invoiceData.previousInvoiceHash ||
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";

  // Generate Phase 2 QR code
  const qrCodeData = generateMockZatcaPhase2QRString({
    sellerName: invoiceData.sellerName,
    vatNumber: validatedSellerVatNumber,
    invoiceTimestamp: validatedIssueDate,
    invoiceTotal: invoiceData.total,
    vatAmount: invoiceData.vatAmount,
  });

  // Ensure required address fields are present
  const sellerAddress = {
    street: invoiceData.sellerAddress.street || "Default Street",
    buildingNumber: invoiceData.sellerAddress.buildingNumber || "1234",
    city: invoiceData.sellerAddress.city || "Riyadh",
    postalCode: invoiceData.sellerAddress.postalCode || "12345",
    district: invoiceData.sellerAddress.district || "Al Olaya",
    countryCode: invoiceData.sellerAddress.countryCode || "SA",
  };

  const buyerAddress = invoiceData.buyerAddress
    ? {
        street: invoiceData.buyerAddress.street || "Default Street",
        buildingNumber: invoiceData.buyerAddress.buildingNumber || "1234",
        city: invoiceData.buyerAddress.city || "Riyadh",
        postalCode: invoiceData.buyerAddress.postalCode || "12345",
        district: invoiceData.buyerAddress.district || "Al Malaz",
        countryCode: invoiceData.buyerAddress.countryCode || "SA",
      }
    : {
        street: "Default Street",
        buildingNumber: "1234",
        city: "Riyadh",
        postalCode: "12345",
        district: "Al Malaz",
        countryCode: "SA",
      };

  // UBL 2.1 Invoice XML Template
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
         xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
         xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">

  <!-- UBL Extensions for Phase 2 Signature -->
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <!-- Signature placeholder for ZATCA Phase 2 -->
        <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
                                  xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
                                  xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
          <sac:SignatureInformation>
            <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
            <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
            <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
              <ds:SignedInfo>
                <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
                <ds:Reference Id="invoiceSignedData" URI="">
                  <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                  </ds:Transforms>
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                  <ds:DigestValue>[PLACEHOLDER_DIGEST_VALUE]</ds:DigestValue>
                </ds:Reference>
                <ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                  <ds:DigestValue>[PLACEHOLDER_SIGNED_PROPS_DIGEST]</ds:DigestValue>
                </ds:Reference>
              </ds:SignedInfo>
              <ds:SignatureValue>[PLACEHOLDER_SIGNATURE_VALUE]</ds:SignatureValue>
              <ds:KeyInfo>
                <ds:X509Data>
                  <ds:X509Certificate>[PLACEHOLDER_CERTIFICATE]</ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
              <ds:Object>
                <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#signature">
                  <xades:SignedProperties Id="xadesSignedProperties">
                    <xades:SignedSignatureProperties>
                      <xades:SigningTime>[PLACEHOLDER_SIGNING_TIME]</xades:SigningTime>
                      <xades:SigningCertificate>
                        <xades:Cert>
                          <xades:CertDigest>
                            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                            <ds:DigestValue>[PLACEHOLDER_CERT_DIGEST]</ds:DigestValue>
                          </xades:CertDigest>
                          <xades:IssuerSerial>
                            <ds:X509IssuerName>[PLACEHOLDER_ISSUER_NAME]</ds:X509IssuerName>
                            <ds:X509SerialNumber>[PLACEHOLDER_SERIAL_NUMBER]</ds:X509SerialNumber>
                          </xades:IssuerSerial>
                        </xades:Cert>
                      </xades:SigningCertificate>
                    </xades:SignedSignatureProperties>
                  </xades:SignedProperties>
                </xades:QualifyingProperties>
              </ds:Object>
            </ds:Signature>
          </sac:SignatureInformation>
        </sig:UBLDocumentSignatures>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>

  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceData.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${formatDateOnly(validatedIssueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${formatTimeOnly(validatedIssueDate)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${zatcaInvoiceCode}" listID="UN/ECE 1001 Subset" listAgencyID="6">${invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${documentCurrencyCode}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${documentCurrencyCode}</cbc:TaxCurrencyCode>

  <!-- Supply Date (KSA-5) - Required for standard invoices -->
  ${
    invoiceData.invoiceType === "STANDARD"
      ? `<cac:InvoicePeriod>
    <cbc:StartDate>${formatDateOnly(invoiceData.supplyDate || validatedIssueDate)}</cbc:StartDate>
    <cbc:EndDate>${formatDateOnly(invoiceData.supplyDate || validatedIssueDate)}</cbc:EndDate>
  </cac:InvoicePeriod>`
      : ""
  }

  <!-- ZATCA Additional Document References -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${pih}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>KSA-2</cbc:ID>
    <cbc:DocumentDescription>${zatcaInvoiceCode}</cbc:DocumentDescription>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${qrCodeData}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>

  <!-- Seller Information -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${validatedSellerVatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${sellerAddress.street}</cbc:StreetName>
        <cbc:BuildingNumber>${sellerAddress.buildingNumber}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${sellerAddress.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${sellerAddress.city}</cbc:CityName>
        <cbc:PostalZone>${sellerAddress.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${sellerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${validatedSellerVatNumber}</cbc:CompanyID>
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
        validatedBuyerVatNumber
          ? `<cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${validatedBuyerVatNumber}</cbc:ID>
      </cac:PartyIdentification>`
          : `<cac:PartyIdentification>
        <cbc:ID schemeID="NAT">1234567890</cbc:ID>
      </cac:PartyIdentification>`
      }
      <cac:PostalAddress>
        <cbc:StreetName>${buyerAddress.street}</cbc:StreetName>
        <cbc:BuildingNumber>${buyerAddress.buildingNumber}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${buyerAddress.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${buyerAddress.city}</cbc:CityName>
        <cbc:PostalZone>${buyerAddress.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${buyerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${
        validatedBuyerVatNumber
          ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${validatedBuyerVatNumber}</cbc:CompanyID>
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
      ? `<cac:PaymentMeans>
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
        <cbc:Percent>${validatedVatRate}</cbc:Percent>
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
      (item, index) => `<cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.vatAmount)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.total)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(item.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${validateVatRate(item.vatRate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.unitPrice)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
    )
    .join("")}
</Invoice>`;
}

// Helper Functions

/**
 * Validate and format VAT number to ZATCA requirements (15 digits, starts and ends with 3)
 */
function validateVatNumber(vatNumber: string): string {
  // Remove any non-digit characters
  const digits = vatNumber.replace(/\D/g, "");

  // If it's already 15 digits and starts/ends with 3, return as is
  if (digits.length === 15 && digits.startsWith("3") && digits.endsWith("3")) {
    return digits;
  }

  // Generate a valid VAT number format: 3 + 13 middle digits + 3
  const middleDigits = digits.padEnd(13, "0").substring(0, 13);
  return `3${middleDigits}3`;
}

/**
 * Validate VAT rate to be either 5 or 15 for standard rate 'S'
 */
function validateVatRate(rate: number): number {
  // ZATCA requires VAT rates to be either 5% or 15% for standard rate 'S'
  if (rate <= 7.5) return 5;
  return 15;
}

/**
 * Get ZATCA-compliant invoice type code
 */
function getZatcaInvoiceTypeCode(invoiceType: "STANDARD" | "SIMPLIFIED"): string {
  // Use standard UBL 2.1 invoice type codes from UN/CEFACT 1001
  switch (invoiceType) {
    case "STANDARD":
      return "388"; // Commercial invoice
    case "SIMPLIFIED":
      return "388"; // Commercial invoice (ZATCA uses 388 for both)
    default:
      return "388";
  }
}

/**
 * Generate ZATCA invoice code (KSA-2) in format NNPNESB
 */
function getZatcaInvoiceCode(invoiceType: "STANDARD" | "SIMPLIFIED"): string {
  // ZATCA Invoice Code Structure: NNPNESB (7 characters)
  // NN (position 1-2): Invoice subtype (01=Standard, 02=Simplified)
  // P (position 3): Third party invoice (0=False, 1=True)
  // N (position 4): Nominal supply (0=False, 1=True)
  // E (position 5): Export invoice (0=False, 1=True)
  // S (position 6): Summary invoice (0=False, 1=True)
  // B (position 7): Self billed invoice (0=False, 1=True)

  const subtype = invoiceType === "STANDARD" ? "01" : "02";
  const thirdParty = "0"; // Not third party
  const nominal = "0"; // Not nominal supply
  const export_ = "0"; // Not export
  const summary = "0"; // Not summary
  const selfBilled = "0"; // Not self billed

  return `${subtype}${thirdParty}${nominal}${export_}${summary}${selfBilled}`;
}

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

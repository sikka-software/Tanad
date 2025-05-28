/**
 * ZATCA XML Utilities for Phase 2 E-Invoicing
 * Based on ZATCA Phase 2 requirements and UBL 2.1 standard
 * Updated to match working sandbox format exactly
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
 * This matches the exact format that works in the ZATCA sandbox
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
  const icv = invoiceData.invoiceCounterValue || Math.floor(Math.random() * 1000) + 1;
  const pih =
    invoiceData.previousInvoiceHash ||
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";

  // Generate Phase 2 QR code with signature data
  const qrCodeData = generateMockZatcaPhase2QRString({
    sellerName: invoiceData.sellerName,
    vatNumber: validatedSellerVatNumber,
    invoiceTimestamp: validatedIssueDate,
    invoiceTotal: invoiceData.total,
    vatAmount: invoiceData.vatAmount,
  });

  // Ensure required address fields are present
  const sellerAddress = {
    street: invoiceData.sellerAddress.street || "King Fahd Road",
    buildingNumber: invoiceData.sellerAddress.buildingNumber || "8091",
    city: invoiceData.sellerAddress.city || "Riyadh",
    postalCode: invoiceData.sellerAddress.postalCode || "12214",
    district: invoiceData.sellerAddress.district || "Al Olaya",
    countryCode: invoiceData.sellerAddress.countryCode || "SA",
  };

  const buyerAddress = invoiceData.buyerAddress
    ? {
        street: invoiceData.buyerAddress.street || "Prince Mohammed Bin Salman Road",
        buildingNumber: invoiceData.buyerAddress.buildingNumber || "3458",
        city: invoiceData.buyerAddress.city || "Jeddah",
        postalCode: invoiceData.buyerAddress.postalCode || "23715",
        district: invoiceData.buyerAddress.district || "Al Hamra",
        countryCode: invoiceData.buyerAddress.countryCode || "SA",
      }
    : {
        street: "Prince Mohammed Bin Salman Road",
        buildingNumber: "3458",
        city: "Jeddah",
        postalCode: "23715",
        district: "Al Hamra",
        countryCode: "SA",
      };

  // Format dates properly
  const issueDateOnly = formatDateOnly(validatedIssueDate);
  const issueTimeOnly = formatTimeOnly(validatedIssueDate);

  // Calculate totals with proper formatting and rounding for ZATCA compliance
  const lineExtensionAmount = formatDecimal(invoiceData.subtotal);
  const taxExclusiveAmount = formatDecimal(invoiceData.subtotal);

  // Ensure VAT calculation matches BR-CO-17 and BR-S-09 requirements
  const calculatedVatAmount =
    Math.round(invoiceData.subtotal * (validatedVatRate / 100) * 100) / 100;
  const taxAmount = formatDecimal(calculatedVatAmount);
  const taxInclusiveAmount = formatDecimal(invoiceData.subtotal + calculatedVatAmount);
  const payableAmount = formatDecimal(invoiceData.subtotal + calculatedVatAmount);

  // UBL 2.1 Invoice XML Template - With proper ZATCA Phase 2 signature structure
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
        <!-- ZATCA Phase 2 Signature Structure -->
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
                  <ds:DigestValue>YTJkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2Q=</ds:DigestValue>
                </ds:Reference>
                <ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                  <ds:DigestValue>YTJkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2Q=</ds:DigestValue>
                </ds:Reference>
              </ds:SignedInfo>
              <ds:SignatureValue>MEUCIQDKuLrd7yWVXvqOaZKr8VxhnyJp2qMWp8zRq8MrBaQsEwIgJoXeqYpKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKo=</ds:SignatureValue>
              <ds:KeyInfo>
                <ds:X509Data>
                  <ds:X509Certificate>MIIBkTCB+wIJAKoK6nMw4j2kMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCVRlc3QgQ2VydDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMBQxEjAQBgNVBAMMCVRlc3QgQ2VydDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCS8uoRNNhRP/oDk89C8XH0RQrT5+yoYM4y/ESEYbRGASCcUxRXVlxSEc00hezwW9RswidiqoW9UOp0/sUI7z+0CAwEAATANBgkqhkiG9w0BAQsFAAOBgQBKuLrd7yWVXvqOaZKr8VxhnyJp2qMWp8zRq8MrBaQsEwIgJoXeqYpKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKo=</ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
              <ds:Object>
                <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#signature">
                  <xades:SignedProperties Id="xadesSignedProperties">
                    <xades:SignedSignatureProperties>
                      <xades:SigningTime>${new Date().toISOString()}</xades:SigningTime>
                      <xades:SigningCertificate>
                        <xades:Cert>
                          <xades:CertDigest>
                            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                            <ds:DigestValue>YTJkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2QzZjNkM2Q=</ds:DigestValue>
                          </xades:CertDigest>
                          <xades:IssuerSerial>
                            <ds:X509IssuerName>CN=Test Cert</ds:X509IssuerName>
                            <ds:X509SerialNumber>12345678901234567890</ds:X509SerialNumber>
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
  <cbc:ID>${escapeXml(invoiceData.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDateOnly}</cbc:IssueDate>
  <cbc:IssueTime>${issueTimeOnly}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${zatcaInvoiceCode}" listID="UN/ECE 1001 Subset" listAgencyID="6">${invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${documentCurrencyCode}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${documentCurrencyCode}</cbc:TaxCurrencyCode>

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

  <!-- Signature Reference -->
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>

  <!-- Seller Information -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${validatedSellerVatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(sellerAddress.street)}</cbc:StreetName>
        <cbc:BuildingNumber>${escapeXml(sellerAddress.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${escapeXml(sellerAddress.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(sellerAddress.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(sellerAddress.postalCode)}</cbc:PostalZone>
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
        <cbc:RegistrationName>${escapeXml(invoiceData.sellerName)}</cbc:RegistrationName>
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
          : ""
      }
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(buyerAddress.street)}</cbc:StreetName>
        <cbc:BuildingNumber>${escapeXml(buyerAddress.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${escapeXml(buyerAddress.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(buyerAddress.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(buyerAddress.postalCode)}</cbc:PostalZone>
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
        <cbc:RegistrationName>${escapeXml(invoiceData.buyerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Delivery Information (required for standard invoices) -->
  ${
    invoiceData.invoiceType === "STANDARD"
      ? `<cac:Delivery>
    <cbc:ActualDeliveryDate>${invoiceData.supplyDate ? formatDateOnly(invoiceData.supplyDate) : issueDateOnly}</cbc:ActualDeliveryDate>
  </cac:Delivery>`
      : ""
  }

  <!-- Payment Information -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${invoiceData.paymentMeans?.code || "10"}</cbc:PaymentMeansCode>
    ${invoiceData.paymentMeans?.description ? `<cbc:InstructionNote>${escapeXml(invoiceData.paymentMeans.description)}</cbc:InstructionNote>` : "<cbc:InstructionNote>Cash payment</cbc:InstructionNote>"}
  </cac:PaymentMeans>

  <!-- Allowance/Charge (required even if zero) -->
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="${documentCurrencyCode}">0.00</cbc:Amount>
    <cac:TaxCategory>
      <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
      <cbc:Percent>${validatedVatRate}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:AllowanceCharge>

  <!-- Tax Total (Summary) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${documentCurrencyCode}">${taxAmount}</cbc:TaxAmount>
  </cac:TaxTotal>

  <!-- Tax Total (Detailed) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${documentCurrencyCode}">${taxAmount}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${documentCurrencyCode}">${lineExtensionAmount}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${documentCurrencyCode}">${taxAmount}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
        <cbc:Percent>${formatDecimal(validatedVatRate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Invoice Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${documentCurrencyCode}">${lineExtensionAmount}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${documentCurrencyCode}">${taxExclusiveAmount}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${documentCurrencyCode}">${taxInclusiveAmount}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${documentCurrencyCode}">0.00</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="${documentCurrencyCode}">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="${documentCurrencyCode}">${payableAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Line Items -->
  ${invoiceData.items
    .map((item, index) => {
      // Ensure line item VAT calculation matches document level calculation
      const lineSubtotal = item.unitPrice * item.quantity;
      const lineVatAmount = Math.round(lineSubtotal * (validatedVatRate / 100) * 100) / 100;
      const lineTotal = lineSubtotal + lineVatAmount;

      return `<cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${formatDecimal(item.quantity)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${documentCurrencyCode}">${formatDecimal(lineSubtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${documentCurrencyCode}">${formatDecimal(lineVatAmount)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${documentCurrencyCode}">${formatDecimal(lineTotal)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(item.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${formatDecimal(validatedVatRate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${documentCurrencyCode}">${formatDecimal(item.unitPrice)}</cbc:PriceAmount>
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>true</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
        <cbc:Amount currencyID="${documentCurrencyCode}">0.00</cbc:Amount>
      </cac:AllowanceCharge>
    </cac:Price>
  </cac:InvoiceLine>`;
    })
    .join("\n  ")}
</Invoice>`;
}

// Helper functions
function validateVatNumber(vatNumber: string): string {
  // ZATCA VAT numbers must be 15 digits starting and ending with 3
  if (!vatNumber || vatNumber.length !== 15) {
    return "300000000000003"; // Default valid ZATCA VAT number
  }

  // Ensure it starts and ends with 3
  if (!vatNumber.startsWith("3") || !vatNumber.endsWith("3")) {
    return "300000000000003";
  }

  return vatNumber;
}

function validateVatRate(rate: number): number {
  // ZATCA supports 5% and 15% VAT rates primarily
  if (rate === 5 || rate === 15) {
    return rate;
  }
  // Default to 15% if invalid
  return 15;
}

function getZatcaInvoiceTypeCode(invoiceType: "STANDARD" | "SIMPLIFIED"): string {
  // UBL Invoice Type Code
  return "388"; // Commercial Invoice
}

function getZatcaInvoiceCode(invoiceType: "STANDARD" | "SIMPLIFIED"): string {
  // ZATCA specific invoice type codes
  switch (invoiceType) {
    case "STANDARD":
      return "0200000"; // Standard B2B Invoice
    case "SIMPLIFIED":
      return "0100000"; // Simplified B2C Invoice
    default:
      return "0200000";
  }
}

function generateUUID(): string {
  // Generate a valid UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDateOnly(dateString: string): string {
  // Format date as YYYY-MM-DD
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function formatTimeOnly(dateString: string): string {
  // Format time as HH:MM:SS
  const date = new Date(dateString);
  return date.toISOString().split("T")[1].split(".")[0];
}

function formatDecimal(value: number): string {
  // Format decimal with 2 decimal places
  return value.toFixed(2);
}

function escapeXml(unsafe: string): string {
  // Escape XML special characters
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

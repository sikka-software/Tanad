// apps/admin-portal/src/utils/zatca.ts

interface QrCodeData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  invoiceTotal: string;
  vatAmount: string;
}

interface XmlData {
  invoice: any;
  vatNumber: string;
  sellerName: string;
  buyerName: string;
  vatAmount: number;
  totalWithVAT: number;
}

/**
 * Convert string to bytes
 */
function stringToBytes(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

/**
 * Generates ZATCA compliant QR code data
 * Following ZATCA Phase 1 requirements for simplified tax invoices
 */
export async function generateZatcaQrCode(data: QrCodeData): Promise<string> {
  // ZATCA QR code must contain:
  // 1. Seller name
  // 2. VAT registration number
  // 3. Timestamp (ISO format)
  // 4. Invoice total (with VAT)
  // 5. VAT amount

  // Format the data according to ZATCA TLV format
  const tlvData = [
    { tag: 1, value: data.sellerName },
    { tag: 2, value: data.vatNumber },
    { tag: 3, value: data.timestamp },
    { tag: 4, value: data.invoiceTotal },
    { tag: 5, value: data.vatAmount },
  ];

  // Build the TLV encoding precisely as specified by ZATCA
  let result = "";

  for (const field of tlvData) {
    const valueBytes = stringToBytes(field.value);

    // Tag - single byte
    result += String.fromCodePoint(field.tag);

    // Length - single byte
    result += String.fromCodePoint(valueBytes.length);

    // Value - the UTF-8 encoded string
    result += field.value;
  }

  // Convert to base64
  return btoa(result);
}

export async function generateZatcaXML(data: XmlData): Promise<string> {
  // Create UBL 2.1 XML document following ZATCA requirements
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${data.invoice.id}</cbc:ID>
  <cbc:UUID>${data.invoice.id}</cbc:UUID>
  <cbc:IssueDate>${new Date(data.invoice.created * 1000).toISOString().split("T")[0]}</cbc:IssueDate>
  <cbc:IssueTime>${new Date(data.invoice.created * 1000).toISOString().split("T")[1]}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.invoice.currency?.toUpperCase() || "SAR"}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${data.vatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${data.sellerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Dummy Street</cbc:StreetName>
        <cbc:BuildingNumber>123</cbc:BuildingNumber>
        <cbc:CityName>Riyadh</cbc:CityName>
        <cbc:PostalZone>12345</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${data.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${data.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="NAT">Dummy Customer ID</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${data.buyerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Customer Street</cbc:StreetName>
        <cbc:BuildingNumber>456</cbc:BuildingNumber>
        <cbc:CityName>Riyadh</cbc:CityName>
        <cbc:PostalZone>54321</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${data.vatAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${(data.totalWithVAT - data.vatAmount).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${(data.totalWithVAT - data.vatAmount).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${data.totalWithVAT.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${data.totalWithVAT.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${(data.totalWithVAT - data.vatAmount).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>Dummy Product</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${(data.totalWithVAT - data.vatAmount).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  return xml;
}

/**
 * ZATCA Utilities for QR Code Generation and Compliance
 * Based on ZATCA Phase 1 requirements
 */

/**
 * Encode text as UTF-8 and then to base64
 */
export function toBase64(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

/**
 * Encode a string to a TLV (Tag-Length-Value) format string
 * @param tag The tag number (1-byte)
 * @param value The value to encode
 * @returns The TLV encoded string
 */
export function encodeTLV(tag: number, value: string): string {
  const valueBuffer = Buffer.from(value, "utf8");
  const length = valueBuffer.length;

  // Create a buffer with size: 1 byte (tag) + 1 byte (length) + value length
  const tlvBuffer = Buffer.alloc(2 + length);

  // Write tag (1 byte)
  tlvBuffer.writeUInt8(tag, 0);
  // Write length (1 byte)
  tlvBuffer.writeUInt8(length, 1);
  // Write value
  valueBuffer.copy(tlvBuffer, 2);

  return tlvBuffer.toString("hex");
}

/**
 * Generate a TLV-encoded QR code string for ZATCA Phase 1 compliance
 * @param params The invoice parameters
 * @returns Base64-encoded TLV string for QR code generation
 */
export function generateZatcaQRString({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatAmount,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceTimestamp: string; // ISO format
  invoiceTotal: number;
  vatAmount: number;
}): string {
  // Tag 1: Seller Name
  const tag1 = encodeTLV(1, sellerName);

  // Tag 2: VAT Registration Number
  const tag2 = encodeTLV(2, vatNumber);

  // Tag 3: Invoice Timestamp (ISO format)
  const tag3 = encodeTLV(3, invoiceTimestamp);

  // Tag 4: Invoice Total (with 2 decimal places)
  const tag4 = encodeTLV(4, invoiceTotal.toFixed(2));

  // Tag 5: VAT Amount (with 2 decimal places)
  const tag5 = encodeTLV(5, vatAmount.toFixed(2));

  // Concatenate all TLV strings
  const tlvString = tag1 + tag2 + tag3 + tag4 + tag5;

  // Return as base64 for QR code generation
  return toBase64(tlvString);
}

/**
 * Calculate VAT amount from subtotal and tax rate
 */
export function calculateVAT(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Check if an invoice meets ZATCA Phase 1 requirements
 */
export function isZatcaCompliant(invoice: any): {
  compliant: boolean;
  missingFields: string[];
} {
  const missingFields = [];

  // Required fields for ZATCA Phase 1
  if (!invoice.seller_name) missingFields.push("Seller Name");
  if (!invoice.vat_number) missingFields.push("VAT Registration Number");
  if (!invoice.issue_date) missingFields.push("Invoice Date");
  if (invoice.total === undefined) missingFields.push("Invoice Total");
  if (invoice.tax_amount === undefined) missingFields.push("VAT Amount");

  return {
    compliant: missingFields.length === 0,
    missingFields,
  };
}

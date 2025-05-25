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

  // Convert the hex string back to bytes before base64 encoding
  const buffer = Buffer.from(tlvString, "hex");

  // Return as base64 for QR code generation
  return buffer.toString("base64");
}

/**
 * Calculate VAT amount from subtotal and tax rate
 */
export function calculateVAT(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Check if an invoice meets ZATCA Phase 1 or Phase 2 requirements
 * @param invoice The invoice object to check
 * @param phase The ZATCA phase to check compliance for (1 or 2)
 * @returns Object with compliance status and missing fields array
 */
export function isZatcaCompliant(
  invoice: any,
  phase: 1 | 2 = 1,
): {
  compliant: boolean;
  missingFields: string[];
} {
  const missingFields = [];

  // Required fields for both Phase 1 and Phase 2
  if (!invoice.seller_name) missingFields.push("Seller Name");
  if (!invoice.vat_number) missingFields.push("VAT Registration Number");
  if (!invoice.issue_date) missingFields.push("Invoice Date");
  if (invoice.total === undefined) missingFields.push("Invoice Total");
  if (invoice.tax_amount === undefined) missingFields.push("VAT Amount");

  // Additional checks for Phase 2
  if (phase === 2) {
    if (!invoice.invoice_number) missingFields.push("Invoice Number");
    if (!invoice.zatca_enabled) missingFields.push("ZATCA Enabled");

    // Check for buyer information which is required for Phase 2
    if (!invoice.client?.name) missingFields.push("Buyer Name");

    // Additional checks could be added based on specific ZATCA Phase 2 requirements
    // For example, checks for invoice type, currency code, etc.
  }

  return {
    compliant: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Generate a TLV-encoded QR code string for ZATCA Phase 2 compliance
 * Phase 2 QR codes include additional fields like invoice hash and signature
 * @param params The invoice parameters for Phase 2
 * @returns Base64-encoded TLV string for QR code generation
 */
export function generateZatcaPhase2QRString({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatAmount,
  invoiceHash,
  digitalSignature,
  publicKey,
  certificateSignature,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceTimestamp: string; // ISO format
  invoiceTotal: number;
  vatAmount: number;
  invoiceHash: string; // SHA-256 hash of the invoice
  digitalSignature: string; // Base64 encoded signature
  publicKey: string; // Base64 encoded public key
  certificateSignature: string; // Base64 encoded certificate signature
}): string {
  // ZATCA Phase 2 TLV Structure:
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

  // Tag 6: Invoice Hash (SHA-256 hash of the invoice XML)
  const tag6 = encodeTLV(6, invoiceHash);

  // Tag 7: Digital Signature (ECDSA signature)
  const tag7 = encodeTLV(7, digitalSignature);

  // Tag 8: Public Key (EC public key)
  const tag8 = encodeTLV(8, publicKey);

  // Tag 9: Certificate Signature (Signature of the certificate)
  const tag9 = encodeTLV(9, certificateSignature);

  // Concatenate all TLV strings
  const tlvString = tag1 + tag2 + tag3 + tag4 + tag5 + tag6 + tag7 + tag8 + tag9;

  // Convert the hex string back to bytes before base64 encoding
  const buffer = Buffer.from(tlvString, "hex");

  // Return as base64 for QR code generation
  return buffer.toString("base64");
}

/**
 * Generate mock Phase 2 QR code data for testing
 * This generates placeholder values for digital signature components
 */
export function generateMockZatcaPhase2QRString({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatAmount,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceTimestamp: string;
  invoiceTotal: number;
  vatAmount: number;
}): string {
  // Generate mock hash (in real implementation, this would be SHA-256 of the invoice)
  const mockInvoiceHash =
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";

  // Generate mock digital signature
  const mockSignature =
    "MEUCIGJHyGK5cAeINcYJ3jz7M8cHI6dXPbnmx0dmnUJ+COwIKAiEAwjLwW91YpSzI8MZgYlLrP/xk2vKlM8+JOFAKgE/tpA=";

  // Generate mock public key
  const mockPublicKey =
    "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJKy6hE02FE/+gOTz0LxcfRFCtPn7KhgzjL8RIRhtEYBIJxTFFdWXFIRzTSF7PBb1GzCJ2Kqhb1Q6nT+xQjvP7Q==";

  // Generate mock certificate signature
  const mockCertSignature =
    "MIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwGggCSABIIBYA==";

  return generateZatcaPhase2QRString({
    sellerName,
    vatNumber,
    invoiceTimestamp,
    invoiceTotal,
    vatAmount,
    invoiceHash: mockInvoiceHash,
    digitalSignature: mockSignature,
    publicKey: mockPublicKey,
    certificateSignature: mockCertSignature,
  });
}

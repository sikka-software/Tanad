/**
 * ZATCA XML Test Utilities
 * Test the XML generation with valid data that should pass ZATCA validation
 */
import { generateZatcaXml } from "./zatca-xml";

/**
 * Generate a test ZATCA XML with valid data
 */
export function generateTestZatcaXml(): string {
  const subtotal = 989.0;
  const vatRate = 0.15; // 15%
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100; // 148.35
  const total = subtotal + vatAmount; // 1137.35

  const testInvoiceData = {
    invoiceNumber: "INV-TEST-001",
    issueDate: new Date().toISOString(), // Current date to avoid future date error
    invoiceType: "STANDARD" as const,
    supplyDate: new Date().toISOString(),

    // Seller with valid 15-digit VAT number starting and ending with 3
    sellerName: "Test Company LLC",
    sellerVatNumber: "310123456789003",
    sellerAddress: {
      street: "King Fahd Road",
      buildingNumber: "1234",
      city: "Riyadh",
      postalCode: "12214",
      district: "Al Olaya",
      countryCode: "SA",
    },

    // Buyer information
    buyerName: "Test Buyer LLC",
    buyerVatNumber: "399876543210003",
    buyerAddress: {
      street: "Prince Sultan Road",
      buildingNumber: "5678",
      city: "Jeddah",
      postalCode: "23715",
      district: "Al Hamra",
      countryCode: "SA",
    },

    // Payment information
    paymentMeans: {
      code: "10", // Cash
      description: "Cash payment",
    },

    // Line items with proper VAT calculation
    items: [
      {
        name: "Test Product",
        description: "Test Product Description",
        quantity: 1,
        unitPrice: subtotal,
        vatRate: 15, // 15% as integer
        vatAmount: vatAmount,
        subtotal: subtotal,
        total: total,
      },
    ],

    // Totals with proper calculation
    subtotal: subtotal,
    vatAmount: vatAmount,
    total: total,

    // ZATCA Phase 2 specific fields
    invoiceCounterValue: 1,
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
  };

  return generateZatcaXml(testInvoiceData);
}

/**
 * Generate a simplified test ZATCA XML
 */
export function generateSimplifiedTestZatcaXml(): string {
  const subtotal = 500.0;
  const vatRate = 0.15; // 15%
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100; // 75.00
  const total = subtotal + vatAmount; // 575.00

  const testInvoiceData = {
    invoiceNumber: "INV-SIMP-001",
    issueDate: new Date().toISOString(),
    invoiceType: "SIMPLIFIED" as const,

    // Seller with valid VAT number
    sellerName: "Simplified Seller LLC",
    sellerVatNumber: "310987654321003",
    sellerAddress: {
      street: "King Abdul Aziz Road",
      buildingNumber: "9876",
      city: "Riyadh",
      postalCode: "11564",
      district: "Al Malaz",
      countryCode: "SA",
    },

    // Buyer (minimal for simplified)
    buyerName: "Walk-in Customer",
    buyerAddress: {
      street: "N/A",
      buildingNumber: "N/A",
      city: "Riyadh",
      postalCode: "00000",
      district: "N/A",
      countryCode: "SA",
    },

    // Payment information
    paymentMeans: {
      code: "10", // Cash
      description: "Cash payment",
    },

    // Line items
    items: [
      {
        name: "Simple Product",
        description: "Simple Product for Testing",
        quantity: 1,
        unitPrice: subtotal,
        vatRate: 15,
        vatAmount: vatAmount,
        subtotal: subtotal,
        total: total,
      },
    ],

    // Totals
    subtotal: subtotal,
    vatAmount: vatAmount,
    total: total,

    // ZATCA Phase 2 specific fields
    invoiceCounterValue: 2,
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
  };

  return generateZatcaXml(testInvoiceData);
}

/**
 * Validate ZATCA requirements for the generated XML
 */
export function validateZatcaRequirements(xmlContent: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for placeholder values that would cause validation errors
  if (xmlContent.includes("[PLACEHOLDER_")) {
    errors.push("XML contains placeholder values that are not valid base64");
  }

  // Check for required ZATCA elements
  const requiredElements = [
    "cbc:UBLVersionID",
    "cbc:ProfileID",
    "cbc:InvoiceTypeCode",
    "cac:AdditionalDocumentReference",
    "cac:AccountingSupplierParty",
    "cac:AccountingCustomerParty",
    "cac:TaxTotal",
    "cac:LegalMonetaryTotal",
    "cac:InvoiceLine",
  ];

  for (const element of requiredElements) {
    if (!xmlContent.includes(element)) {
      errors.push(`Missing required element: ${element}`);
    }
  }

  // Check for ZATCA-specific document references
  const zatcaRefs = ["ICV", "PIH", "KSA-2", "QR"];
  for (const ref of zatcaRefs) {
    if (!xmlContent.includes(`<cbc:ID>${ref}</cbc:ID>`)) {
      errors.push(`Missing ZATCA document reference: ${ref}`);
    }
  }

  // Check VAT number format (should be 15 digits starting and ending with 3)
  const vatNumberMatch = xmlContent.match(/<cbc:CompanyID>(\d{15})<\/cbc:CompanyID>/);
  if (vatNumberMatch) {
    const vatNumber = vatNumberMatch[1];
    if (!vatNumber.startsWith("3") || !vatNumber.endsWith("3")) {
      errors.push("VAT number must start and end with '3'");
    }
  } else {
    errors.push("VAT number not found or invalid format");
  }

  // Check VAT rate (should be 15 or 5 for standard rate)
  const vatRateMatch = xmlContent.match(/<cbc:Percent>(\d+(?:\.\d+)?)<\/cbc:Percent>/);
  if (vatRateMatch) {
    const vatRate = parseFloat(vatRateMatch[1]);
    if (vatRate !== 15 && vatRate !== 5) {
      warnings.push("VAT rate should be 15% or 5% for standard rate 'S'");
    }
  }

  // Check date format (should not be in future)
  const issueDateMatch = xmlContent.match(/<cbc:IssueDate>([^<]+)<\/cbc:IssueDate>/);
  if (issueDateMatch) {
    const issueDate = new Date(issueDateMatch[1]);
    if (issueDate > new Date()) {
      errors.push("Issue date cannot be in the future");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

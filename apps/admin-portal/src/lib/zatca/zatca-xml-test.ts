/**
 * ZATCA XML Test Utilities
 * Test the XML generation with valid data that should pass ZATCA validation
 */
import { generateZatcaXml } from "./zatca-xml";

/**
 * Generate a test ZATCA XML with valid data
 */
export function generateTestZatcaXml(): string {
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
      postalCode: "12345",
      district: "Al Olaya",
      countryCode: "SA",
    },

    // Buyer with complete address information
    buyerName: "Customer Company Ltd",
    buyerVatNumber: "320987654321003",
    buyerAddress: {
      street: "Prince Sultan Road",
      buildingNumber: "5678",
      city: "Riyadh",
      postalCode: "54321",
      district: "Al Malaz",
      countryCode: "SA",
    },

    // Items with valid VAT rate (15%)
    items: [
      {
        name: "Professional Services",
        description: "Consulting Services",
        quantity: 1,
        unitPrice: 1000.0,
        vatRate: 15, // Valid ZATCA rate
        vatAmount: 150.0,
        subtotal: 1000.0,
        total: 1150.0,
      },
    ],

    // Totals
    subtotal: 1000.0,
    vatAmount: 150.0,
    total: 1150.0,

    // ZATCA Phase 2 fields
    invoiceCounterValue: 1,
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
  };

  return generateZatcaXml(testInvoiceData);
}

/**
 * Generate a simplified invoice test XML
 */
export function generateSimplifiedTestZatcaXml(): string {
  const testInvoiceData = {
    invoiceNumber: "INV-SIMP-001",
    issueDate: new Date().toISOString(),
    invoiceType: "SIMPLIFIED" as const,

    // Seller with valid VAT number
    sellerName: "Retail Store LLC",
    sellerVatNumber: "315555555555003",
    sellerAddress: {
      street: "Commercial Street",
      buildingNumber: "9999",
      city: "Jeddah",
      postalCode: "21577",
      district: "Al Balad",
      countryCode: "SA",
    },

    // Buyer (minimal for simplified invoice)
    buyerName: "Walk-in Customer",
    buyerAddress: {
      street: "Customer Street",
      buildingNumber: "0000",
      city: "Jeddah",
      postalCode: "21577",
      district: "Al Balad",
      countryCode: "SA",
    },

    // Items with 15% VAT
    items: [
      {
        name: "Retail Product",
        description: "General Merchandise",
        quantity: 2,
        unitPrice: 50.0,
        vatRate: 15,
        vatAmount: 15.0,
        subtotal: 100.0,
        total: 115.0,
      },
    ],

    // Totals
    subtotal: 100.0,
    vatAmount: 15.0,
    total: 115.0,

    // ZATCA Phase 2 fields
    invoiceCounterValue: 2,
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
  };

  return generateZatcaXml(testInvoiceData);
}

/**
 * Validate ZATCA XML requirements checklist
 */
export function validateZatcaRequirements(xmlString: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required elements
  if (!xmlString.includes("<cbc:UBLVersionID>2.1</cbc:UBLVersionID>")) {
    errors.push("Missing UBL version 2.1");
  }

  if (!xmlString.includes("<cbc:ProfileID>reporting:1.0</cbc:ProfileID>")) {
    errors.push("Missing reporting profile");
  }

  // Check VAT number format (15 digits starting and ending with 3)
  const vatNumberMatch = xmlString.match(/<cbc:CompanyID>(\d{15})<\/cbc:CompanyID>/);
  if (vatNumberMatch) {
    const vatNumber = vatNumberMatch[1];
    if (!vatNumber.startsWith("3") || !vatNumber.endsWith("3")) {
      errors.push("VAT number must start and end with 3");
    }
  } else {
    errors.push("Missing or invalid VAT number format");
  }

  // Check VAT rate (should be 5 or 15)
  const vatRateMatch = xmlString.match(/<cbc:Percent>(\d+)<\/cbc:Percent>/);
  if (vatRateMatch) {
    const vatRate = parseInt(vatRateMatch[1]);
    if (vatRate !== 5 && vatRate !== 15) {
      errors.push("VAT rate must be 5% or 15% for standard rate 'S'");
    }
  }

  // Check for required address fields
  if (
    !xmlString.includes("<cbc:StreetName>") ||
    xmlString.includes("<cbc:StreetName></cbc:StreetName>")
  ) {
    warnings.push("Street name should not be empty");
  }

  if (
    !xmlString.includes("<cbc:BuildingNumber>") ||
    xmlString.includes("<cbc:BuildingNumber></cbc:BuildingNumber>")
  ) {
    warnings.push("Building number should not be empty");
  }

  // Check for supply date in standard invoices
  if (xmlString.includes('name="0100000"') && !xmlString.includes("<cac:InvoicePeriod>")) {
    errors.push("Supply date (KSA-5) is required for standard invoices");
  }

  // Check for line item VAT amounts (KSA-11, KSA-12)
  if (xmlString.includes("<cac:InvoiceLine>") && !xmlString.includes("<cac:TaxTotal>")) {
    errors.push("Line item VAT amounts are required (KSA-11, KSA-12)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

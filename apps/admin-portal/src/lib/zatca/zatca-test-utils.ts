/**
 * ZATCA Test Utilities
 * Provides dummy data generation for testing ZATCA Phase 1 implementation
 */
import { generateZatcaQRString } from "./zatca-utils";
import { generateZatcaXml } from "./zatca-xml";

/**
 * Valid ZATCA seller names for testing
 */
export const TEST_SELLER_NAMES = [
  "Mansour Company",
  "Riyadh Trade LLC",
  "Saudi Merchants Co.",
  "Jeddah Commercial Est.",
  "AlKhobar Trading",
];

/**
 * Generate a valid 15-digit VAT number for testing
 * ZATCA requirement: Must be 15 digits starting and ending with '3'
 * @returns A valid format VAT number for testing purposes
 */
export function generateTestVatNumber(): string {
  // Start with 3
  let vatNumber = "3";

  // Generate 13 middle random digits
  for (let i = 0; i < 13; i++) {
    vatNumber += Math.floor(Math.random() * 10).toString();
  }

  // End with 3
  vatNumber += "3";

  return vatNumber;
}

/**
 * List of predefined valid VAT numbers for testing (ZATCA-compliant)
 */
export const TEST_VAT_NUMBERS = [
  "310122393500003", // Example from ZATCA documentation
  "311111111111113", // Valid format: starts and ends with 3
  "300000000000003", // Valid format: starts and ends with 3
  "399999999999993", // Valid format: starts and ends with 3
  "312345678901233", // Valid format: starts and ends with 3
];

/**
 * Generate test invoice data with valid ZATCA requirements
 * @returns Complete test data for ZATCA-compliant invoice
 */
export function generateTestInvoiceData(
  options: {
    sellerName?: string;
    vatNumber?: string;
    subtotal?: number;
    taxRate?: number;
  } = {},
) {
  const sellerName =
    options.sellerName || TEST_SELLER_NAMES[Math.floor(Math.random() * TEST_SELLER_NAMES.length)];
  const vatNumber =
    options.vatNumber || TEST_VAT_NUMBERS[Math.floor(Math.random() * TEST_VAT_NUMBERS.length)];
  const subtotal =
    options.subtotal !== undefined ? options.subtotal : Math.floor(Math.random() * 10000) / 100;
  const taxRate = options.taxRate !== undefined ? options.taxRate : 15; // Standard Saudi VAT rate
  const vatAmount = subtotal * (taxRate / 100);
  const total = subtotal + vatAmount;

  // Current time as ISO string for invoiceTimestamp
  const invoiceTimestamp = new Date().toISOString();

  return {
    sellerName,
    vatNumber,
    subtotal,
    taxRate,
    vatAmount,
    total,
    invoiceTimestamp,
  };
}

/**
 * Generate a ZATCA QR code string with random test values
 * @returns Base64 encoded QR string ready for display
 */
export function generateTestQRString(): string {
  const testData = generateTestInvoiceData();

  return generateZatcaQRString({
    sellerName: testData.sellerName,
    vatNumber: testData.vatNumber,
    invoiceTimestamp: testData.invoiceTimestamp,
    invoiceTotal: testData.total,
    vatAmount: testData.vatAmount,
  });
}

/**
 * Generate a complete test invoice object
 * (using the structure expected in your application)
 */
export function generateTestInvoice(
  options: {
    invoiceNumber?: string;
    clientId?: string;
    userId?: string;
    enterpriseId?: string;
  } = {},
) {
  const testData = generateTestInvoiceData();

  return {
    id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    invoice_number:
      options.invoiceNumber ||
      `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    client_id:
      options.clientId || crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    user_id: options.userId || crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    enterprise_id:
      options.enterpriseId || crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    issue_date: testData.invoiceTimestamp,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: "draft",
    subtotal: testData.subtotal,
    tax_rate: testData.taxRate,
    tax_amount: testData.vatAmount,
    total: testData.total,
    zatca_enabled: true,
    seller_name: testData.sellerName,
    vat_number: testData.vatNumber,
    items: [
      {
        description: "Test Product 1",
        quantity: 1,
        unit_price: testData.subtotal,
      },
    ],
  };
}

/**
 * Generate test XML for a ZATCA Phase 2 invoice
 */
export function generateTestZatcaXml() {
  const testData = generateTestInvoiceData();
  const buyerVatNumber = generateTestVatNumber();

  return generateZatcaXml({
    invoiceNumber: `ZATCA-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceType: "SIMPLIFIED",

    sellerName: testData.sellerName,
    sellerVatNumber: testData.vatNumber,
    sellerAddress: {
      street: "King Fahd Road",
      buildingNumber: "8091",
      city: "Riyadh",
      postalCode: "12214",
      countryCode: "SA",
      district: "Al Olaya", // Required for KSA
    },

    buyerName: "Test Customer",
    buyerVatNumber: buyerVatNumber,
    buyerAddress: {
      street: "Prince Mohammed Bin Salman Road",
      buildingNumber: "3458",
      city: "Jeddah",
      postalCode: "23715",
      countryCode: "SA",
      district: "Al Hamra", // Required for KSA
    },

    paymentMeans: {
      code: "10", // Cash payment
      description: "Cash payment",
    },

    items: [
      {
        name: "Test Product",
        description: "ZATCA Phase 2 Test Product",
        quantity: 1,
        unitPrice: testData.subtotal,
        vatRate: testData.taxRate,
        vatAmount: testData.vatAmount,
        subtotal: testData.subtotal,
        total: testData.total,
      },
    ],

    subtotal: testData.subtotal,
    vatAmount: testData.vatAmount,
    total: testData.total,

    // ZATCA Phase 2 specific fields
    invoiceCounterValue: Math.floor(Math.random() * 1000) + 1, // ICV
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==", // PIH
  });
}

# ZATCA Compliance Implementation

This directory contains utilities and components for implementing ZATCA (Zakat, Tax and Customs Authority) compliance in your invoices, specifically for Phase 1 requirements.

## Overview

ZATCA Phase 1 compliance requires specific invoice elements for both B2B and B2C transactions. This implementation focuses on:

- Generating TLV (Tag-Length-Value) encoded QR codes
- Adding required ZATCA fields to invoices
- Validating invoice compliance
- Providing configuration options in user settings

## Components

The implementation includes:

1. **ZATCA Utilities (`zatca-utils.ts`)**  
   Core functions for generating TLV-encoded QR codes and validating compliance.

2. **QR Code Component (`ZatcaQRCode.tsx`)**  
   Generates and displays QR codes based on invoice data.

3. **Compliance Badge (`ZatcaComplianceBadge.tsx`)**  
   Visual indicator of whether an invoice meets ZATCA requirements.

4. **Invoice ZATCA Section (`InvoiceZatcaSection.tsx`)**  
   Dedicated section to display ZATCA-related information on invoices.

5. **ZATCA Settings (`ZatcaSettings.tsx`)**  
   Configuration panel for enterprise-wide ZATCA settings.

6. **API Endpoint for Stripe Integration (`generate-zatca-qr.ts`)**  
   Allows generating ZATCA QR codes for Stripe invoices.

## Implementation Steps

1. **Database Migration**  
   Required fields were added to the `invoices` table to store ZATCA-related information.

2. **Form Integration**  
   The invoice form has been updated to include ZATCA compliance fields.

3. **Settings Integration**  
   A ZATCA configuration panel has been added to the settings page.

## Usage

### Set Up ZATCA Configuration

First, configure your ZATCA settings in the enterprise settings page:

1. Enable ZATCA compliance
2. Enter your seller name as registered with ZATCA
3. Enter your VAT registration number

### Create ZATCA-Compliant Invoices

When creating invoices:

1. Enable ZATCA compliance in the invoice form
2. Verify the seller name and VAT number
3. The tax amount will be calculated automatically based on subtotal and tax rate
4. A compliance badge will indicate if the invoice meets ZATCA requirements

### Display ZATCA QR Codes

In your invoice detail or print view:

```tsx
import { InvoiceZatcaSection } from "@/components/invoice/InvoiceZatcaSection";

// Inside your component
return (
  <div>
    {/* Your invoice content */}
    <InvoiceZatcaSection invoice={invoiceData} />
  </div>
);
```

### Generate QR Codes for Stripe Invoices

For Stripe invoices, use the API endpoint:

```tsx
// Generate QR code for a Stripe invoice
const response = await fetch("/api/stripe/generate-zatca-qr", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stripeInvoiceId: "inv_123456789",
  }),
});

const { qrString } = await response.json();
```

## ZATCA Phase 1 Requirements

This implementation covers the core ZATCA Phase 1 requirements:

1. **Required Fields**:

   - Seller name
   - VAT registration number
   - Invoice timestamp
   - Invoice total
   - VAT amount

2. **QR Code Generation**:
   - TLV encoding as required by ZATCA
   - Base64 encoding for QR code generation

## Future Enhancements

For future phases:

1. Implement digital signatures for invoices
2. Add API integration for direct reporting to ZATCA
3. Implement compliance for more complex invoice scenarios

## Resources

- [ZATCA Official Website](https://zatca.gov.sa/)
- [E-Invoicing Portal](https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx)
- [ZATCA Technical Specifications](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Technical-Specifications.aspx)

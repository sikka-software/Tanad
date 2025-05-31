/**
 * Test script for ZATCA API endpoints
 * Run with: node test-zatca-endpoints.js
 */

const testXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>INV-TEST-001</cbc:ID>
  <cbc:UUID>12345678-1234-4678-9123-123456789012</cbc:UUID>
  <cbc:IssueDate>2024-01-15</cbc:IssueDate>
  <cbc:IssueTime>10:30:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000" listID="UN/ECE 1001 Subset" listAgencyID="6">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>310000000000003</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Test Company LLC</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">148.35</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:TaxInclusiveAmount currencyID="SAR">1137.35</cbc:TaxInclusiveAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

async function testEndpoint(endpoint, method = "POST", body = null) {
  try {
    const url = `http://localhost:3037/api/zatca/${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`\n🧪 Testing ${method} ${endpoint}...`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${endpoint}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message || "No message"}`);
      if (data.mode) console.log(`   Mode: ${data.mode}`);
    } else {
      console.log(`❌ ${endpoint}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || "Unknown error"}`);
    }

    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ ${endpoint}: ERROR`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Testing ZATCA API Endpoints...");
  console.log("=====================================");

  // Test status endpoint (GET)
  await testEndpoint("status", "GET");

  // Test validation endpoint
  await testEndpoint("validate", "POST", { xmlContent: testXml });

  // Test hash generation
  await testEndpoint("hash", "POST", { xmlContent: testXml });

  // Test QR generation
  await testEndpoint("qr", "POST", { xmlContent: testXml });

  // Test signing
  await testEndpoint("sign", "POST", { xmlContent: testXml });

  // Test full processing
  await testEndpoint("process", "POST", { xmlContent: testXml });

  console.log("\n🏁 Tests completed!");
  console.log("\nNext steps:");
  console.log("1. Set ZATCA_REQUIRE_SANDBOX=false in your .env.local");
  console.log("2. Set ZATCA_ALLOW_LOCAL_VALIDATION=true in your .env.local");
  console.log("3. Restart your dev server");
  console.log('4. Test the "Process with ZATCA" button in your app');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.log("❌ This script requires Node.js 18+ or you can install node-fetch");
  console.log("   npm install node-fetch");
  console.log("   Then uncomment the require line below");
  // const fetch = require('node-fetch');
} else {
  runTests().catch(console.error);
}

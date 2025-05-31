// Test script to demonstrate the new mode parameter for ZATCA processing
// This will force local validation instead of sandbox

const testXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl-schema:xsd:Invoice-2">
  <cbc:ID>INV-2024-001</cbc:ID>
  <cbc:IssueDate>2024-12-30</cbc:IssueDate>
  <cbc:InvoiceTypeCode>388</cbc:InvoiceTypeCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1234567890</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>Test Company</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
</Invoice>`;

async function testProcessingModes() {
  const baseUrl = "http://localhost:3000/api/zatca/process";

  const modes = [
    { name: "Local Mode (forced)", mode: "local" },
    { name: "Simulated Mode", mode: "simulated" },
    { name: "Auto Mode (will choose based on availability)", mode: "auto" },
  ];

  for (const { name, mode } of modes) {
    console.log(`\n🧪 Testing ${name}...`);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xmlContent: testXmlContent,
          mode: mode, // This is the new parameter!
        }),
      });

      const result = await response.json();

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Result:`, {
        success: result.success,
        mode: result.mode,
        message: result.message,
        validationPassed: result.validationPassed,
        hasWarnings: result.warnings ? result.warnings.length > 0 : false,
      });

      if (result.warnings) {
        console.log(`⚠️  Warnings:`, result.warnings);
      }
    } catch (error) {
      console.error(`❌ Error testing ${name}:`, error.message);
    }
  }
}

// Run the test
console.log("🚀 Testing ZATCA Processing Modes\n");
testProcessingModes().catch(console.error);

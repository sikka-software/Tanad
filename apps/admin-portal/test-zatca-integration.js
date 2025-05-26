/**
 * ZATCA Phase 2 Integration Test Script
 * Run this script to test the ZATCA API endpoints locally
 */

const BASE_URL = 'http://localhost:3037';

// Sample UBL 2.1 XML for testing
const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>TEST-001</cbc:ID>
  <cbc:IssueDate>2024-01-15</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0200000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>Test Company</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
</Invoice>`;

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting ZATCA Phase 2 Integration Tests');
  console.log('=' .repeat(50));
  
  // Test 1: Status Check
  await testEndpoint('/api/zatca/status');
  
  // Test 2: Validation
  await testEndpoint('/api/zatca/validate', 'POST', { xmlContent: sampleXML });
  
  // Test 3: Hash Generation
  await testEndpoint('/api/zatca/hash', 'POST', { xmlContent: sampleXML });
  
  // Test 4: Signing
  await testEndpoint('/api/zatca/sign', 'POST', { xmlContent: sampleXML });
  
  // Test 5: QR Generation
  await testEndpoint('/api/zatca/qr', 'POST', { xmlContent: sampleXML });
  
  // Test 6: Complete Processing
  await testEndpoint('/api/zatca/process', 'POST', { xmlContent: sampleXML });
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Start the admin portal: cd Tanad/apps/admin-portal && pnpm dev');
  console.log('2. Open http://localhost:3037/invoices');
  console.log('3. Click on any invoice to see the ZATCA Phase 2 section');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  // Browser environment
  window.testZatcaIntegration = runTests;
  console.log('Run testZatcaIntegration() in the browser console to test');
} 
#!/usr/bin/env node

/**
 * Complete ZATCA Phase 2 Integration Test
 * This script tests the corrected XML generation and ZATCA SDK integration
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3037';
const SANDBOX_PATH = path.resolve(__dirname, '..', 'zatca-einvoicing-phase2-sandbox');

// Sample invoice data that matches Tanad structure
const sampleInvoiceData = {
  invoiceNumber: 'TANAD-TEST-001',
  issueDate: new Date().toISOString(),
  invoiceType: 'STANDARD',
  
  sellerName: 'Tanad Test Company',
  sellerVatNumber: '300000000000003',
  sellerAddress: {
    street: 'King Fahd Road',
    buildingNumber: '8091',
    city: 'Riyadh',
    postalCode: '12214',
    district: 'Al Olaya',
    countryCode: 'SA'
  },
  
  buyerName: 'Test Customer',
  buyerVatNumber: '355434621636323',
  buyerAddress: {
    street: 'Prince Mohammed Bin Salman Road',
    buildingNumber: '3458',
    city: 'Jeddah',
    postalCode: '23715',
    district: 'Al Hamra',
    countryCode: 'SA'
  },
  
  items: [{
    name: 'Test Product',
    description: 'Test Product Description',
    quantity: 1,
    unitPrice: 45.27,
    vatRate: 15,
    vatAmount: 6.79,
    subtotal: 45.27,
    total: 52.06
  }],
  
  subtotal: 45.27,
  vatAmount: 6.79,
  total: 52.06,
  
  invoiceCounterValue: 858,
  previousInvoiceHash: 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==',
  supplyDate: new Date().toISOString()
};

// Generate XML using the corrected format
function generateTestXML(invoiceData) {
  const uuid = generateUUID();
  const issueDateOnly = invoiceData.issueDate.split('T')[0];
  const issueTimeOnly = invoiceData.issueDate.split('T')[1].split('.')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
         xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
         xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">

  <!-- UBL Extensions for Phase 2 Signature -->
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
                                  xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
                                  xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
          <sac:SignatureInformation>
            <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
            <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
            <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
              <ds:SignedInfo>
                <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
                <ds:Reference Id="invoiceSignedData" URI="">
                  <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                  </ds:Transforms>
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                  <ds:DigestValue>[PLACEHOLDER_DIGEST_VALUE]</ds:DigestValue>
                </ds:Reference>
                <ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                  <ds:DigestValue>[PLACEHOLDER_SIGNED_PROPS_DIGEST]</ds:DigestValue>
                </ds:Reference>
              </ds:SignedInfo>
              <ds:SignatureValue>[PLACEHOLDER_SIGNATURE_VALUE]</ds:SignatureValue>
              <ds:KeyInfo>
                <ds:X509Data>
                  <ds:X509Certificate>[PLACEHOLDER_CERTIFICATE]</ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
              <ds:Object>
                <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#signature">
                  <xades:SignedProperties Id="xadesSignedProperties">
                    <xades:SignedSignatureProperties>
                      <xades:SigningTime>[PLACEHOLDER_SIGNING_TIME]</xades:SigningTime>
                      <xades:SigningCertificate>
                        <xades:Cert>
                          <xades:CertDigest>
                            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                            <ds:DigestValue>[PLACEHOLDER_CERT_DIGEST]</ds:DigestValue>
                          </xades:CertDigest>
                          <xades:IssuerSerial>
                            <ds:X509IssuerName>[PLACEHOLDER_ISSUER_NAME]</ds:X509IssuerName>
                            <ds:X509SerialNumber>[PLACEHOLDER_SERIAL_NUMBER]</ds:X509SerialNumber>
                          </xades:IssuerSerial>
                        </xades:Cert>
                      </xades:SigningCertificate>
                    </xades:SignedSignatureProperties>
                  </xades:SignedProperties>
                </xades:QualifyingProperties>
              </ds:Object>
            </ds:Signature>
          </sac:SignatureInformation>
        </sig:UBLDocumentSignatures>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>

  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceData.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDateOnly}</cbc:IssueDate>
  <cbc:IssueTime>${issueTimeOnly}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000" listID="UN/ECE 1001 Subset" listAgencyID="6">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>

  <!-- ZATCA Additional Document References -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${invoiceData.invoiceCounterValue}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${invoiceData.previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>KSA-2</cbc:ID>
    <cbc:DocumentDescription>0200000</cbc:DocumentDescription>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">AQ9NYW5zb3VyIENvbXBhbnkCDzMwMDAwMDAwMDAwMDAwMwMYMjAyNS0wNS0yNVQxNjoxMjozMC42OTRaBAU1Mi4wNgUENi43OQZYTldabFkyVmlOalptWm1NNE5tWXpPR1E1TlRJM09EWmpObVEyT1Raak56bGpNbVJpWXpJek9XUmtOR1U1TVdJME5qY3lPV1EzTTJFeU4yWmlOVGRsT1E9PQdgTUVVQ0lHSkh5R0s1Y0FlSU5jWUozano3TThjSEk2ZFhQYm5teDBkbW5VSitDT3dJS0FpRUF3akx3VzkxWXBTekk4TVpnWWxMclAveGsydktsTTgrSk9GQUtnRS90cEE9CHhNRll3RUFZSEtvWkl6ajBDQVFZRks0RUVBQW9EUWdBRUpLeTZoRTAyRkUvK2dPVHowTHhjZlJGQ3RQbjdLaGd6akw4UklSaHRFWUJJSnhURkZkV1hGSVJ6VFNGN1BCYjFHekNKMktxaGIxUTZuVCt4UWp2UDdRPT0JUE1JQUdDU3FHU0liM0RRRUhBcUNBTUlBQ0FRRXhEekFOQmdsZ2hrZ0JaUU1FQWdFRkFEQ0FCZ2txaGtpRzl3MEJCd0dnZ0NTQUJJSUJZQT09</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>

  <!-- Signature Reference -->
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>

  <!-- Seller Information -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoiceData.sellerVatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${invoiceData.sellerAddress.street}</cbc:StreetName>
        <cbc:BuildingNumber>${invoiceData.sellerAddress.buildingNumber}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${invoiceData.sellerAddress.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${invoiceData.sellerAddress.city}</cbc:CityName>
        <cbc:PostalZone>${invoiceData.sellerAddress.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoiceData.sellerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoiceData.sellerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoiceData.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Buyer Information -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoiceData.buyerVatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${invoiceData.buyerAddress.street}</cbc:StreetName>
        <cbc:BuildingNumber>${invoiceData.buyerAddress.buildingNumber}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${invoiceData.buyerAddress.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${invoiceData.buyerAddress.city}</cbc:CityName>
        <cbc:PostalZone>${invoiceData.buyerAddress.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoiceData.buyerAddress.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoiceData.buyerVatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoiceData.buyerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Delivery Information -->
  <cac:Delivery>
    <cbc:ActualDeliveryDate>${issueDateOnly}</cbc:ActualDeliveryDate>
  </cac:Delivery>

  <!-- Payment Information -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
    <cbc:InstructionNote>Cash payment</cbc:InstructionNote>
  </cac:PaymentMeans>

  <!-- Allowance/Charge -->
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="SAR">0.00</cbc:Amount>
    <cac:TaxCategory>
      <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
      <cbc:Percent>15</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:AllowanceCharge>

  <!-- Tax Total (Summary) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoiceData.vatAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <!-- Tax Total (Detailed) -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoiceData.vatAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${invoiceData.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${invoiceData.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Invoice Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoiceData.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoiceData.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoiceData.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">0.00</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${invoiceData.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Line Items -->
  ${invoiceData.items.map((item, index) => `<cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity.toFixed(6)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${item.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">${item.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="SAR">${item.total.toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${item.name}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>true</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
        <cbc:Amount currencyID="SAR">0.00</cbc:Amount>
      </cac:AllowanceCharge>
    </cac:Price>
  </cac:InvoiceLine>`).join('\n  ')}
</Invoice>`;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

async function testSandboxDirectly() {
  console.log('\n🔧 Testing ZATCA Sandbox Directly');
  console.log('=' .repeat(50));
  
  // Check if sandbox exists
  if (!fs.existsSync(SANDBOX_PATH)) {
    console.log('❌ ZATCA Sandbox not found at:', SANDBOX_PATH);
    return false;
  }
  
  // Generate test XML and save it
  const testXML = generateTestXML(sampleInvoiceData);
  const testXMLPath = path.join(SANDBOX_PATH, 'tanad_test_invoice.xml');
  
  try {
    fs.writeFileSync(testXMLPath, testXML);
    console.log('✅ Generated test XML:', testXMLPath);
    
    // Test validation directly with sandbox
    const { spawn } = require('child_process');
    const sdkJarPath = path.join(SANDBOX_PATH, 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar');
    
    if (!fs.existsSync(sdkJarPath)) {
      console.log('❌ ZATCA SDK JAR not found at:', sdkJarPath);
      return false;
    }
    
    return new Promise((resolve) => {
      console.log('🔍 Running ZATCA validation...');
      const process = spawn('java', ['-jar', sdkJarPath, '-validate', '-invoice', testXMLPath], {
        cwd: SANDBOX_PATH
      });
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        console.log(`📊 Validation Result (Exit Code: ${code}):`);
        console.log(output);
        if (errorOutput) {
          console.log('🚨 Errors:', errorOutput);
        }
        
        const success = output.includes('GLOBAL VALIDATION RESULT = PASSED');
        console.log(success ? '✅ VALIDATION PASSED!' : '❌ VALIDATION FAILED!');
        
        resolve(success);
      });
      
      setTimeout(() => {
        process.kill();
        console.log('⏰ Validation timed out');
        resolve(false);
      }, 30000);
    });
  } catch (error) {
    console.log('❌ Error testing sandbox:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 ZATCA Phase 2 Complete Integration Test');
  console.log('=' .repeat(60));
  
  // Step 1: Test sandbox directly
  console.log('\n📋 Step 1: Direct Sandbox Validation');
  const sandboxSuccess = await testSandboxDirectly();
  
  if (!sandboxSuccess) {
    console.log('\n❌ Direct sandbox validation failed. Please check:');
    console.log('1. ZATCA SDK is properly installed');
    console.log('2. Java is available in PATH');
    console.log('3. XML format matches ZATCA requirements');
    return;
  }
  
  // Step 2: Test Tanad API endpoints
  console.log('\n📋 Step 2: Tanad API Integration');
  
  // Generate test XML
  const testXML = generateTestXML(sampleInvoiceData);
  
  // Test status endpoint
  await testEndpoint('/api/zatca/status');
  
  // Test validation endpoint
  await testEndpoint('/api/zatca/validate', 'POST', { xmlContent: testXML });
  
  // Test complete processing
  await testEndpoint('/api/zatca/process', 'POST', { xmlContent: testXML });
  
  // Step 3: Test UI Integration
  console.log('\n📋 Step 3: UI Integration Instructions');
  console.log('1. Start the admin portal: cd Tanad/apps/admin-portal && pnpm dev');
  console.log('2. Open http://localhost:3037/invoices');
  console.log('3. Click on any invoice to see the ZATCA Phase 2 section');
  console.log('4. Test XML generation and processing');
  
  console.log('\n🎉 Complete test finished!');
  console.log('\n📝 Next Steps:');
  console.log('1. If sandbox validation passed, the XML format is correct');
  console.log('2. Test the UI integration in the admin portal');
  console.log('3. Create real invoices and verify ZATCA compliance');
  console.log('4. Deploy to production when ready');
}

// Run tests if this script is executed directly
if (require.main === module) {
  // Check for fetch polyfill in Node.js
  if (typeof fetch === 'undefined') {
    try {
      global.fetch = require('node-fetch');
    } catch (error) {
      console.log('⚠️  node-fetch not available, API tests will be skipped');
      console.log('   Install with: npm install node-fetch');
    }
  }
  
  runCompleteTest().catch(console.error);
} else {
  // Export for use in other scripts
  module.exports = {
    generateTestXML,
    testSandboxDirectly,
    runCompleteTest,
    sampleInvoiceData
  };
} 
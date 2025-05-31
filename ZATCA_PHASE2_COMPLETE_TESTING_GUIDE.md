# 🎯 ZATCA Phase 2 Complete Testing Guide

## ✅ Integration Status

**ZATCA Phase 2 integration is now COMPLETE and ready for testing!**

### What's Been Implemented:

1. **✅ ZATCA Phase 2 UI Component** - Interactive processing interface
2. **✅ API Endpoints** - Complete set of ZATCA processing endpoints
3. **✅ Integration Service** - Browser-compatible API client
4. **✅ Invoice Page Integration** - Added to invoice detail pages
5. **✅ Testing Scripts** - Automated testing capabilities
6. **✅ Production Setup** - Scripts and guides for deployment

---

## 🧪 LOCAL TESTING (Start Here!)

### Step 1: Start the Development Server

The admin portal should already be running. If not:

```bash
cd "C:\Users\IREE\Documents\GitHub\New folder\Tanad\apps\admin-portal"
pnpm dev
```

**Access URL**: `http://localhost:3037`

### Step 2: Test ZATCA Phase 2 Integration

1. **Navigate to Invoices**
   - Go to: `http://localhost:3037/invoices`
   - Click on any existing invoice (or create a new one)

2. **Find ZATCA Phase 2 Section**
   - Scroll down on the invoice detail page
   - Look for the **"ZATCA Phase 2 Processing"** card
   - It appears after the existing ZATCA QR code section

3. **Test the Workflow**
   
   **Step A: Generate XML**
   - Click "Generate XML" button
   - Verify XML preview shows UBL 2.1 content
   - Click "Download XML" to save the file
   
   **Step B: Process with ZATCA**
   - Click "Process with ZATCA" button
   - Watch the real-time processing indicators
   - Verify all steps complete successfully:
     - ✅ Validation: PASSED
     - ✅ Hash Generated
     - ✅ Digital Signature
     - ✅ QR Code
   
   **Step C: Review Results**
   - Check the generated hash (SHA-256 format)
   - Verify QR code data is displayed
   - Download the signed XML file
   - Expand "Processing Details" for full output

### Step 3: Test API Endpoints Directly

Run the test script in browser console:

```javascript
// Open browser console (F12) and run:
fetch('/api/zatca/status')
  .then(r => r.json())
  .then(console.log);

// Test complete processing
fetch('/api/zatca/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    xmlContent: `<?xml version="1.0"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">2.1</cbc:UBLVersionID>
  <cbc:ProfileID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">reporting:1.0</cbc:ProfileID>
  <cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">TEST-001</cbc:ID>
  <cbc:InvoiceTypeCode xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">388</cbc:InvoiceTypeCode>
</Invoice>`
  })
})
.then(r => r.json())
.then(console.log);
```

### Step 4: Verify Expected Behavior

**✅ What Should Work:**
- XML generation from invoice data
- Interactive UI with real-time status
- Simulated ZATCA processing (validation, hash, signing, QR)
- File downloads (XML and signed XML)
- Error handling and user feedback

**⚠️ Current Limitations (Expected):**
- Processing shows "simulated" responses
- Digital signatures are mock placeholders
- QR codes are simulated data
- Real ZATCA SDK integration requires production setup

---

## 🏭 PRODUCTION DEPLOYMENT

### Prerequisites

1. **ZATCA Production Certificates**
   ```bash
   # Required files:
   /opt/zatca/certificates/cert.pem                    # Production certificate
   /opt/zatca/certificates/ec-secp256k1-priv-key.pem  # Private key
   /opt/zatca/certificates/cacert.pem                  # CA certificate
   ```

2. **ZATCA SDK Setup**
   ```bash
   # Download ZATCA SDK
   wget https://zatca.gov.sa/sdk/zatca-einvoicing-sdk-238-R4.0.0.jar
   
   # Place in production location
   mv zatca-einvoicing-sdk-238-R4.0.0.jar /opt/zatca/
   ```

### Production Setup Steps

1. **Run Production Setup Script**
   ```bash
   cd Tanad/apps/admin-portal
   node scripts/setup-zatca-production.js --all
   ```

2. **Update Environment Variables**
   ```bash
   # Edit .env.production
   ZATCA_SDK_JAR_PATH=/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
   ZATCA_SDK_CONFIG_PATH=/opt/zatca/config.json
   ZATCA_CERTIFICATES_PATH=/opt/zatca/certificates
   ZATCA_WORKING_DIR=/opt/zatca
   ```

3. **Replace Simulated API Endpoints**
   
   The production setup script will update:
   - `pages/api/zatca/validate.ts` - Real SDK validation
   - `pages/api/zatca/process.ts` - Real SDK processing
   - Other endpoints as needed

4. **Build and Deploy**
   ```bash
   # Build for production
   pnpm build
   
   # Deploy to your hosting platform
   # (Vercel, AWS, Docker, etc.)
   ```

### Production Testing Checklist

- [ ] **Certificate Validation**
  ```bash
  openssl x509 -in /opt/zatca/certificates/cert.pem -text -noout
  openssl verify -CAfile cacert.pem cert.pem
  ```

- [ ] **SDK Testing**
  ```bash
  java -jar /opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar -validate -invoice test.xml
  ```

- [ ] **API Endpoint Testing**
  ```bash
  curl -X GET https://your-domain.com/api/zatca/status
  curl -X POST https://your-domain.com/api/zatca/process \
    -H "Content-Type: application/json" \
    -d '{"xmlContent": "..."}'
  ```

- [ ] **ZATCA Portal Verification**
  - Submit test invoice to ZATCA portal
  - Verify compliance status shows "PASSED"
  - Test QR code scanning

---

## 🔧 Troubleshooting

### Local Development Issues

**Issue**: ZATCA Phase 2 section not showing
- **Solution**: Check browser console for errors, restart dev server

**Issue**: API endpoints return 404
- **Solution**: Ensure all files are in `pages/api/zatca/`, restart server

**Issue**: Processing always shows "simulated"
- **Solution**: This is expected in development mode

### Production Issues

**Issue**: Certificate errors
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout
# Verify certificate chain
openssl verify -CAfile cacert.pem cert.pem
```

**Issue**: SDK execution errors
```bash
# Test SDK manually
java -jar zatca-einvoicing-sdk-238-R4.0.0.jar -validate -invoice test.xml
# Check Java version (should be 8+)
java -version
```

**Issue**: Performance problems
```bash
# Monitor resources
htop
# Check disk space
df -h
# Test ZATCA connectivity
ping zatca.gov.sa
```

---

## 📊 Testing Scenarios

### Scenario 1: Basic Invoice Processing
1. Create a simple invoice with one item
2. Generate ZATCA XML
3. Process with Phase 2 workflow
4. Verify all steps complete successfully

### Scenario 2: Complex Invoice Testing
1. Create invoice with multiple items, different VAT rates
2. Test with both Standard and Simplified invoice types
3. Verify XML structure and compliance

### Scenario 3: Error Handling
1. Test with invalid XML content
2. Test with missing required fields
3. Verify error messages are user-friendly

### Scenario 4: Performance Testing
1. Process multiple invoices simultaneously
2. Monitor processing times
3. Test with large invoice files

---

## 📈 Monitoring and Analytics

### Key Metrics to Track

1. **Processing Success Rate**
   - Percentage of successful ZATCA processing
   - Validation pass/fail rates

2. **Performance Metrics**
   - Average processing time per invoice
   - API response times
   - Error rates by endpoint

3. **User Adoption**
   - Number of invoices processed with ZATCA
   - Feature usage statistics

### Logging Setup

```typescript
// Add to your logging configuration
logger.info('ZATCA processing started', {
  invoiceId,
  userId,
  timestamp: new Date().toISOString()
});

logger.info('ZATCA processing completed', {
  invoiceId,
  success: result.success,
  processingTime: Date.now() - startTime
});
```

---

## 🎉 Success Criteria

### Local Testing Success
- ✅ ZATCA Phase 2 section appears on invoice pages
- ✅ XML generation works correctly
- ✅ Processing workflow completes without errors
- ✅ UI shows appropriate status indicators
- ✅ File downloads work properly

### Production Success
- ✅ Real ZATCA SDK integration works
- ✅ Digital signatures are valid
- ✅ QR codes scan correctly
- ✅ ZATCA portal accepts invoices
- ✅ Performance meets requirements

---

## 📞 Support Resources

### Documentation
- [ZATCA Official Portal](https://zatca.gov.sa/)
- [UBL 2.1 Specification](http://docs.oasis-open.org/ubl/UBL-2.1.html)
- [Integration Documentation](./ZATCA_PHASE2_INTEGRATION.md)

### Testing Tools
- [XML Validation](https://www.xmlvalidation.com/)
- [QR Code Scanner](https://qr-code-generator.com/qr-code-scanner/)
- [ZATCA SDK Documentation](https://zatca.gov.sa/sdk/)

---

## 🚀 Quick Start Commands

```bash
# Start local testing (5 minutes)
cd "C:\Users\IREE\Documents\GitHub\New folder\Tanad\apps\admin-portal"
pnpm dev
# Open http://localhost:3037/invoices

# Prepare for production
node scripts/setup-zatca-production.js --all
# Follow PRODUCTION_DEPLOYMENT_CHECKLIST.md

# Test API endpoints
node test-zatca-integration.js
```

---

**🎯 Current Status**: 
- ✅ **Local Development**: Ready for testing
- 🔄 **Production**: Setup scripts and guides ready
- 📋 **Documentation**: Complete testing and deployment guides

**Next Action**: Start testing locally at `http://localhost:3037/invoices`! 
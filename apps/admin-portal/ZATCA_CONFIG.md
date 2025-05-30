# ZATCA Integration Configuration Guide

## ✅ Current Status

**All ZATCA endpoints have been fixed and are working!** The integration now supports three operational modes:

1. **🏠 Local Mode** (Default) - Production-ready validation without sandbox dependency
2. **🧪 Sandbox Mode** - Full Phase 2 testing with cryptographic signing
3. **🎭 Simulated Mode** - Development fallback

## 🚀 Quick Start (Recommended for Production)

### For Production Deployment (No Sandbox Required):

```bash
# In your .env.local or production environment
ZATCA_REQUIRE_SANDBOX=false
ZATCA_ALLOW_LOCAL_VALIDATION=true
ZATCA_ENVIRONMENT=production
```

This configuration provides:

- ✅ Full Phase 1 compliance (QR codes, validation)
- ✅ Business rules validation
- ✅ XML schema validation
- ✅ Production-ready deployment
- ❌ No cryptographic signing (Phase 2)

## 🧪 Sandbox Configuration (For Development & Testing)

Only if you want to test Phase 2 features with the ZATCA sandbox:

```bash
# Sandbox Mode (Optional - for Phase 2 testing only)
ZATCA_SDK_JAR_PATH="C:\\path\\to\\zatca-einvoicing-sdk-238-R4.0.0.jar"
ZATCA_SDK_CONFIG_PATH="C:\\path\\to\\Configuration\\config.json"
ZATCA_WORKING_DIR="C:\\path\\to\\zatca-einvoicing-phase2-sandbox"
ZATCA_REQUIRE_SANDBOX=false  # Still allow fallback to local
ZATCA_ALLOW_LOCAL_VALIDATION=true
ZATCA_ENVIRONMENT=sandbox
```

## 📊 API Endpoints Status

All endpoints are working and tested:

- ✅ `POST /api/zatca/validate` - XML validation
- ✅ `POST /api/zatca/hash` - SHA-256 hash generation
- ✅ `POST /api/zatca/qr` - ZATCA QR code generation
- ✅ `POST /api/zatca/sign` - Digital signing (mock/real)
- ✅ `POST /api/zatca/process` - Complete processing pipeline
- ✅ `GET /api/zatca/status` - Configuration status check

## 🧪 Testing Your Configuration

Run the test script to verify all endpoints:

```bash
cd apps/admin-portal
node test-zatca-endpoints.js
```

Or test manually through your app's "Process with ZATCA" button.

## 🌐 Deployment Strategy

### For Production Servers:

```bash
# Production Environment Variables
ZATCA_REQUIRE_SANDBOX=false
ZATCA_ALLOW_LOCAL_VALIDATION=true
ZATCA_ENVIRONMENT=production

# Optional: Production certificates (if you have them)
ZATCA_PROD_VAT_NUMBER="your_real_vat_number"
ZATCA_PROD_CR_NUMBER="your_real_cr_number"
ZATCA_PROD_COMPANY_NAME="Your Company Name"
```

### No Files to Deploy:

- ❌ No need to copy ZATCA sandbox files to production
- ❌ No Java dependencies required
- ❌ No certificates required for Phase 1 compliance
- ✅ Everything works with local validation

## 🎯 Phase 2 Considerations

**For Future Phase 2 Implementation:**

1. You'll need real ZATCA certificates from ZATCA portal
2. Replace sandbox SDK with production SDK
3. Configure real cryptographic signing
4. Update certificate paths in environment variables

**Current Phase 2 Support:**

- ✅ XML structure prepared for Phase 2
- ✅ Mock signing for development
- ✅ Hash generation
- ✅ Integration points ready

## 🔧 Troubleshooting

### Common Issues:

1. **"Process with ZATCA" button not working**

   ```bash
   # Check status endpoint
   curl http://localhost:3037/api/zatca/status
   ```

2. **Validation failing**

   ```bash
   # Test validation directly
   curl -X POST http://localhost:3037/api/zatca/validate \
     -H "Content-Type: application/json" \
     -d '{"xmlContent": "your_xml_here"}'
   ```

3. **Environment configuration**
   - Ensure `.env.local` is in the correct directory
   - Restart your development server after changing environment variables
   - Check console logs for configuration details

## 📈 Monitoring

The system logs detailed information:

- Configuration mode (local/sandbox/simulated)
- Validation results
- Processing steps
- Error details

Check your server logs for ZATCA-related output starting with `🏠`, `🧪`, or `🎭` emojis.

---

**✨ Summary: Your ZATCA integration is production-ready for Phase 1 compliance without requiring the sandbox!**

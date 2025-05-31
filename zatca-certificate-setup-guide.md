# ZATCA Certificate & Signing Setup Guide

## 🚨 Current Issues

Your ZATCA SDK is failing validation due to certificate and signing problems:

### Main Errors:

1. **Certificate Issues**: `Could not parse certificate: Empty input`
2. **Signature Issues**: `BR-KSA-28`, `BR-KSA-29` cryptographic stamp problems
3. **QR Issues**: `failed to generate qr [unable to get signature from invoice]`

## 🔐 Root Cause

ZATCA Phase 2 requires **real cryptographic certificates** for:

- Digital signing of invoices
- QR code generation with embedded signatures
- Cryptographic validation

## 🛠️ Solutions

### Option 1: Use Sandbox Certificates (Testing)

#### Step 1: Check Your `config.json`

Your `zatca/Configuration/config.json` should contain proper certificate paths:

```json
{
  "certificatePath": "./Certificates/sandbox_certificate.p12",
  "certificatePassword": "your_password",
  "privateKeyPath": "./Certificates/private_key.pem",
  "publicKeyPath": "./Certificates/public_key.pem",
  "zatcaEnvironment": "sandbox",
  "apiBaseUrl": "https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal"
}
```

#### Step 2: Download ZATCA Sandbox Certificates

1. Go to [ZATCA Developer Portal](https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/TechnicalRequirements.aspx)
2. Download the sandbox certificate package
3. Extract to `zatca/Certificates/` folder

#### Step 3: Update Certificate Paths

Make sure your certificate files exist:

```
zatca/
├── Apps/
├── Configuration/
│   └── config.json
└── Certificates/
    ├── sandbox_certificate.p12
    ├── private_key.pem
    ├── public_key.pem
    └── ca_certificate.pem
```

### Option 2: Use Local Mode (Skip Certificates)

If you don't need real signatures for testing, force local mode:

#### Environment Variables:

```bash
# Force local validation (no certificates needed)
ZATCA_FORCE_LOCAL=true
ZATCA_ALLOW_LOCAL_VALIDATION=true
ZATCA_REQUIRE_SANDBOX=false
```

#### Test with Local Mode:

```javascript
const response = await fetch("/api/zatca/process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    xmlContent: yourXml,
    mode: "local", // Force local mode
  }),
});
```

### Option 3: Fix Signature Issues

If you want to fix the signature issues in your XML:

#### Update the Signature Section:

Your XML has this signature section that's causing issues:

```xml
<cac:Signature>
  <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
  <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
</cac:Signature>
```

**Fix for BR-KSA-28 & BR-KSA-29:**

```xml
<cac:Signature>
  <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
  <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
</cac:Signature>
```

## 🧪 Testing Strategy

### Phase 1: Test with Local Mode

```bash
# Set environment variables
ZATCA_FORCE_LOCAL=true

# Test API
curl -X POST http://localhost:3000/api/zatca/process \
  -H "Content-Type: application/json" \
  -d '{"xmlContent":"your-xml","mode":"local"}'
```

### Phase 2: Test with Sandbox Certificates

1. Download proper sandbox certificates
2. Update `config.json` with correct paths
3. Test with `mode: "sandbox"`

### Phase 3: Production Setup

1. Get production certificates from ZATCA
2. Replace sandbox certificates
3. Update config for production endpoints

## 🔍 Debugging

### Check Certificate Files:

```bash
# Check if certificate files exist
ls -la zatca/Certificates/

# Check config.json content
cat zatca/Configuration/config.json
```

### Enable More Logging:

Add to your `config.json`:

```json
{
  "logLevel": "DEBUG",
  "enableVerboseLogging": true
}
```

## 📝 Quick Fix for Your Current Issue

**For immediate testing, use local mode:**

```javascript
// Force local mode to bypass certificate issues
const response = await fetch("/api/zatca/process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    xmlContent: yourXml,
    mode: "local", // This will skip certificate validation
  }),
});
```

**Or set environment variable:**

```bash
ZATCA_FORCE_LOCAL=true
```

This will give you mock signatures and QR codes for testing while you set up proper certificates.

## 🚀 Next Steps

1. **Immediate**: Use local mode for testing
2. **Short-term**: Set up sandbox certificates
3. **Long-term**: Get production certificates from ZATCA

The certificate setup is complex but required for real ZATCA compliance. For development/testing, local mode is perfectly fine!

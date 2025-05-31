# ZATCA SDK Deployment Guide

## Overview

Your ZATCA integration supports three modes: Sandbox (full SDK), Local (validation only), and Simulated (mock responses).

## Deployment Option 1: Without SDK (Recommended)

### Environment Variables

```bash
ZATCA_REQUIRE_SANDBOX=false
ZATCA_ALLOW_LOCAL_VALIDATION=true
ZATCA_FORCE_LOCAL=true
```

### What You Get:

- ✅ XML structure validation
- ✅ Business rule validation
- ✅ Mock hash and QR generation
- ✅ Fast deployment
- ❌ No cryptographic signing

## Deployment Option 2: With SDK

### Step 1: Create ZATCA Directory in Project

```
your-project/
├── zatca/
│   ├── zatca-einvoicing-sdk-238-R4.0.0.jar
│   ├── config.json
│   └── certificates/ (if needed)
```

### Step 2: Update Environment Variables

```bash
ZATCA_SDK_JAR_PATH=/app/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
ZATCA_SDK_CONFIG_PATH=/app/zatca/config.json
ZATCA_WORKING_DIR=/app/zatca
ZATCA_REQUIRE_SANDBOX=true
```

### Step 3: Dockerfile Example

```dockerfile
# Install Java (required for ZATCA SDK)
RUN apt-get update && apt-get install -y openjdk-11-jre

# Copy ZATCA SDK files
COPY zatca/ /app/zatca/
RUN chmod +x /app/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
```

## Deployment Option 3: Server-Side SDK Installation

### For Linux Servers:

```bash
# Create ZATCA directory
sudo mkdir -p /opt/zatca

# Copy SDK files to server
scp zatca-einvoicing-sdk-238-R4.0.0.jar user@server:/opt/zatca/
scp config.json user@server:/opt/zatca/

# Set environment variables
export ZATCA_SDK_JAR_PATH=/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
export ZATCA_SDK_CONFIG_PATH=/opt/zatca/config.json
export ZATCA_WORKING_DIR=/opt/zatca
```

### For Windows Servers:

```powershell
# Create ZATCA directory
New-Item -Path "C:\Production\ZATCA" -ItemType Directory

# Copy files and set environment variables
$env:ZATCA_SDK_JAR_PATH="C:\Production\ZATCA\zatca-einvoicing-sdk-238-R4.0.0.jar"
$env:ZATCA_SDK_CONFIG_PATH="C:\Production\ZATCA\config.json"
$env:ZATCA_WORKING_DIR="C:\Production\ZATCA"
```

## Mode Selection Logic

Your code automatically selects the best available mode:

```javascript
if (requestedMode === "auto") {
  if (sandboxAvailable && !process.env.ZATCA_FORCE_LOCAL) {
    processingMode = "sandbox"; // Full SDK
  } else if (allowLocalValidation) {
    processingMode = "local"; // Validation only
  } else {
    processingMode = "simulated"; // Mock responses
  }
}
```

## Recommendations

### For Development/Testing:

Use **Local Mode** - provides good validation without SDK complexity

### For Production:

- **Local Mode**: If you only need validation and mock signing
- **Sandbox Mode**: If you need real cryptographic signatures and official ZATCA compliance

### Security Note:

The ZATCA SDK requires proper certificates and authentication for production use. Make sure to:

1. Use real certificates (not sandbox ones) in production
2. Secure the config.json file with proper credentials
3. Implement proper access controls for the ZATCA directory

## Testing Your Setup

Test each mode with:

```javascript
// Force specific mode
const response = await fetch("/api/zatca/process", {
  method: "POST",
  body: JSON.stringify({
    xmlContent: yourXml,
    mode: "local", // or 'sandbox' or 'simulated'
  }),
});
```

# ZATCA Certificate Setup Guide

## 🔐 **Where to Use Your Certificates**

Since you already have **sandbox certificates** from ZATCA testing, here's how to use them:

### **1. Development Environment (Your Local Machine)**

- Use **sandbox certificates** for testing
- Certificates stay on your local machine
- No need to deploy certificates to production yet

### **2. Production Server (When You Deploy)**

- Use **production certificates** from ZATCA
- Store certificates securely on the server
- Never commit certificates to git

## 📁 **Certificate File Structure**

Create this folder structure in your project:

```
apps/admin-portal/
├── certificates/
│   ├── sandbox/
│   │   ├── cert.pem          # Your sandbox certificate
│   │   ├── private-key.pem   # Your sandbox private key
│   │   └── config.json       # ZATCA SDK config
│   └── production/
│       ├── cert.pem          # Production certificate (when ready)
│       ├── private-key.pem   # Production private key
│       └── config.json       # Production config
└── .env.local                # Environment variables
```

## ⚙️ **Environment Configuration**

### **Step 1: Create `.env.local` file**

```bash
# ZATCA Configuration
ZATCA_ENVIRONMENT=sandbox

# Sandbox Certificates (use your existing ones)
ZATCA_SANDBOX_CERT_PATH=./certificates/sandbox/cert.pem
ZATCA_SANDBOX_KEY_PATH=./certificates/sandbox/private-key.pem
ZATCA_SANDBOX_CERT_PASSWORD=your_sandbox_password
ZATCA_SANDBOX_VAT_NUMBER=300000000000003
ZATCA_SANDBOX_CR_NUMBER=300000000000003
ZATCA_SANDBOX_COMPANY_NAME=Test Company

# Production (for later when you deploy)
ZATCA_PROD_CERT_PATH=/secure/path/to/prod/cert.pem
ZATCA_PROD_KEY_PATH=/secure/path/to/prod/private-key.pem
ZATCA_PROD_CERT_PASSWORD=your_production_password
ZATCA_PROD_VAT_NUMBER=your_real_vat_number
ZATCA_PROD_CR_NUMBER=your_real_cr_number
ZATCA_PROD_COMPANY_NAME=Your Real Company Name
```

### **Step 2: Copy Your Sandbox Certificates**

1. **Find your existing sandbox certificates** (from your ZATCA testing)
2. **Copy them** to `apps/admin-portal/certificates/sandbox/`
3. **Update the paths** in `.env.local`

## 🚀 **Usage in Different Environments**

### **Local Development (Now)**

```bash
# Use sandbox certificates
ZATCA_ENVIRONMENT=sandbox
```

### **Staging Server**

```bash
# Still use sandbox for testing
ZATCA_ENVIRONMENT=sandbox
```

### **Production Server (When Ready)**

```bash
# Use real production certificates
ZATCA_ENVIRONMENT=production
```

## 🔧 **How to Use in Your Code**

The certificate manager automatically loads the right certificates:

```typescript
import { zatcaCertificateManager } from "@/lib/zatca/zatca-certificate-config";

// Check current environment
console.log("Environment:", zatcaCertificateManager.getEnvironment());

// Load certificates
const { certificate, privateKey, isValid, errors } =
  await zatcaCertificateManager.loadCertificates();

if (isValid) {
  // Use certificates for signing
  console.log("Certificates loaded successfully");
} else {
  console.error("Certificate errors:", errors);
}
```

## 📋 **Certificate Requirements**

### **Sandbox Certificates (You Already Have)**

- ✅ Certificate file (`.pem` or `.crt`)
- ✅ Private key file (`.pem` or `.key`)
- ✅ Password (if encrypted)
- ✅ VAT number (test number)

### **Production Certificates (For Later)**

- 🔄 Real certificate from ZATCA portal
- 🔄 Real private key
- 🔄 Real company VAT number
- 🔄 Real CR number

## 🛡️ **Security Best Practices**

### **Development**

- ✅ Store certificates in `certificates/` folder
- ✅ Add `certificates/` to `.gitignore`
- ✅ Use environment variables for paths

### **Production**

- 🔐 Store certificates outside web root
- 🔐 Use secure file permissions (600)
- 🔐 Use environment variables or secret management
- 🔐 Never commit certificates to git

## 📝 **Next Steps**

### **For Testing (Now)**

1. Copy your sandbox certificates to the project
2. Update `.env.local` with correct paths
3. Test with your existing certificates

### **For Production (Later)**

1. Get production certificates from ZATCA portal
2. Store them securely on production server
3. Update environment variables
4. Switch `ZATCA_ENVIRONMENT=production`

## 🔍 **Troubleshooting**

### **Certificate Not Found**

```bash
# Check file paths
ls -la certificates/sandbox/
```

### **Permission Denied**

```bash
# Fix file permissions
chmod 600 certificates/sandbox/*.pem
```

### **Invalid Certificate**

- Check certificate format (PEM)
- Verify password is correct
- Ensure certificate is not expired

## 📞 **Testing Your Setup**

Use the test pages I created:

- `http://localhost:3000/zatca-test` - Test XML validation
- `http://localhost:3000/invoices/test-zatca` - Test full workflow

The system will automatically use your configured certificates!

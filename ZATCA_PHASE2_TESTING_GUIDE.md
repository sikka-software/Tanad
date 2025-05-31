# ZATCA Phase 2 Testing Guide - Tanad Admin Portal

## 🧪 Local Development Testing

### Prerequisites

1. **Install Dependencies**
   ```bash
   cd Tanad
   pnpm install
   ```

2. **Environment Setup**
   Create `.env.local` in `apps/admin-portal/`:
   ```bash
   # ZATCA SDK Configuration (for production)
   ZATCA_SDK_JAR_PATH=../../../zatca-einvoicing-phase2-sandbox/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar
   ZATCA_SDK_CONFIG_PATH=../../../zatca-einvoicing-phase2-sandbox/Configuration/config.json
   ZATCA_CERTIFICATES_PATH=../../../zatca-einvoicing-phase2-sandbox/Data/Certificates
   ZATCA_WORKING_DIR=../../../zatca-einvoicing-phase2-sandbox

   # Database and other configs
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

### 🚀 Start Local Development

1. **Start the Admin Portal**
   ```bash
   cd Tanad/apps/admin-portal
   pnpm dev
   ```
   
   The admin portal will be available at: `http://localhost:3037`

2. **Access Invoice Management**
   - Navigate to: `http://localhost:3037/invoices`
   - Click on any existing invoice or create a new one
   - Go to the invoice detail page: `http://localhost:3037/invoices/[invoice-id]`

### 🔍 Testing ZATCA Phase 2 Features

#### Step 1: Verify Integration
1. **Check ZATCA Phase 2 Section**
   - Open any invoice detail page
   - Scroll down to see the "ZATCA Phase 2 Processing" card
   - It should appear after the existing ZATCA QR code section

2. **Generate XML**
   - Click "Generate XML" button
   - Verify XML is generated and preview shows UBL 2.1 content
   - Click "Download XML" to save the file

#### Step 2: Test Processing Workflow
1. **Process Invoice**
   - Click "Process with ZATCA" button
   - Watch the processing status indicators
   - Verify all steps complete successfully:
     - ✅ Validation: PASSED
     - ✅ Hash Generated
     - ✅ Digital Signature
     - ✅ QR Code

2. **Review Results**
   - Check the generated hash (SHA-256 format)
   - Verify QR code data is displayed
   - Download the signed XML file

#### Step 3: API Endpoint Testing

Test individual API endpoints using curl or Postman:

```bash
# Test status endpoint
curl -X GET http://localhost:3037/api/zatca/status

# Test validation endpoint
curl -X POST http://localhost:3037/api/zatca/validate \
  -H "Content-Type: application/json" \
  -d '{"xmlContent": "<?xml version=\"1.0\"?>..."}'

# Test complete processing
curl -X POST http://localhost:3037/api/zatca/process \
  -H "Content-Type: application/json" \
  -d '{"xmlContent": "<?xml version=\"1.0\"?>..."}'
```

### 🐛 Troubleshooting Local Issues

#### Common Issues:

1. **"Cannot find module" errors**
   - Run `pnpm install` in the admin-portal directory
   - Restart the development server

2. **ZATCA Phase 2 section not showing**
   - Check browser console for JavaScript errors
   - Verify the component import in `[id].tsx`

3. **API endpoints returning 404**
   - Ensure all API files are in `pages/api/zatca/`
   - Restart the Next.js development server

4. **Processing always shows "simulated"**
   - This is expected in development mode
   - Real SDK integration requires production setup

## 🏭 Production Deployment

### Prerequisites for Production

1. **ZATCA Production Certificates**
   ```bash
   # Required certificate files:
   /Data/Certificates/cert.pem                    # Production certificate
   /Data/Certificates/ec-secp256k1-priv-key.pem  # Private key
   /Data/Certificates/cacert.pem                  # CA certificate
   ```

2. **ZATCA SDK Setup**
   ```bash
   # Download and setup ZATCA SDK
   wget https://zatca.gov.sa/sdk/zatca-einvoicing-sdk-238-R4.0.0.jar
   
   # Create configuration
   cp Configuration/config.json.template Configuration/config.json
   # Edit config.json with production settings
   ```

### 🔧 Production Configuration

#### 1. Environment Variables
```bash
# Production .env
NODE_ENV=production
ZATCA_SDK_JAR_PATH=/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
ZATCA_SDK_CONFIG_PATH=/opt/zatca/config.json
ZATCA_CERTIFICATES_PATH=/opt/zatca/certificates
ZATCA_WORKING_DIR=/opt/zatca

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_key
```

#### 2. Update API Endpoints for Production

Replace simulated responses in API endpoints:

**`pages/api/zatca/validate.ts`** - Remove simulation, use real SDK:
```typescript
// Remove simulation code and use actual ZATCA SDK execution
const result = await executeSDKCommand(
  ['-validate', '-invoice', tempFile],
  sdkJarPath,
  sdkConfigPath,
  workingDirectory
);
```

**`pages/api/zatca/process.ts`** - Implement real processing:
```typescript
// Replace mock functions with actual ZATCA SDK calls
const validationResult = await validateWithSDK(xmlContent);
const hashResult = await generateHashWithSDK(xmlContent);
const signingResult = await signWithSDK(xmlContent);
const qrResult = await generateQRWithSDK(signedXml);
```

#### 3. Production Build and Deployment

```bash
# Build for production
cd Tanad/apps/admin-portal
pnpm build

# Start production server
pnpm start

# Or deploy to your hosting platform
# (Vercel, AWS, Docker, etc.)
```

### 🔐 Production Security Setup

#### 1. Certificate Management
```bash
# Secure certificate storage
chmod 600 /opt/zatca/certificates/*.pem
chown app:app /opt/zatca/certificates/*.pem

# Environment-specific certificates
# Development: Use sandbox certificates
# Production: Use ZATCA-issued production certificates
```

#### 2. API Security
```typescript
// Add authentication to API endpoints
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user authentication
  const { user } = await supabase.auth.getUser(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Continue with ZATCA processing...
}
```

#### 3. Rate Limiting
```typescript
// Implement rate limiting for ZATCA API calls
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 📊 Production Monitoring

#### 1. Logging Setup
```typescript
// Add comprehensive logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'zatca-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'zatca-combined.log' })
  ]
});

// Log ZATCA operations
logger.info('ZATCA processing started', { invoiceId, userId });
```

#### 2. Health Checks
```typescript
// Add health check endpoint
// pages/api/health/zatca.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sdkStatus = await checkZatcaSDKHealth();
    const certificateStatus = await checkCertificateValidity();
    
    res.status(200).json({
      status: 'healthy',
      sdk: sdkStatus,
      certificates: certificateStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
}
```

#### 3. Performance Monitoring
```typescript
// Monitor ZATCA processing times
const startTime = Date.now();
const result = await processZatcaInvoice(xmlContent);
const processingTime = Date.now() - startTime;

// Log performance metrics
logger.info('ZATCA processing completed', {
  processingTime,
  success: result.success,
  invoiceId
});
```

### 🧪 Production Testing Checklist

#### Pre-Deployment Testing
- [ ] All API endpoints respond correctly
- [ ] Real ZATCA SDK integration works
- [ ] Certificates are properly configured
- [ ] Database connections are secure
- [ ] Error handling works correctly
- [ ] Logging is comprehensive

#### Post-Deployment Testing
- [ ] Create test invoice in production
- [ ] Generate and validate XML
- [ ] Process with real ZATCA SDK
- [ ] Verify digital signatures
- [ ] Test QR code generation
- [ ] Monitor performance metrics
- [ ] Check error logs

#### ZATCA Compliance Testing
- [ ] Submit test invoice to ZATCA portal
- [ ] Verify compliance status
- [ ] Test with different invoice types
- [ ] Validate against ZATCA business rules
- [ ] Confirm QR codes scan correctly

### 🚨 Production Troubleshooting

#### Common Production Issues:

1. **Certificate Errors**
   ```bash
   # Check certificate validity
   openssl x509 -in cert.pem -text -noout
   
   # Verify certificate chain
   openssl verify -CAfile cacert.pem cert.pem
   ```

2. **SDK Execution Errors**
   ```bash
   # Test SDK manually
   java -jar zatca-einvoicing-sdk-238-R4.0.0.jar -validate -invoice test.xml
   
   # Check Java version
   java -version  # Should be Java 8 or higher
   ```

3. **Performance Issues**
   ```bash
   # Monitor resource usage
   htop
   
   # Check disk space
   df -h
   
   # Monitor network connectivity to ZATCA
   ping zatca.gov.sa
   ```

### 📈 Scaling Considerations

#### For High Volume Processing:
1. **Queue System**: Implement Redis/Bull for background processing
2. **Load Balancing**: Use multiple instances for ZATCA processing
3. **Caching**: Cache validation results and certificates
4. **Database Optimization**: Index invoice tables properly

#### Example Queue Implementation:
```typescript
// Background job for ZATCA processing
import Queue from 'bull';

const zatcaQueue = new Queue('ZATCA processing');

zatcaQueue.process(async (job) => {
  const { invoiceId, xmlContent } = job.data;
  const result = await processZatcaInvoice(xmlContent);
  
  // Update database with results
  await updateInvoiceZatcaStatus(invoiceId, result);
});
```

## 📞 Support and Resources

### Documentation
- [ZATCA Official Portal](https://zatca.gov.sa/)
- [UBL 2.1 Specification](http://docs.oasis-open.org/ubl/UBL-2.1.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Testing Tools
- [ZATCA SDK Documentation](https://zatca.gov.sa/sdk/)
- [XML Validation Tools](https://www.xmlvalidation.com/)
- [QR Code Readers](https://qr-code-generator.com/qr-code-scanner/)

### Monitoring Tools
- Application Performance Monitoring (APM)
- Log aggregation (ELK Stack, Splunk)
- Uptime monitoring (Pingdom, UptimeRobot)

---

## 🎯 Quick Start Summary

### Local Testing (5 minutes):
1. `cd Tanad/apps/admin-portal && pnpm dev`
2. Open `http://localhost:3037/invoices`
3. Click any invoice → Test ZATCA Phase 2 section

### Production Deployment:
1. Setup ZATCA certificates
2. Configure environment variables
3. Update API endpoints to use real SDK
4. Deploy and monitor

**Current Status**: ✅ Local development ready | 🔄 Production setup required 
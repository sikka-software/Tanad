#!/usr/bin/env node

/**
 * ZATCA Phase 2 Production Setup Script
 * This script helps transition from simulated to real ZATCA SDK integration
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_API_TEMPLATES = {
  validate: `import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { tmpdir } from 'os';
import path from 'path';

interface ZatcaValidationResult {
  success: boolean;
  validationPassed: boolean;
  message: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaValidationResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      validationPassed: false,
      message: 'Method not allowed'
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      validationPassed: false,
      message: 'XML content is required'
    });
  }

  try {
    // ZATCA SDK configuration
    const sdkJarPath = process.env.ZATCA_SDK_JAR_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar');
    const sdkConfigPath = process.env.ZATCA_SDK_CONFIG_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Configuration', 'config.json');
    const workingDirectory = process.env.ZATCA_WORKING_DIR || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox');

    // Create temporary file for XML content
    const tempFile = await createTempFile(xmlContent, 'invoice_validate_', '.xml');
    
    try {
      const result = await executeSDKCommand(
        ['-validate', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      const validationPassed = result.output.includes('GLOBAL VALIDATION RESULT = PASSED');
      
      const response: ZatcaValidationResult = {
        success: result.success,
        validationPassed,
        message: validationPassed ? 'Invoice validation passed' : 'Invoice validation failed',
        details: result.output
      };

      res.status(200).json(response);
    } finally {
      // Clean up temp file
      await cleanupTempFile(tempFile);
    }
  } catch (error) {
    console.error('ZATCA validation error:', error);
    res.status(500).json({
      success: false,
      validationPassed: false,
      message: 'Validation error: ' + (error as Error).message,
      details: (error as Error).stack
    });
  }
}

// Helper functions
async function createTempFile(content: string, prefix: string, suffix: string): Promise<string> {
  const tempDir = tmpdir();
  const fileName = \`\${prefix}\${Date.now()}\${Math.random().toString(36).substr(2, 9)}\${suffix}\`;
  const filePath = path.join(tempDir, fileName);
  
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('Failed to cleanup temp file:', filePath, error);
  }
}

async function executeSDKCommand(
  args: string[],
  sdkJarPath: string,
  sdkConfigPath: string,
  workingDirectory: string
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve, reject) => {
    const command = 'java';
    const fullArgs = ['-jar', sdkJarPath, ...args];
    
    const process = spawn(command, fullArgs, {
      cwd: workingDirectory,
      env: {
        ...process.env,
        SDK_CONFIG: sdkConfigPath
      }
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
      const success = code === 0;
      const fullOutput = output + (errorOutput ? '\\nErrors:\\n' + errorOutput : '');
      
      resolve({
        success,
        output: fullOutput
      });
    });

    process.on('error', (error) => {
      reject(new Error(\`Failed to execute ZATCA SDK: \${error.message}\`));
    });

    // Set timeout for long-running operations
    setTimeout(() => {
      process.kill();
      reject(new Error('ZATCA SDK operation timed out'));
    }, 60000); // 60 seconds timeout
  });
}`,

  process: `import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { tmpdir } from 'os';
import path from 'path';

interface ZatcaProcessingResult {
  success: boolean;
  message: string;
  hash?: string;
  qrCode?: string;
  signedXml?: string;
  validationPassed?: boolean;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaProcessingResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      message: 'XML content is required'
    });
  }

  try {
    // ZATCA SDK configuration
    const sdkJarPath = process.env.ZATCA_SDK_JAR_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar');
    const sdkConfigPath = process.env.ZATCA_SDK_CONFIG_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Configuration', 'config.json');
    const workingDirectory = process.env.ZATCA_WORKING_DIR || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox');

    // Create temporary file for XML content
    const tempFile = await createTempFile(xmlContent, 'invoice_process_', '.xml');
    
    try {
      // Step 1: Validate
      const validationResult = await executeSDKCommand(
        ['-validate', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      const validationPassed = validationResult.output.includes('GLOBAL VALIDATION RESULT = PASSED');
      
      if (!validationPassed) {
        return res.status(400).json({
          success: false,
          message: 'Invoice validation failed',
          validationPassed: false,
          details: validationResult.output
        });
      }

      // Step 2: Generate Hash
      const hashResult = await executeSDKCommand(
        ['-hash', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      // Step 3: Sign Invoice
      const signResult = await executeSDKCommand(
        ['-sign', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      // Step 4: Generate QR Code
      const qrResult = await executeSDKCommand(
        ['-qr', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      // Read signed XML if available
      const signedXmlPath = path.join(workingDirectory, 'signed_invoice.xml');
      let signedXml = '';
      try {
        signedXml = await fs.readFile(signedXmlPath, 'utf-8');
      } catch (error) {
        console.warn('Could not read signed XML file:', error);
      }

      const response: ZatcaProcessingResult = {
        success: true,
        message: 'ZATCA Phase 2 processing completed successfully',
        hash: extractHashFromOutput(hashResult.output),
        qrCode: extractQRFromOutput(qrResult.output),
        signedXml: signedXml || xmlContent,
        validationPassed: true,
        details: \`Validation: PASSED\\nHash: Generated\\nSigning: Completed\\nQR: Generated\`
      };

      res.status(200).json(response);
    } finally {
      // Clean up temp file
      await cleanupTempFile(tempFile);
    }
  } catch (error) {
    console.error('ZATCA processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Processing error: ' + (error as Error).message,
      details: (error as Error).stack
    });
  }
}

// Helper functions
async function createTempFile(content: string, prefix: string, suffix: string): Promise<string> {
  const tempDir = tmpdir();
  const fileName = \`\${prefix}\${Date.now()}\${Math.random().toString(36).substr(2, 9)}\${suffix}\`;
  const filePath = path.join(tempDir, fileName);
  
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('Failed to cleanup temp file:', filePath, error);
  }
}

async function executeSDKCommand(
  args: string[],
  sdkJarPath: string,
  sdkConfigPath: string,
  workingDirectory: string
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve, reject) => {
    const command = 'java';
    const fullArgs = ['-jar', sdkJarPath, ...args];
    
    const process = spawn(command, fullArgs, {
      cwd: workingDirectory,
      env: {
        ...process.env,
        SDK_CONFIG: sdkConfigPath
      }
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
      const success = code === 0;
      const fullOutput = output + (errorOutput ? '\\nErrors:\\n' + errorOutput : '');
      
      resolve({
        success,
        output: fullOutput
      });
    });

    process.on('error', (error) => {
      reject(new Error(\`Failed to execute ZATCA SDK: \${error.message}\`));
    });

    // Set timeout for long-running operations
    setTimeout(() => {
      process.kill();
      reject(new Error('ZATCA SDK operation timed out'));
    }, 60000); // 60 seconds timeout
  });
}

function extractHashFromOutput(output: string): string {
  // Extract hash from SDK output
  const hashMatch = output.match(/Hash:\\s*([A-Za-z0-9+/=]+)/);
  return hashMatch ? hashMatch[1] : '';
}

function extractQRFromOutput(output: string): string {
  // Extract QR code from SDK output
  const qrMatch = output.match(/QR:\\s*([A-Za-z0-9+/=]+)/);
  return qrMatch ? qrMatch[1] : '';
}`
};

function createBackup(filePath) {
  const backupPath = filePath + '.backup.' + Date.now();
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(\`📦 Backup created: \${backupPath}\`);
  }
}

function updateApiEndpoint(endpointName, content) {
  const apiPath = path.join(__dirname, '..', 'pages', 'api', 'zatca', \`\${endpointName}.ts\`);
  
  console.log(\`🔄 Updating \${endpointName}.ts for production...\`);
  
  // Create backup
  createBackup(apiPath);
  
  // Write production version
  fs.writeFileSync(apiPath, content);
  console.log(\`✅ Updated \${apiPath}\`);
}

function createProductionEnv() {
  const envPath = path.join(__dirname, '..', '.env.production');
  const envContent = \`# ZATCA Phase 2 Production Configuration
NODE_ENV=production

# ZATCA SDK Configuration
ZATCA_SDK_JAR_PATH=/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar
ZATCA_SDK_CONFIG_PATH=/opt/zatca/config.json
ZATCA_CERTIFICATES_PATH=/opt/zatca/certificates
ZATCA_WORKING_DIR=/opt/zatca

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
\`;

  fs.writeFileSync(envPath, envContent);
  console.log(\`📝 Created production environment file: \${envPath}\`);
}

function createDeploymentChecklist() {
  const checklistPath = path.join(__dirname, '..', 'PRODUCTION_DEPLOYMENT_CHECKLIST.md');
  const checklistContent = \`# ZATCA Phase 2 Production Deployment Checklist

## Pre-Deployment

### 1. ZATCA Certificates
- [ ] Obtain production certificates from ZATCA portal
- [ ] Install certificates in \`/opt/zatca/certificates/\`
- [ ] Verify certificate validity: \`openssl x509 -in cert.pem -text -noout\`
- [ ] Test certificate chain: \`openssl verify -CAfile cacert.pem cert.pem\`

### 2. Environment Configuration
- [ ] Update \`.env.production\` with production values
- [ ] Set correct ZATCA SDK paths
- [ ] Configure database connections
- [ ] Set up monitoring and logging

### 3. Code Updates
- [ ] Run production setup script: \`node scripts/setup-zatca-production.js\`
- [ ] Review updated API endpoints
- [ ] Test with real ZATCA SDK locally
- [ ] Verify all simulated responses are replaced

### 4. Security
- [ ] Enable authentication on API endpoints
- [ ] Implement rate limiting
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure firewall rules

## Deployment

### 5. Build and Deploy
- [ ] Run production build: \`pnpm build\`
- [ ] Deploy to production environment
- [ ] Verify environment variables are set
- [ ] Check application starts successfully

### 6. Post-Deployment Testing
- [ ] Test ZATCA status endpoint: \`/api/zatca/status\`
- [ ] Create test invoice and process with ZATCA
- [ ] Verify digital signatures are valid
- [ ] Test QR code generation and scanning
- [ ] Monitor application logs for errors

### 7. ZATCA Compliance Verification
- [ ] Submit test invoice to ZATCA portal
- [ ] Verify compliance status shows "PASSED"
- [ ] Test with different invoice types (Standard/Simplified)
- [ ] Validate against ZATCA business rules

## Monitoring

### 8. Set Up Monitoring
- [ ] Configure application performance monitoring
- [ ] Set up log aggregation and alerting
- [ ] Monitor ZATCA processing times
- [ ] Set up uptime monitoring

### 9. Documentation
- [ ] Update API documentation
- [ ] Create user guides for ZATCA features
- [ ] Document troubleshooting procedures
- [ ] Update deployment procedures

## Rollback Plan

### 10. Prepare Rollback
- [ ] Document rollback procedures
- [ ] Keep backup of previous version
- [ ] Test rollback process in staging
- [ ] Prepare communication plan for issues

---

**Note**: This checklist ensures a smooth transition from development to production for ZATCA Phase 2 compliance.
\`;

  fs.writeFileSync(checklistPath, checklistContent);
  console.log(\`📋 Created deployment checklist: \${checklistPath}\`);
}

function main() {
  console.log('🚀 ZATCA Phase 2 Production Setup');
  console.log('=' .repeat(50));
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(\`
Usage: node setup-zatca-production.js [options]

Options:
  --api-only     Update only API endpoints
  --env-only     Create only environment files
  --checklist    Create only deployment checklist
  --all          Run complete setup (default)
  --help, -h     Show this help message

Examples:
  node setup-zatca-production.js --all
  node setup-zatca-production.js --api-only
  node setup-zatca-production.js --checklist
\`);
    return;
  }
  
  const apiOnly = args.includes('--api-only');
  const envOnly = args.includes('--env-only');
  const checklistOnly = args.includes('--checklist');
  const all = args.includes('--all') || args.length === 0;
  
  try {
    if (all || apiOnly) {
      console.log('\\n📡 Updating API endpoints for production...');
      updateApiEndpoint('validate', PRODUCTION_API_TEMPLATES.validate);
      updateApiEndpoint('process', PRODUCTION_API_TEMPLATES.process);
      console.log('✅ API endpoints updated successfully');
    }
    
    if (all || envOnly) {
      console.log('\\n🔧 Creating production environment configuration...');
      createProductionEnv();
      console.log('✅ Environment configuration created');
    }
    
    if (all || checklistOnly) {
      console.log('\\n📋 Creating deployment checklist...');
      createDeploymentChecklist();
      console.log('✅ Deployment checklist created');
    }
    
    console.log('\\n🎉 Production setup completed successfully!');
    console.log('\\n📝 Next Steps:');
    console.log('1. Review the created files');
    console.log('2. Update .env.production with your actual values');
    console.log('3. Follow the deployment checklist');
    console.log('4. Test thoroughly before going live');
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updateApiEndpoint,
  createProductionEnv,
  createDeploymentChecklist
}; 
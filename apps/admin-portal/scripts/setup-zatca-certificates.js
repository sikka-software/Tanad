#!/usr/bin/env node

/**
 * ZATCA Certificate Setup Script
 * Helps configure ZATCA certificates for development and production
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupCertificates() {
  console.log("🔐 ZATCA Certificate Setup");
  console.log("==========================\n");

  // Create certificates directory
  const certDir = path.join(__dirname, "..", "certificates");
  const sandboxDir = path.join(certDir, "sandbox");
  const prodDir = path.join(certDir, "production");

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
    console.log("✅ Created certificates directory");
  }

  if (!fs.existsSync(sandboxDir)) {
    fs.mkdirSync(sandboxDir, { recursive: true });
    console.log("✅ Created sandbox certificates directory");
  }

  if (!fs.existsSync(prodDir)) {
    fs.mkdirSync(prodDir, { recursive: true });
    console.log("✅ Created production certificates directory");
  }

  // Check if user has existing certificates
  const hasCerts = await question("\nDo you have ZATCA certificates from sandbox testing? (y/n): ");

  if (hasCerts.toLowerCase() === "y") {
    console.log("\n📁 Certificate File Locations:");
    console.log(`Sandbox directory: ${sandboxDir}`);
    console.log(`Production directory: ${prodDir}`);

    const certPath = await question("\nEnter path to your certificate file (.pem): ");
    const keyPath = await question("Enter path to your private key file (.pem): ");
    const password = await question("Enter certificate password (if any): ");
    const vatNumber = await question("Enter your VAT number: ");
    const companyName = await question("Enter your company name: ");

    // Copy certificates if they exist
    if (fs.existsSync(certPath)) {
      const targetCertPath = path.join(sandboxDir, "cert.pem");
      fs.copyFileSync(certPath, targetCertPath);
      console.log(`✅ Copied certificate to ${targetCertPath}`);
    }

    if (fs.existsSync(keyPath)) {
      const targetKeyPath = path.join(sandboxDir, "private-key.pem");
      fs.copyFileSync(keyPath, targetKeyPath);
      console.log(`✅ Copied private key to ${targetKeyPath}`);
    }

    // Create .env.local file
    const envContent = `# ZATCA Configuration
ZATCA_ENVIRONMENT=sandbox

# Sandbox Certificates
ZATCA_SANDBOX_CERT_PATH=./certificates/sandbox/cert.pem
ZATCA_SANDBOX_KEY_PATH=./certificates/sandbox/private-key.pem
ZATCA_SANDBOX_CERT_PASSWORD=${password}
ZATCA_SANDBOX_VAT_NUMBER=${vatNumber}
ZATCA_SANDBOX_CR_NUMBER=${vatNumber}
ZATCA_SANDBOX_COMPANY_NAME=${companyName}

# Production (configure when ready)
ZATCA_PROD_CERT_PATH=./certificates/production/cert.pem
ZATCA_PROD_KEY_PATH=./certificates/production/private-key.pem
ZATCA_PROD_CERT_PASSWORD=
ZATCA_PROD_VAT_NUMBER=
ZATCA_PROD_CR_NUMBER=
ZATCA_PROD_COMPANY_NAME=
`;

    const envPath = path.join(__dirname, "..", ".env.local");
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created ${envPath}`);
  } else {
    console.log("\n📋 Next Steps:");
    console.log("1. Get ZATCA certificates from the sandbox portal");
    console.log("2. Copy them to the certificates/sandbox/ directory");
    console.log("3. Run this script again to configure them");
  }

  // Create .gitignore entry
  const gitignorePath = path.join(__dirname, "..", ".gitignore");
  let gitignoreContent = "";

  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  }

  if (!gitignoreContent.includes("certificates/")) {
    gitignoreContent += "\n# ZATCA Certificates\ncertificates/\n.env.local\n";
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log("✅ Updated .gitignore to exclude certificates");
  }

  console.log("\n🎉 Setup complete!");
  console.log("\n📖 Next steps:");
  console.log("1. Start your development server: npm run dev");
  console.log("2. Visit http://localhost:3000/zatca-test to test");
  console.log("3. Visit http://localhost:3000/invoices/test-zatca for full workflow");

  rl.close();
}

// Run the setup
setupCertificates().catch(console.error);

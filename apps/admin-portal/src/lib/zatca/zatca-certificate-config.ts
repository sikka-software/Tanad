/**
 * ZATCA Certificate Configuration
 * Handles both sandbox and production certificates
 */

export interface ZatcaCertificateConfig {
  environment: "sandbox" | "production";
  certificatePath?: string;
  privateKeyPath?: string;
  certificateContent?: string;
  privateKeyContent?: string;
  certificatePassword?: string;
  issuerName?: string;
  serialNumber?: string;
}

export interface ZatcaEnvironmentConfig {
  apiUrl: string;
  certificates: ZatcaCertificateConfig;
  companyInfo: {
    vatNumber: string;
    crNumber: string;
    companyName: string;
  };
}

/**
 * Default configuration for different environments
 */
export const ZATCA_ENVIRONMENTS: Record<string, ZatcaEnvironmentConfig> = {
  sandbox: {
    apiUrl: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
    certificates: {
      environment: "sandbox",
      // These should be loaded from environment variables or secure storage
      certificatePath: process.env.ZATCA_SANDBOX_CERT_PATH,
      privateKeyPath: process.env.ZATCA_SANDBOX_KEY_PATH,
      certificatePassword: process.env.ZATCA_SANDBOX_CERT_PASSWORD,
    },
    companyInfo: {
      vatNumber: process.env.ZATCA_SANDBOX_VAT_NUMBER || "300000000000003",
      crNumber: process.env.ZATCA_SANDBOX_CR_NUMBER || "300000000000003",
      companyName: process.env.ZATCA_SANDBOX_COMPANY_NAME || "Test Company",
    },
  },
  production: {
    apiUrl: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
    certificates: {
      environment: "production",
      certificatePath: process.env.ZATCA_PROD_CERT_PATH,
      privateKeyPath: process.env.ZATCA_PROD_KEY_PATH,
      certificatePassword: process.env.ZATCA_PROD_CERT_PASSWORD,
    },
    companyInfo: {
      vatNumber: process.env.ZATCA_PROD_VAT_NUMBER || "",
      crNumber: process.env.ZATCA_PROD_CR_NUMBER || "",
      companyName: process.env.ZATCA_PROD_COMPANY_NAME || "",
    },
  },
};

/**
 * Get current environment configuration
 */
export function getZatcaEnvironment(): ZatcaEnvironmentConfig {
  const env = process.env.ZATCA_ENVIRONMENT || "sandbox";
  return ZATCA_ENVIRONMENTS[env];
}

/**
 * Check if certificates are properly configured
 */
export function validateCertificateConfig(config: ZatcaCertificateConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.certificatePath && !config.certificateContent) {
    errors.push("Certificate path or content is required");
  }

  if (!config.privateKeyPath && !config.privateKeyContent) {
    errors.push("Private key path or content is required");
  }

  if (config.environment === "production") {
    if (!config.certificatePassword) {
      errors.push("Certificate password is required for production");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load certificate content from file or environment
 */
export async function loadCertificateContent(config: ZatcaCertificateConfig): Promise<{
  certificate: string;
  privateKey: string;
}> {
  let certificate = config.certificateContent || "";
  let privateKey = config.privateKeyContent || "";

  // Load from file if path is provided
  if (config.certificatePath && !certificate) {
    try {
      const fs = await import("fs/promises");
      certificate = await fs.readFile(config.certificatePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to load certificate from ${config.certificatePath}: ${error}`);
    }
  }

  if (config.privateKeyPath && !privateKey) {
    try {
      const fs = await import("fs/promises");
      privateKey = await fs.readFile(config.privateKeyPath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to load private key from ${config.privateKeyPath}: ${error}`);
    }
  }

  if (!certificate || !privateKey) {
    throw new Error("Certificate and private key content are required");
  }

  return { certificate, privateKey };
}

/**
 * Certificate management utilities
 */
export class ZatcaCertificateManager {
  private config: ZatcaEnvironmentConfig;

  constructor(environment?: "sandbox" | "production") {
    const env =
      environment || (process.env.ZATCA_ENVIRONMENT as "sandbox" | "production") || "sandbox";
    this.config = ZATCA_ENVIRONMENTS[env];
  }

  /**
   * Get current environment
   */
  getEnvironment(): "sandbox" | "production" {
    return this.config.certificates.environment;
  }

  /**
   * Get company information
   */
  getCompanyInfo() {
    return this.config.companyInfo;
  }

  /**
   * Get API URL for current environment
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Load and validate certificates
   */
  async loadCertificates(): Promise<{
    certificate: string;
    privateKey: string;
    isValid: boolean;
    errors: string[];
  }> {
    const validation = validateCertificateConfig(this.config.certificates);

    if (!validation.valid) {
      return {
        certificate: "",
        privateKey: "",
        isValid: false,
        errors: validation.errors,
      };
    }

    try {
      const { certificate, privateKey } = await loadCertificateContent(this.config.certificates);

      return {
        certificate,
        privateKey,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      return {
        certificate: "",
        privateKey: "",
        isValid: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Check if running in sandbox mode
   */
  isSandbox(): boolean {
    return this.config.certificates.environment === "sandbox";
  }

  /**
   * Check if certificates are configured
   */
  areCertificatesConfigured(): boolean {
    const config = this.config.certificates;
    return !!(
      (config.certificatePath || config.certificateContent) &&
      (config.privateKeyPath || config.privateKeyContent)
    );
  }
}

// Default instance
export const zatcaCertificateManager = new ZatcaCertificateManager();

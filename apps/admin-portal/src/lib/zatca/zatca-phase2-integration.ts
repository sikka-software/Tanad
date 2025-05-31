/**
 * ZATCA Phase 2 Integration Service
 * Integrates ZATCA Phase 2 signature, validation, and encoding capabilities
 * into the Tanad invoicing system via API endpoints
 */

// Types for ZATCA Phase 2 operations
export interface ZatcaPhase2Config {
  apiBaseUrl: string;
  timeout: number;
}

export interface ZatcaValidationResult {
  success: boolean;
  validationPassed: boolean;
  message: string;
  details?: string;
}

export interface ZatcaSigningResult {
  success: boolean;
  signedXml?: string;
  message: string;
  details?: string;
}

export interface ZatcaHashResult {
  success: boolean;
  hash?: string;
  message: string;
  details?: string;
}

export interface ZatcaQRResult {
  success: boolean;
  qrCode?: string;
  message: string;
  details?: string;
}

export interface ZatcaProcessingResult {
  success: boolean;
  message: string;
  hash?: string;
  qrCode?: string;
  signedXml?: string;
  validationPassed?: boolean;
  details?: string;
}

/**
 * ZATCA Phase 2 Integration Class
 * Provides methods to validate, sign, and process invoices using ZATCA SDK via API
 */
export class ZatcaPhase2Integration {
  private config: ZatcaPhase2Config;

  constructor(config?: Partial<ZatcaPhase2Config>) {
    this.config = {
      apiBaseUrl: config?.apiBaseUrl || '/api/zatca',
      timeout: config?.timeout || 60000, // 60 seconds
    };
  }

  /**
   * Validates an invoice XML using ZATCA SDK
   */
  async validateInvoice(xmlContent: string): Promise<ZatcaValidationResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        validationPassed: false,
        message: 'Validation error: ' + (error as Error).message,
        details: (error as Error).stack
      };
    }
  }

  /**
   * Generates hash for an invoice XML using ZATCA SDK
   */
  async generateHash(xmlContent: string): Promise<ZatcaHashResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Hash generation error: ' + (error as Error).message,
        details: (error as Error).stack
      };
    }
  }

  /**
   * Signs an invoice XML using ZATCA SDK
   */
  async signInvoice(xmlContent: string): Promise<ZatcaSigningResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Signing error: ' + (error as Error).message,
        details: (error as Error).stack
      };
    }
  }

  /**
   * Generates QR code for a signed invoice XML using ZATCA SDK
   */
  async generateQRCode(signedXmlContent: string): Promise<ZatcaQRResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent: signedXmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'QR generation error: ' + (error as Error).message,
        details: (error as Error).stack
      };
    }
  }

  /**
   * Complete invoice processing workflow (validate -> hash -> sign -> QR)
   */
  async processInvoice(xmlContent: string): Promise<ZatcaProcessingResult> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Processing error: ' + (error as Error).message,
        details: (error as Error).stack
      };
    }
  }

  /**
   * Test XML content directly (for integration testing)
   */
  async testXmlContent(xmlContent: string): Promise<ZatcaProcessingResult> {
    return this.processInvoice(xmlContent);
  }

  /**
   * Check if ZATCA SDK is available and configured
   */
  async checkSDKAvailability(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/status`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        available: false,
        message: `ZATCA SDK not available: ${(error as Error).message}`
      };
    }
  }
}

// Default instance for easy usage
export const zatcaPhase2 = new ZatcaPhase2Integration();

// Utility functions for easy integration
export async function validateZatcaInvoice(xmlContent: string): Promise<ZatcaValidationResult> {
  return zatcaPhase2.validateInvoice(xmlContent);
}

export async function generateZatcaHash(xmlContent: string): Promise<ZatcaHashResult> {
  return zatcaPhase2.generateHash(xmlContent);
}

export async function signZatcaInvoice(xmlContent: string): Promise<ZatcaSigningResult> {
  return zatcaPhase2.signInvoice(xmlContent);
}

export async function generateZatcaQR(signedXmlContent: string): Promise<ZatcaQRResult> {
  return zatcaPhase2.generateQRCode(signedXmlContent);
}

export async function processZatcaInvoice(xmlContent: string): Promise<ZatcaProcessingResult> {
  return zatcaPhase2.processInvoice(xmlContent);
} 
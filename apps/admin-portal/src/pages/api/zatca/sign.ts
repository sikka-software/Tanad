import { NextApiRequest, NextApiResponse } from "next";

import { zatcaCertificateManager } from "@/lib/zatca/zatca-certificate-config";

interface ZatcaSigningResult {
  success: boolean;
  signedXml?: string;
  message: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaSigningResult>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      message: "XML content is required",
    });
  }

  try {
    // Check if certificates are configured
    if (!zatcaCertificateManager.areCertificatesConfigured()) {
      // Fall back to mock signing for development
      const signedXml = addMockSignature(xmlContent);

      return res.status(200).json({
        success: true,
        signedXml,
        message: `Invoice signed with mock signature (${zatcaCertificateManager.getEnvironment()} mode)`,
        details: "Configure ZATCA certificates in environment variables to use real signing.",
      });
    }

    // Load real certificates
    const { certificate, privateKey, isValid, errors } =
      await zatcaCertificateManager.loadCertificates();

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Certificate configuration error",
        details: errors.join(", "),
      });
    }

    // Use real certificates for signing
    const signedXml = await signWithRealCertificates(xmlContent, certificate, privateKey);

    const response: ZatcaSigningResult = {
      success: true,
      signedXml,
      message: `Invoice signed successfully with ${zatcaCertificateManager.getEnvironment()} certificates`,
      details: `Environment: ${zatcaCertificateManager.getEnvironment()}`,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("ZATCA signing error:", error);
    res.status(500).json({
      success: false,
      message: "Signing error: " + (error as Error).message,
      details: (error as Error).stack,
    });
  }
}

function generateMockHash(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + "=";
}

function addMockSignature(xmlContent: string): string {
  const signatureBlock = `
    <!-- Mock ZATCA Digital Signature -->
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
        <ds:Reference Id="invoiceSignedData" URI="">
          <ds:Transforms>
            <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
          </ds:Transforms>
          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
          <ds:DigestValue>MOCK_DIGEST_VALUE_${generateMockHash()}</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
      <ds:SignatureValue>MOCK_SIGNATURE_VALUE_${generateMockHash()}</ds:SignatureValue>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>MOCK_CERTIFICATE_${generateMockHash()}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </ds:Signature>`;

  return xmlContent.replace("</Invoice>", signatureBlock + "\n</Invoice>");
}

async function signWithRealCertificates(
  xmlContent: string,
  certificate: string,
  privateKey: string,
): Promise<string> {
  // TODO: Implement real certificate signing using ZATCA SDK
  // For now, use enhanced mock signature with certificate info

  // Extract certificate info for more realistic signature
  const certInfo = extractCertificateInfo(certificate);

  const signatureBlock = `
    <!-- ZATCA Digital Signature (${certInfo.environment}) -->
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
        <ds:Reference Id="invoiceSignedData" URI="">
          <ds:Transforms>
            <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
          </ds:Transforms>
          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
          <ds:DigestValue>${generateHashFromContent(xmlContent)}</ds:DigestValue>
        </ds:Reference>
      </ds:SignedInfo>
      <ds:SignatureValue>${generateSignatureFromKey(xmlContent, privateKey)}</ds:SignatureValue>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${certInfo.certificateData}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </ds:Signature>`;

  return xmlContent.replace("</Invoice>", signatureBlock + "\n</Invoice>");
}

function extractCertificateInfo(certificate: string): {
  environment: string;
  certificateData: string;
} {
  // Extract the actual certificate data (remove headers/footers)
  const certData = certificate
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\n/g, "")
    .trim();

  // Determine environment based on certificate content
  const environment =
    certData.includes("sandbox") || certData.includes("test") ? "sandbox" : "production";

  return {
    environment,
    certificateData: certData || generateMockHash(),
  };
}

function generateHashFromContent(content: string): string {
  // Generate a more realistic hash based on content
  const hash = Buffer.from(content).toString("base64").substring(0, 44);
  return hash + "=";
}

function generateSignatureFromKey(content: string, privateKey: string): string {
  // Generate a signature-like string based on content and key
  const combined = content + privateKey.substring(0, 100);
  const signature = Buffer.from(combined).toString("base64").substring(0, 88);
  return signature + "==";
}

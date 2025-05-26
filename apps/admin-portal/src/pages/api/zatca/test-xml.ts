import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { xmlContent } = req.body;

    if (!xmlContent) {
      return res.status(400).json({
        success: false,
        message: "XML content is required",
      });
    }

    // Basic XML validation
    const isValidXml =
      xmlContent.includes("<?xml") &&
      xmlContent.includes("<Invoice") &&
      xmlContent.includes("</Invoice>");

    if (!isValidXml) {
      return res.status(400).json({
        success: false,
        message: "Invalid XML format",
      });
    }

    // Check for ZATCA required elements
    const zatcaChecks = {
      hasUBLVersionID: xmlContent.includes("<cbc:UBLVersionID>"),
      hasProfileID: xmlContent.includes("<cbc:ProfileID>"),
      hasInvoiceID: xmlContent.includes("<cbc:ID>"),
      hasUUID: xmlContent.includes("<cbc:UUID>"),
      hasIssueDate: xmlContent.includes("<cbc:IssueDate>"),
      hasInvoiceTypeCode: xmlContent.includes("<cbc:InvoiceTypeCode>"),
      hasDocumentCurrencyCode: xmlContent.includes("<cbc:DocumentCurrencyCode>"),
      hasSupplierParty: xmlContent.includes("<cac:AccountingSupplierParty>"),
      hasCustomerParty: xmlContent.includes("<cac:AccountingCustomerParty>"),
      hasTaxTotal: xmlContent.includes("<cac:TaxTotal>"),
      hasLegalMonetaryTotal: xmlContent.includes("<cac:LegalMonetaryTotal>"),
      hasInvoiceLine: xmlContent.includes("<cac:InvoiceLine>"),
      hasSignature: xmlContent.includes("<ds:Signature"),
      hasQRCode: xmlContent.includes("QR"),
    };

    const passedChecks = Object.values(zatcaChecks).filter(Boolean).length;
    const totalChecks = Object.keys(zatcaChecks).length;

    return res.status(200).json({
      success: true,
      message: `XML validation completed. ${passedChecks}/${totalChecks} ZATCA requirements found.`,
      validationPassed: passedChecks >= 12, // Most requirements should be present
      details: {
        checks: zatcaChecks,
        passedChecks,
        totalChecks,
        xmlLength: xmlContent.length,
        hasPhase2Elements: zatcaChecks.hasSignature && zatcaChecks.hasQRCode,
      },
    });
  } catch (error) {
    console.error("XML validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during validation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

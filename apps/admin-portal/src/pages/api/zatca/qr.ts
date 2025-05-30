import { NextApiRequest, NextApiResponse } from "next";

import { generateZatcaQRString } from "../../../lib/zatca/zatca-utils";

interface ZatcaQRResult {
  success: boolean;
  qrCode?: string;
  message: string;
  details?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ZatcaQRResult>) {
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
    // Extract invoice data from XML
    const invoiceData = extractInvoiceDataFromXml(xmlContent);

    // Generate ZATCA compliant QR code
    const qrCode = generateZatcaQRString(invoiceData);

    const response: ZatcaQRResult = {
      success: true,
      qrCode,
      message: "QR code generated successfully",
      details: "QR code generated using ZATCA TLV encoding standards",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("ZATCA QR generation error:", error);
    res.status(500).json({
      success: false,
      message: "QR generation error: " + (error as Error).message,
      details: (error as Error).stack,
    });
  }
}

function extractInvoiceDataFromXml(xmlContent: string): {
  sellerName: string;
  vatNumber: string;
  invoiceTimestamp: string;
  invoiceTotal: number;
  vatAmount: number;
} {
  // Extract seller name
  const sellerNameMatch = xmlContent.match(/<cbc:RegistrationName>([^<]+)<\/cbc:RegistrationName>/);
  const sellerName = sellerNameMatch ? sellerNameMatch[1] : "Unknown Seller";

  // Extract VAT number
  const vatNumberMatch = xmlContent.match(/<cbc:CompanyID>([^<]+)<\/cbc:CompanyID>/);
  const vatNumber = vatNumberMatch ? vatNumberMatch[1] : "000000000000000";

  // Extract issue date and time
  const dateMatch = xmlContent.match(/<cbc:IssueDate>([^<]+)<\/cbc:IssueDate>/);
  const timeMatch = xmlContent.match(/<cbc:IssueTime>([^<]+)<\/cbc:IssueTime>/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];
  const time = timeMatch ? timeMatch[1] : new Date().toISOString().split("T")[1].split(".")[0];
  const invoiceTimestamp = `${date}T${time}`;

  // Extract total amount
  const totalMatch = xmlContent.match(
    /<cbc:TaxInclusiveAmount[^>]*>([^<]+)<\/cbc:TaxInclusiveAmount>/,
  );
  const invoiceTotal = totalMatch ? parseFloat(totalMatch[1]) : 0;

  // Extract VAT amount
  const vatMatch = xmlContent.match(/<cbc:TaxAmount[^>]*>([^<]+)<\/cbc:TaxAmount>/);
  const vatAmount = vatMatch ? parseFloat(vatMatch[1]) : 0;

  return {
    sellerName,
    vatNumber,
    invoiceTimestamp,
    invoiceTotal,
    vatAmount,
  };
}

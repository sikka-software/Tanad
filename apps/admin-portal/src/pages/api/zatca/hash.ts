import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

interface ZatcaHashResult {
  success: boolean;
  hash?: string;
  message: string;
  details?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ZatcaHashResult>) {
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
    // Generate a realistic hash based on XML content
    const hash = generateXmlHash(xmlContent);

    const response: ZatcaHashResult = {
      success: true,
      hash,
      message: "Hash generated successfully",
      details: "Hash generated using SHA-256 algorithm based on XML content",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("ZATCA hash generation error:", error);
    res.status(500).json({
      success: false,
      message: "Hash generation error: " + (error as Error).message,
      details: (error as Error).stack,
    });
  }
}

function generateXmlHash(xmlContent: string): string {
  // Generate SHA-256 hash of XML content
  const hash = createHash("sha256");
  hash.update(xmlContent, "utf8");
  return hash.digest("base64");
}

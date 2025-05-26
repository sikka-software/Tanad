import { NextApiRequest, NextApiResponse } from 'next';

interface ZatcaQRResult {
  success: boolean;
  qrCode?: string;
  message: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaQRResult>
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
    // Simulate QR code generation
    const qrCode = generateMockQRCode();

    const response: ZatcaQRResult = {
      success: true,
      qrCode,
      message: 'QR code generated successfully (simulated)',
      details: 'Note: This is a simulated QR code. In production, this would use the actual ZATCA SDK.'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('ZATCA QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR generation error: ' + (error as Error).message,
      details: (error as Error).stack
    });
  }
}

function generateMockQRCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < 200; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 
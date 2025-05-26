import { NextApiRequest, NextApiResponse } from 'next';

interface ZatcaHashResult {
  success: boolean;
  hash?: string;
  message: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaHashResult>
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
    // Simulate hash generation
    const hash = generateMockHash();

    const response: ZatcaHashResult = {
      success: true,
      hash,
      message: 'Hash generated successfully (simulated)',
      details: 'Note: This is a simulated hash. In production, this would use the actual ZATCA SDK.'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('ZATCA hash generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Hash generation error: ' + (error as Error).message,
      details: (error as Error).stack
    });
  }
}

function generateMockHash(): string {
  // Generate a mock SHA-256 hash
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '=';
} 
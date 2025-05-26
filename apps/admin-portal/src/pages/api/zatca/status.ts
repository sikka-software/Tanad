import { NextApiRequest, NextApiResponse } from 'next';

interface ZatcaStatusResult {
  available: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaStatusResult>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      available: false,
      message: 'Method not allowed'
    });
  }

  try {
    // For now, we'll simulate the status check
    // In production, this would check if the ZATCA SDK is properly configured
    
    const response: ZatcaStatusResult = {
      available: true,
      message: 'ZATCA SDK is available and configured (simulated)'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('ZATCA status check error:', error);
    res.status(500).json({
      available: false,
      message: 'Status check error: ' + (error as Error).message
    });
  }
} 
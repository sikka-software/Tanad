import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { tmpdir } from 'os';
import path from 'path';

interface ZatcaValidationResult {
  success: boolean;
  validationPassed: boolean;
  message: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaValidationResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      validationPassed: false,
      message: 'Method not allowed'
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      validationPassed: false,
      message: 'XML content is required'
    });
  }

  try {
    // ZATCA SDK configuration
    const sdkJarPath = process.env.ZATCA_SDK_JAR_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar');
    const sdkConfigPath = process.env.ZATCA_SDK_CONFIG_PATH || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Configuration', 'config.json');
    const workingDirectory = process.env.ZATCA_WORKING_DIR || 
      path.join(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox');

    // Create temporary file for XML content
    const tempFile = await createTempFile(xmlContent, 'invoice_validate_', '.xml');
    
    try {
      const result = await executeSDKCommand(
        ['-validate', '-invoice', tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory
      );

      const validationPassed = result.output.includes('GLOBAL VALIDATION RESULT = PASSED');
      
      const response: ZatcaValidationResult = {
        success: result.success,
        validationPassed,
        message: validationPassed ? 'Invoice validation passed' : 'Invoice validation failed',
        details: result.output
      };

      res.status(200).json(response);
    } finally {
      // Clean up temp file
      await cleanupTempFile(tempFile);
    }
  } catch (error) {
    console.error('ZATCA validation error:', error);
    res.status(500).json({
      success: false,
      validationPassed: false,
      message: 'Validation error: ' + (error as Error).message,
      details: (error as Error).stack
    });
  }
}

// Helper functions
async function createTempFile(content: string, prefix: string, suffix: string): Promise<string> {
  const tempDir = tmpdir();
  const fileName = `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}${suffix}`;
  const filePath = path.join(tempDir, fileName);
  
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('Failed to cleanup temp file:', filePath, error);
  }
}

async function executeSDKCommand(
  args: string[],
  sdkJarPath: string,
  sdkConfigPath: string,
  workingDirectory: string
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve, reject) => {
    const command = 'java';
    const fullArgs = ['-jar', sdkJarPath, ...args];
    
    const process = spawn(command, fullArgs, {
      cwd: workingDirectory,
      env: {
        ...process.env,
        SDK_CONFIG: sdkConfigPath
      }
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      const success = code === 0;
      const fullOutput = output + (errorOutput ? '\nErrors:\n' + errorOutput : '');
      
      resolve({
        success,
        output: fullOutput
      });
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to execute ZATCA SDK: ${error.message}`));
    });

    // Set timeout for long-running operations
    setTimeout(() => {
      process.kill();
      reject(new Error('ZATCA SDK operation timed out'));
    }, 60000); // 60 seconds timeout
  });
} 
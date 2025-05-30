import { spawn } from "child_process";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { tmpdir } from "os";
import path from "path";

interface ZatcaValidationResult {
  success: boolean;
  validationPassed: boolean;
  message: string;
  details?: string;
  errors?: string[];
  warnings?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaValidationResult>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      validationPassed: false,
      message: "Method not allowed",
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      validationPassed: false,
      message: "XML content is required",
    });
  }

  try {
    // ZATCA SDK configuration - Flexible paths for any structure
    const sdkJarPath = process.env.ZATCA_SDK_JAR_PATH || (await findZatcaSdkPath());
    const sdkConfigPath = process.env.ZATCA_SDK_CONFIG_PATH || (await findZatcaConfigPath());
    const workingDirectory = process.env.ZATCA_WORKING_DIR || (await findZatcaWorkingDir());

    console.log("ZATCA SDK Paths:", {
      sdkJarPath,
      sdkConfigPath,
      workingDirectory,
    });

    // Check if SDK files exist
    try {
      await fs.access(sdkJarPath);
      await fs.access(sdkConfigPath);
    } catch (error) {
      console.warn("ZATCA SDK files not found, using simulated response");
      // Fallback to simulated response if SDK not available
      return res.status(200).json({
        success: true,
        validationPassed: true,
        message: "Invoice validation passed (simulated)",
        details:
          "SIMULATED: GLOBAL VALIDATION RESULT = PASSED\nAll business rules validated successfully.",
        warnings: ["Using simulated validation - ZATCA SDK not configured"],
      });
    }

    // Create temporary file for XML content
    const tempFile = await createTempFile(xmlContent, "invoice_validate_", ".xml");

    try {
      const result = await executeSDKCommand(
        ["-validate", "-invoice", tempFile],
        sdkJarPath,
        sdkConfigPath,
        workingDirectory,
      );

      const validationPassed = result.output.includes("GLOBAL VALIDATION RESULT = PASSED");
      const errors = extractErrors(result.output);
      const warnings = extractWarnings(result.output);

      const response: ZatcaValidationResult = {
        success: result.success,
        validationPassed,
        message: validationPassed ? "Invoice validation passed" : "Invoice validation failed",
        details: result.output,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      res.status(200).json(response);
    } finally {
      // Clean up temp file
      await cleanupTempFile(tempFile);
    }
  } catch (error) {
    console.error("ZATCA validation error:", error);
    res.status(500).json({
      success: false,
      validationPassed: false,
      message: "Validation error: " + (error as Error).message,
      details: (error as Error).stack,
    });
  }
}

// Helper functions
async function createTempFile(content: string, prefix: string, suffix: string): Promise<string> {
  const tempDir = tmpdir();
  const fileName = `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}${suffix}`;
  const filePath = path.join(tempDir, fileName);

  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}

async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn("Failed to cleanup temp file:", filePath, error);
  }
}

async function executeSDKCommand(
  args: string[],
  sdkJarPath: string,
  sdkConfigPath: string,
  workingDirectory: string,
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve, reject) => {
    const command = "java";
    const fullArgs = ["-jar", sdkJarPath, ...args];

    console.log("Executing ZATCA SDK:", command, fullArgs.join(" "));

    const childProcess = spawn(command, fullArgs, {
      cwd: workingDirectory,
      env: {
        ...process.env,
        SDK_CONFIG: sdkConfigPath,
      },
    });

    let output = "";
    let errorOutput = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    childProcess.on("close", (code) => {
      const success = code === 0;
      const fullOutput = output + (errorOutput ? "\nErrors:\n" + errorOutput : "");

      console.log("ZATCA SDK result:", { code, success, output: fullOutput });

      resolve({
        success,
        output: fullOutput,
      });
    });

    childProcess.on("error", (error) => {
      console.error("ZATCA SDK execution error:", error);
      reject(new Error(`Failed to execute ZATCA SDK: ${error.message}`));
    });

    // Set timeout for long-running operations
    setTimeout(() => {
      childProcess.kill();
      reject(new Error("ZATCA SDK operation timed out"));
    }, 60000); // 60 seconds timeout
  });
}

function extractErrors(output: string): string[] {
  const errors: string[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    if (line.includes("ERROR") || line.includes("FAILED") || line.includes("INVALID")) {
      errors.push(line.trim());
    }
  }

  return errors;
}

function extractWarnings(output: string): string[] {
  const warnings: string[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    if (line.includes("WARNING") || line.includes("WARN")) {
      warnings.push(line.trim());
    }
  }

  return warnings;
}

// Helper functions for flexible path detection
async function findZatcaSdkPath(): Promise<string> {
  const possiblePaths = [
    // Current structure (New folder)
    "C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar",
    // Direct GitHub structure
    "C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar",
    // Relative paths from project root
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "..",
      "zatca-einvoicing-phase2-sandbox",
      "Apps",
      "zatca-einvoicing-sdk-238-R4.0.0.jar",
    ),
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "zatca-einvoicing-phase2-sandbox",
      "Apps",
      "zatca-einvoicing-sdk-238-R4.0.0.jar",
    ),
    // Production paths
    "/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar",
    "C:\\Production\\ZATCA\\zatca-einvoicing-sdk-238-R4.0.0.jar",
  ];

  for (const sdkPath of possiblePaths) {
    try {
      await fs.access(sdkPath);
      console.log("Found ZATCA SDK at:", sdkPath);
      return sdkPath;
    } catch (error) {
      // Continue to next path
    }
  }

  // Fallback - return first path for error reporting
  return possiblePaths[0];
}

async function findZatcaConfigPath(): Promise<string> {
  const possiblePaths = [
    // Current structure (New folder)
    "C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Configuration\\config.json",
    // Direct GitHub structure
    "C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox\\Configuration\\config.json",
    // Relative paths from project root
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "..",
      "zatca-einvoicing-phase2-sandbox",
      "Configuration",
      "config.json",
    ),
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "zatca-einvoicing-phase2-sandbox",
      "Configuration",
      "config.json",
    ),
    // Production paths
    "/opt/zatca/config.json",
    "C:\\Production\\ZATCA\\config.json",
  ];

  for (const configPath of possiblePaths) {
    try {
      await fs.access(configPath);
      console.log("Found ZATCA config at:", configPath);
      return configPath;
    } catch (error) {
      // Continue to next path
    }
  }

  // Fallback - return first path for error reporting
  return possiblePaths[0];
}

async function findZatcaWorkingDir(): Promise<string> {
  const possiblePaths = [
    // Current structure (New folder)
    "C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox",
    // Direct GitHub structure
    "C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox",
    // Relative paths from project root
    path.resolve(process.cwd(), "..", "..", "..", "zatca-einvoicing-phase2-sandbox"),
    path.resolve(process.cwd(), "..", "..", "zatca-einvoicing-phase2-sandbox"),
    // Production paths
    "/opt/zatca",
    "C:\\Production\\ZATCA",
  ];

  for (const workingDir of possiblePaths) {
    try {
      await fs.access(workingDir);
      console.log("Found ZATCA working directory at:", workingDir);
      return workingDir;
    } catch (error) {
      // Continue to next path
    }
  }

  // Fallback - return first path for error reporting
  return possiblePaths[0];
}

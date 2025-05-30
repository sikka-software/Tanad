import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

interface ZatcaStatusResult {
  available: boolean;
  message: string;
  mode: "sandbox" | "local" | "not_configured";
  details: {
    sandboxConfigured: boolean;
    localValidationEnabled: boolean;
    environment: string;
    sdkPaths?: {
      jarPath?: string;
      configPath?: string;
      workingDirectory?: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaStatusResult>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      available: false,
      message: "Method not allowed",
      mode: "not_configured",
      details: {
        sandboxConfigured: false,
        localValidationEnabled: false,
        environment: "unknown",
      },
    });
  }

  try {
    // Check environment configuration
    const requireSandbox = process.env.ZATCA_REQUIRE_SANDBOX === "true";
    const allowLocalValidation = process.env.ZATCA_ALLOW_LOCAL_VALIDATION !== "false";
    const environment = process.env.ZATCA_ENVIRONMENT || "sandbox";

    // Check sandbox configuration
    const sdkJarPath = process.env.ZATCA_SDK_JAR_PATH;
    const sdkConfigPath = process.env.ZATCA_SDK_CONFIG_PATH;
    const workingDirectory = process.env.ZATCA_WORKING_DIR;

    let sandboxConfigured = false;
    if (sdkJarPath && sdkConfigPath && workingDirectory) {
      try {
        await fs.access(sdkJarPath);
        await fs.access(sdkConfigPath);
        await fs.access(workingDirectory);
        sandboxConfigured = true;
      } catch (error) {
        sandboxConfigured = false;
      }
    }

    // Determine mode and availability
    let mode: "sandbox" | "local" | "not_configured";
    let available: boolean;
    let message: string;

    if (sandboxConfigured && !requireSandbox) {
      mode = "sandbox";
      available = true;
      message = "ZATCA Sandbox is available and configured";
    } else if (allowLocalValidation) {
      mode = "local";
      available = true;
      message = "ZATCA Local validation is enabled";
    } else {
      mode = "not_configured";
      available = false;
      message = "ZATCA is not properly configured";
    }

    const response: ZatcaStatusResult = {
      available,
      message,
      mode,
      details: {
        sandboxConfigured,
        localValidationEnabled: allowLocalValidation,
        environment,
        sdkPaths: sandboxConfigured
          ? {
              jarPath: sdkJarPath,
              configPath: sdkConfigPath,
              workingDirectory,
            }
          : undefined,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("ZATCA status check error:", error);
    res.status(500).json({
      available: false,
      message: "Status check error: " + (error as Error).message,
      mode: "not_configured",
      details: {
        sandboxConfigured: false,
        localValidationEnabled: false,
        environment: "unknown",
      },
    });
  }
}

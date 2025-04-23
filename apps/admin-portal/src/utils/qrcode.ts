/**
 * Utilities for QR code generation and display
 */
import QRCode from "qrcode";

/**
 * Creates a QR code image URL from base64 TLV data
 * @param base64Data The base64-encoded TLV data
 * @param size The size of the QR code image
 * @returns A data URL for the QR code image
 */
export function createQRCodeDataURL(base64Data: string, size: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to get canvas 2d context"));
        return;
      }

      // Generate the QR code on the canvas
      QRCode.toCanvas(
        canvas,
        base64Data,
        {
          width: size,
          margin: 2,
          errorCorrectionLevel: "H", // High error correction
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error: Error | null | undefined) => {
          if (error) {
            reject(error);
            return;
          }

          // Convert the canvas to a data URL
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

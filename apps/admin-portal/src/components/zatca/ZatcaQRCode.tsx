import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { generateZatcaQRString } from "@/lib/zatca/zatca-utils";

interface ZatcaQRCodeProps {
  sellerName: string;
  vatNumber: string;
  invoiceTimestamp: string;
  invoiceTotal: number;
  vatAmount: number;
  size?: number;
  className?: string;
}

export function ZatcaQRCode({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatAmount,
  size = 128,
  className,
}: ZatcaQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Generate the TLV-encoded QR code content
      const qrContent = generateZatcaQRString({
        sellerName,
        vatNumber,
        invoiceTimestamp,
        invoiceTotal,
        vatAmount,
      });

      // Generate QR code as data URL using local QRCode library
      QRCode.toDataURL(qrContent, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
      })
        .then((dataUrl: any) => {
          setQrCodeDataUrl(dataUrl);
          setError(null);
        })
        .catch((err: any) => {
          console.error("Error generating QR code:", err);
          setError("Failed to generate QR code");
        });
    } catch (err) {
      console.error("Error generating ZATCA QR code:", err);
      setError("Failed to generate QR code");
    }
  }, [sellerName, vatNumber, invoiceTimestamp, invoiceTotal, vatAmount, size]);

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>
    );
  }

  if (!qrCodeDataUrl) {
    return (
      <div className="animate-pulse rounded-md bg-gray-200" style={{ width: size, height: size }} />
    );
  }

  return (
    <div className={className}>
      <img
        src={qrCodeDataUrl}
        alt="ZATCA QR Code"
        width={size}
        height={size}
        className="rounded-md"
      />
    </div>
  );
}

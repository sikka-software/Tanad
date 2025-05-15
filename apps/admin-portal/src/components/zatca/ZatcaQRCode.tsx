import Image from "next/image";
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
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

      // Generate QR code URL using Google Charts API
      const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(
        qrContent,
      )}&choe=UTF-8`;

      setQrCodeUrl(qrUrl);
      setError(null);
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

  if (!qrCodeUrl) {
    return (
      <div className="animate-pulse rounded-md bg-gray-200" style={{ width: size, height: size }} />
    );
  }

  return (
    <div className={className}>
      <Image
        src={qrCodeUrl}
        alt="ZATCA QR Code"
        width={size}
        height={size}
        className="rounded-md"
      />
    </div>
  );
}

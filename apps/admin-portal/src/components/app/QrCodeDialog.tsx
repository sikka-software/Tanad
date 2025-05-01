import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

import { useBreakpoint } from "@/hooks/use-breakpoint";

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

type QrCodeDialogProps = {
  slug?: string;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
};

export const QrCodeDialog: React.FC<QrCodeDialogProps> = ({
  slug,
  openDialog,
  setOpenDialog,
}) => {
  const t = useTranslations();
  const lang = useLocale();
  const size = useBreakpoint();
  const qrRef = React.useRef<HTMLDivElement>(null);
  const [downloadType, setDownloadType] = React.useState<"svg" | "png">("svg");

  const puklaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

  const downloadQR = () => {
    if (!qrRef.current) return;

    if (downloadType === "svg") {
      // Get the SVG element
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      // Create a clone of the SVG element
      const svgClone = svg.cloneNode(true) as SVGElement;

      // Add required SVG attributes
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgClone.setAttribute("version", "1.1");

      // Create the SVG blob
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Download the SVG
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `pukla-qr-${slug}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else {
      // For PNG, we'll create a canvas from the SVG
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size (double the SVG size for better quality)
      canvas.width = 400;
      canvas.height = 400;

      // Create an image from the SVG
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Fill white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Create download link
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `pukla-qr-${slug}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;
    }
  };

  const DialogComponent = size > 600 ? Dialog : Sheet;
  const DialogContentComponent = size > 600 ? DialogContent : SheetContent;
  const DialogHeaderComponent = size > 600 ? DialogHeader : SheetHeader;
  const DialogTitleComponent = size > 600 ? DialogTitle : SheetTitle;

  return (
    <DialogComponent open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContentComponent
        side={size <= 600 ? "bottom" : undefined}
        className={size <= 600 ? "w-full" : "w-fit"}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeaderComponent className={size <= 600 ? "mb-4" : ""}>
          <DialogTitleComponent>
            {t("General.generate_qr_code")}
          </DialogTitleComponent>
        </DialogHeaderComponent>

        <div className="flex flex-col items-center gap-6 py-0">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={puklaUrl}
              size={200}
              level="H"
              imageSettings={{
                src: "/assets/pukla-logo-symbol-purple.svg",
                x: undefined,
                y: undefined,
                height: 20,
                width: 20,
                excavate: true,
              }}
            />
          </div>

          <div className="flex flex-row items-center gap-2 w-full max-w-[230px]">
            <Select
              value={downloadType}
              onValueChange={(value: "svg" | "png") => setDownloadType(value)}
            >
              <SelectTrigger className="min-w-[80px] w-full">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={downloadQR} variant="default" className="w-full">
              <Download className="h-4 w-4" />
              {t("General.download")}
            </Button>
          </div>
        </div>
      </DialogContentComponent>
    </DialogComponent>
  );
};

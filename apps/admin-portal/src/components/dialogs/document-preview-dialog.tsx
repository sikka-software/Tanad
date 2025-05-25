"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/dialog";
import { useTranslations } from "next-intl";

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  documentUrl: string | null;
  documentName: string | null;
}

export function DocumentPreviewDialog({
  isOpen,
  onOpenChange,
  documentUrl,
  documentName,
}: DocumentPreviewDialogProps) {
  const t = useTranslations("General");

  if (!documentUrl || !documentName) {
    return null;
  }

  // Basic check for image types for direct img tag, otherwise use iframe
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
    documentUrl.toLowerCase().endsWith(ext),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle>{documentName}</DialogTitle>
          <DialogDescription>
            {t("document_preview_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[calc(100%-100px)] overflow-auto py-4">
          {isImage ? (
            <img
              src={documentUrl}
              alt={documentName}
              className="max-h-full max-w-full mx-auto"
            />
          ) : (
            <iframe
              src={documentUrl}
              title={documentName}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
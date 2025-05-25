"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (isOpen && documentUrl) {
      setIsLoading(true);
      setLoadError(false);
    } else if (!isOpen) {
      setIsLoading(true);
      setLoadError(false);
    }
  }, [isOpen, documentUrl]);

  if (!documentUrl || !documentName) {
    return null;
  }

  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
    documentUrl.toLowerCase().endsWith(ext),
  );

  const handleLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle>{documentName}</DialogTitle>
          <DialogDescription>
            {t("document_preview_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[calc(100%-100px)] overflow-auto py-4 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          {!isLoading && loadError && isImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
              <p>{t("document_preview_image_error_title")}</p>
              <p className="text-sm">{t("document_preview_image_error_desc")}</p>
            </div>
          )}
          <div style={{ visibility: isLoading || (loadError && isImage) ? 'hidden' : 'visible', height: '100%', width: '100%' }}>
            {isImage ? (
              <img
                src={documentUrl}
                alt={documentName}
                className="max-h-full max-w-full mx-auto object-contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <iframe
                src={documentUrl}
                title={documentName}
                className="h-full w-full border-0"
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
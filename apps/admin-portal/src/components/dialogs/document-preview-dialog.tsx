"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  documentUrl: string | null;
  documentName: string | null;
  isUrlLoading?: boolean;
}

export function DocumentPreviewDialog({
  isOpen,
  onOpenChange,
  documentUrl,
  documentName,
  isUrlLoading = false,
}: DocumentPreviewDialogProps) {
  const t = useTranslations("General");
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Reset loading state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsContentLoading(true);
      setLoadError(false);
    }
  }, [isOpen]);

  const handleLoad = () => {
    setIsContentLoading(false);
    setLoadError(false);
  };

  const handleError = () => {
    setIsContentLoading(false);
    setLoadError(true);
  };

  const isLoading = isUrlLoading || isContentLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] items-start gap-0 sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw]">
        <div className="relative h-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          {documentUrl && (
            <>
              {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
                  <p>{t("document_preview_image_error_title")}</p>
                  <p className="text-sm">{t("document_preview_image_error_desc")}</p>
                </div>
              )}
              <div
                style={{
                  visibility: loadError ? "hidden" : "visible",
                  height: "100%",
                  width: "100%",
                  display: isLoading ? "none" : "block"
                }}
              >
                {documentUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <img
                    src={documentUrl}
                    alt={documentName || ""}
                    className="w-full mx-auto object-cover"
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                ) : (
                  <iframe
                    src={documentUrl}
                    title={documentName || ""}
                    className="h-full w-full border-0 object-contain"
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

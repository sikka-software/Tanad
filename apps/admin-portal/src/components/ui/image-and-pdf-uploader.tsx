import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import React from "react";

import { useFileUpload, FileWithPreview } from "@/hooks/use-file-upload";

import { Button } from "@/components/ui/button";

export interface ImageAndPdfUploaderProps {
  value: FileWithPreview[];
  onChange: (files: FileWithPreview[]) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageAndPdfUploader({
  value,
  onChange,
  accept = "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,application/pdf",
  maxSizeMB = 2,
  maxFiles = 1,
  disabled = false,
}: ImageAndPdfUploaderProps) {
  const maxSize = maxSizeMB * 1024 * 1024;

  const [state, actions] = useFileUpload({
    accept,
    maxSize,
    maxFiles,
    multiple: maxFiles > 1,
    initialFiles: value.map((f) => {
      // If file is File, create a FileMetadata stub
      if (f.file instanceof File) {
        return {
          name: f.file.name,
          size: f.file.size,
          type: f.file.type,
          url: f.preview || "",
          id: f.id,
        };
      }
      return f.file;
    }),
    onFilesChange: onChange,
  });

  const files = state.files;
  const previewUrl = files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;
  const errors = state.errors;
  const isDragging = state.isDragging;

  React.useEffect(() => {
    // Keep uploader in sync with value prop
    if (value.length !== files.length || value.some((v, i) => v.id !== files[i]?.id)) {
      actions.clearFiles();
      if (value.length > 0) {
        const fileObjs = value
          .map((v) => (v.file instanceof File ? v.file : null))
          .filter((f): f is File => !!f);
        if (fileObjs.length > 0) {
          actions.addFiles(fileObjs);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={actions.handleDragEnter}
          onDragLeave={actions.handleDragLeave}
          onDragOver={actions.handleDragOver}
          onDrop={actions.handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
        >
          <input
            {...actions.getInputProps({ accept, multiple: maxFiles > 1, disabled })}
            className="sr-only"
            aria-label="Upload image or PDF file"
          />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {files[0]?.file.type === "application/pdf" ? (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <span className="text-xs font-medium">PDF Uploaded</span>
                  <span className="text-muted-foreground mt-1 text-xs">{fileName}</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={fileName || "Uploaded image"}
                  className="mx-auto max-h-full rounded object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop your image or PDF here</p>
              <p className="text-muted-foreground text-xs">
                SVG, PNG, JPG, GIF, or PDF (max. {maxSizeMB}MB)
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={actions.openFileDialog}
                disabled={disabled}
              >
                <UploadIcon className="-ms-1 size-4 opacity-60" aria-hidden="true" />
                Select file
              </Button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => actions.removeFile(files[0]?.id)}
              aria-label="Remove file"
              disabled={disabled}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}

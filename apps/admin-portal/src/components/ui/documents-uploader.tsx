"use client";

import { File, Plus, Trash2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { ScrollArea } from "@/ui/scroll-area";

export interface DocumentFile {
  id?: string;
  name: string;
  file: File;
  url?: string;
  entity_id?: string;
  entity_type?: "company" | "expense";
  uploaded?: boolean;
}

interface DocumentUploaderProps {
  entityId?: string;
  entityType: "company" | "expense";
  existingDocuments?: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function DocumentUploader({
  entityId,
  entityType,
  existingDocuments = [],
  onDocumentsChange,
  disabled = false,
  maxFiles = 10,
}: DocumentUploaderProps) {
  const t = useTranslations();
  const [documents, setDocuments] = useState<DocumentFile[]>(existingDocuments);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    if (documents.length + e.target.files.length > maxFiles) {
      toast.error(t("Documents.max_files_error"), {
        description: t("Documents.max_files_description", { count: maxFiles }),
      });
      return;
    }

    const newFiles: DocumentFile[] = Array.from(e.target.files).map((file) => ({
      name: file.name,
      file,
      entity_type: entityType,
      entity_id: entityId,
    }));

    const updatedDocuments = [...documents, ...newFiles];
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const handleNameChange = (index: number, name: string) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].name = name;
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const handleRemoveFile = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{t("Documents.title")}</Label>
        <div className="relative">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={disabled || documents.length >= maxFiles}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || documents.length >= maxFiles}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("Documents.add_document")}
          </Button>
        </div>
      </div>

      {documents.length > 0 ? (
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="space-y-2 p-4">
            {documents.map((doc, index) => (
              <Card key={doc.id || index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <File className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                    <Input
                      value={doc.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="h-8 flex-1"
                      placeholder={t("Documents.document_name")}
                      disabled={disabled || doc.uploaded}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleRemoveFile(index)}
                      disabled={disabled || doc.uploaded}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed">
          <Upload className="text-muted-foreground mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">{t("Documents.no_documents")}</p>
          <p className="text-muted-foreground mt-1 text-xs">{t("Documents.drag_or_click")}</p>
        </div>
      )}
    </div>
  );
}

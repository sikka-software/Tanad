import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { toast } from "sonner";

import { FileWithPreview } from "@/hooks/use-file-upload";

import { ImageAndPdfUploader } from "@/components/ui/image-and-pdf-uploader";

import { useCreateDocument, useUpdateDocument } from "@/document/document.hooks";
import { uploadDocument as uploadDocumentService } from "@/document/document.service";
import useDocumentStore from "@/document/document.store";
import { Document as DocumentType } from "@/document/document.type";

import useUserStore from "@/stores/use-user-store";

import FormSectionHeader from "./form-section-header";

type DocumentEntityType =
  | "document"
  | "company"
  | "expense"
  | "salary"
  | "department"
  | "employee"
  | "invoice"
  | "quote"
  | "vendor"
  | "warehouse"
  | "branch"
  | "office"
  | undefined;

interface DocumentFile {
  id?: string;
  file: File;
  name: string;
  url?: string;
  uploaded?: boolean;
  entity_type?: DocumentEntityType;
  entity_id?: string;
}

interface DocumentsFormSectionProps {
  control: Control<any>;
  disabled?: boolean;
  title: string;
  inDialog?: boolean;
  entityType: DocumentEntityType;
  entityId?: string;
}

export function DocumentsFormSection({
  control,
  disabled = false,
  title,
  inDialog = false,
  entityType,
  entityId,
}: DocumentsFormSectionProps) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: updateDocument } = useUpdateDocument();
  const setData = useDocumentStore((state) => state.setData);
  const data = useDocumentStore((state) => state.data);

  const [uploadedDocuments, setUploadedDocuments] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentsChange = async (files: FileWithPreview[]) => {
    if (!user?.id || !enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    setIsUploading(true);
    setUploadedDocuments(files);

    try {
      for (const uploadedDocument of files) {
        if (!uploadedDocument.file || !(uploadedDocument.file instanceof File)) {
          toast.error(t("Documents.error.invalid_file_object"));
          continue;
        }

        const documentToUpload: DocumentFile = {
          file: uploadedDocument.file,
          name: uploadedDocument.file.name,
          entity_type: entityType,
          entity_id: entityId || enterprise?.id,
        };

        const createdDocumentData = await uploadDocumentService(documentToUpload, enterprise);

        if (createdDocumentData?.id) {
          setData?.([createdDocumentData, ...(data || [])]);

          await updateDocument(
            {
              id: createdDocumentData.id,
              data: {
                name: uploadedDocument.file.name,
                description: null,
                notes: null,
                user_id: user.id,
                enterprise_id: enterprise.id,
                file_path: createdDocumentData.file_path,
                entity_id: entityId || enterprise.id,
                entity_type: entityType || "document",
                status: "active",
              },
            },
            {
              onError: () => {
                toast.error(t("Documents.error.update_description_failed"));
              },
            },
          );
        }
      }
    } catch (error) {
      console.error("Failed to save documents:", error);
      toast.error(t("General.error_operation"), {
        description: t("General.error_operation_description"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <FormSectionHeader inDialog={inDialog} title={title} />
      <div className="mx-auto max-w-2xl p-4">
        <ImageAndPdfUploader
          value={uploadedDocuments}
          onChange={handleDocumentsChange}
          maxFiles={5}
          maxSizeMB={10}
          accept="application/pdf,image/png,image/jpeg"
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}

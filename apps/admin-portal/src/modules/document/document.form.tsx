import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/inputs/input";
import { Textarea } from "@/ui/textarea";

import { ImageAndPdfUploader } from "@/components/comp-545";
import { FileWithPreview, FileMetadata } from "@/hooks/use-file-upload";

import { uploadDocument as uploadDocumentService } from "@/document/document.service";
import { Database } from "@/lib/database.types";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateDocument, useUpdateDocument } from "@/document/document.hooks";
import useDocumentStore from "@/document/document.store";
import { DocumentUpdateData, DocumentCreateData, Document as DocumentType } from "@/document/document.type";

import { documents } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

// Define a specific EntityType for documents, matching the service expectation
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
  entity_type?: DocumentEntityType; // Use the more specific type
  entity_id?: string;
}

const createDocumentSchema = (t: (key: string) => string) => {
  const DocumentSelectSchema = createInsertSchema(documents, {
    name: z.string().min(1, t("Documents.form.name.required")),
    description: z.string().optional(),
  }).pick({ name: true, description: true });
  return DocumentSelectSchema;
};

export type DocumentFormValues = z.input<ReturnType<typeof createDocumentSchema>>;

export interface DocumentFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: DocumentUpdateData | null;
  editMode?: boolean;
}

export function DocumentForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<DocumentUpdateData | DocumentCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: updateDocument } = useUpdateDocument();

  const isSavingDocument = useDocumentStore((state) => state.isLoading);
  const setIsSavingDocument = useDocumentStore((state) => state.setIsLoading);

  const [uploadedDocument, setUploadedDocument] = useState<FileWithPreview | null>(() => {
    if (editMode && defaultValues && 'id' in defaultValues && defaultValues.id && defaultValues.url && defaultValues.name) {
      const dv = defaultValues as DocumentType;
      return {
        id: dv.id,
        preview: dv.url || undefined,
        file: {
          id: dv.id,
          name: dv.name,
          url: dv.url || "",
          size: (dv as any).size || 0,
          type: (dv as any).mime_type || "application/octet-stream",
        } as FileMetadata,
      };
    }
    return null;
  });
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(createDocumentSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  const handleDocumentsChange = (files: FileWithPreview[]) => {
    setUploadedDocument(files.length > 0 ? files[0] : null);
  };

  const handleSubmit = async (formData: DocumentFormValues) => {
    setIsSavingDocument(true);

    if (!user?.id || !enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsSavingDocument(false);
      return;
    }

    try {
      if (editMode && defaultValues?.id) {
        const payload = {
          ...(defaultValues as DocumentUpdateData),
          name: formData.name.trim(),
          description: formData.description?.trim() ?? null,
          notes: null,
        } as DocumentUpdateData;

        await updateDocument(
          {
            id: defaultValues.id,
            data: payload,
          },
          {
            onSuccess: () => {
              setIsSavingDocument(false);
              if (onSuccess) onSuccess();
            },
            onError: () => setIsSavingDocument(false),
          },
        );
      } else {
        if (!uploadedDocument || !uploadedDocument.file) {
          toast.error(t("Documents.error.file_required"));
          setIsSavingDocument(false);
          return;
        }
        if (!(uploadedDocument.file instanceof File)) {
            toast.error(t("Documents.error.invalid_file_object"));
            setIsSavingDocument(false);
            return;
        }

        setIsUploading(true);
        const documentToUpload: DocumentFile = {
          file: uploadedDocument.file,
          name: formData.name.trim() || uploadedDocument.file.name,
          entity_type: "document" as DocumentEntityType, // Cast to the specific DocumentEntityType
          entity_id: enterprise?.id,
        };

        const createdDocumentData = await uploadDocumentService(documentToUpload, enterprise);
        setIsUploading(false);

        if (createdDocumentData?.id) {
          const prevDocs = useDocumentStore.getState().data || [];
          useDocumentStore.getState().setData!([createdDocumentData, ...prevDocs]);

          await updateDocument(
            {
              id: createdDocumentData.id,
              data: { description: formData.description?.trim() ?? null, notes: null } as DocumentUpdateData,
            },
            {
              onSuccess: () => {
                setIsSavingDocument(false);
                if (onSuccess) onSuccess();
              },
              onError: () => {
                toast.error(t("Documents.error.update_description_failed"));
              },
            },
          );
        }
        setIsSavingDocument(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      setIsSavingDocument(false);
      setIsUploading(false);
      console.error("Failed to save document:", error);
      toast.error(t("General.error_operation"), {
        description: t("Documents.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).documentForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form
          id={formHtmlId || "document-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <div className="form-container space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Documents.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Documents.form.name.placeholder")}
                      {...field}
                      disabled={isSavingDocument || isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Documents.form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Documents.form.description.placeholder")}
                      {...field}
                      disabled={isSavingDocument || isUploading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ImageAndPdfUploader
              value={uploadedDocument ? [uploadedDocument] : []}
              onChange={handleDocumentsChange}
              accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,application/pdf"
              maxSizeMB={2}
              maxFiles={1}
              disabled={isSavingDocument || isUploading || (editMode && !!uploadedDocument)}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/inputs/input";

import NotesSection from "@/components/forms/notes-section";
import { DocumentUploader, DocumentFile } from "@/components/ui/documents-uploader";

import { uploadDocument as uploadDocumentService } from "@/services/documents";

// Assuming this is the correct path

import { ModuleFormProps } from "@/types/common.type";

import { useCreateDocument, useUpdateDocument } from "@/document/document.hooks";
import useDocumentStore from "@/document/document.store";
import { DocumentUpdateData, DocumentCreateData } from "@/document/document.type";

import { documents } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createDocumentSchema = (t: (key: string) => string) => {
  const DocumentSelectSchema = createInsertSchema(documents, {
    name: z.string().min(1, t("Documents.form.name.required")),
    notes: z.any().optional().nullable(),
  }).pick({ name: true, notes: true }); // Only pick name and notes
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

  const [uploadedDocument, setUploadedDocument] = useState<DocumentFile | null>(
    defaultValues?.url && defaultValues?.file_path
      ? {
          name: defaultValues.name || "document",
          file: new File([], defaultValues.file_path), // Placeholder, actual file not editable this way
          url: defaultValues.url,
          uploaded: true,
        }
      : null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(createDocumentSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      notes:
        defaultValues?.notes &&
        typeof defaultValues.notes === "object" &&
        "root" in defaultValues.notes
          ? defaultValues.notes
          : null,
    },
  });

  const handleDocumentsChange = (docs: DocumentFile[]) => {
    setUploadedDocument(docs.length > 0 ? docs[0] : null);
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
        // Editing existing document: only name and notes can be changed.
        // Ensure all required fields for DocumentUpdateData are present if it's strict,
        // otherwise, this assumes backend handles partial update with just name/notes.
        const payload = {
          ...(defaultValues as DocumentUpdateData), // Spread defaultValues to satisfy strict type
          name: formData.name.trim(),
          notes: formData.notes ?? null,
          // Ensure other required fields from DocumentUpdateData are maintained if not optional
          // For example, if url, file_path, entity_id, entity_type, user_id, enterprise_id are non-optional in DocumentUpdateData
          // they must be here. DefaultValues should provide them.
        } as DocumentUpdateData; // Explicit cast after ensuring structure matches

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
        // Creating new document
        if (!uploadedDocument || !uploadedDocument.file) {
          toast.error(t("Documents.error.file_required")); // TODO: Add translation
          setIsSavingDocument(false);
          return;
        }
        setIsUploading(true);
        const documentToUpload: DocumentFile = {
          file: uploadedDocument.file,
          name: formData.name.trim() || uploadedDocument.file.name,
          entity_type: "document",
          entity_id: enterprise.id, // uploadDocumentService uses this for the document's own entity_id if it's a top-level doc
        };

        const createdDocumentData = await uploadDocumentService(documentToUpload);
        setIsUploading(false);

        // uploadDocumentService created the doc with name, url, file_path.
        // Now, if there are notes, update the created document with notes.
        if (formData.notes && createdDocumentData?.id) {
          await updateDocument(
            {
              id: createdDocumentData.id,
              data: { notes: formData.notes } as DocumentUpdateData, // Only update notes
            },
            {
              onSuccess: () => {
                // This is a nested success, main success is below
              },
              onError: () => {
                toast.error(t("Documents.error.update_notes_failed")); // TODO: Add translation
                // Continue to main success/failure flow, notes update is best-effort here
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
        description: t("Documents.error.create"), // Or a more generic save error
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).documentForm = form;
  }

  const existingDocsForUploader: DocumentFile[] = [];
  if (editMode && defaultValues?.url && defaultValues?.name) {
    existingDocsForUploader.push({
      id: defaultValues.id,
      name: defaultValues.name,
      file: new File([], defaultValues.file_path || defaultValues.name), // Placeholder
      url: defaultValues.url,
      entity_type: "document",
      uploaded: true,
    });
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
          {/* Hidden fields for user_id and enterprise_id are not strictly needed if always sourced from store */}
          {/* <input hidden type="text" value={user?.id} {...form.register("user_id")} /> */}
          {/* <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} /> */}
          <div className="form-container">
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

            <DocumentUploader
              entityType="document"
              entityId={defaultValues?.id || enterprise?.id} // Context for the uploader, added optional chaining for enterprise
              onDocumentsChange={handleDocumentsChange}
              existingDocuments={existingDocsForUploader}
              disabled={isSavingDocument || isUploading || editMode} // Disable uploader in edit mode
              maxFiles={1}
            />
          </div>
          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Documents.form.notes.label")} // Assuming notes becomes description
          />
        </form>
      </Form>
    </div>
  );
}

import { Link, MapPin, User } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";
import { DocumentPreviewDialog } from "@/components/dialogs/document-preview-dialog";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateDocument } from "@/document/document.hooks";
import { useDocumentStore, useUrlCacheStore } from "@/document/document.store";
import { Document, DocumentUpdateData } from "@/document/document.type";

const DocumentCard = ({
  document,
  onActionClicked,
}: {
  document: Document;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateDocument } = useUpdateDocument();
  const data = useDocumentStore((state) => state.data);
  const setData = useDocumentStore((state) => state.setData);
  const cacheUrl = useUrlCacheStore((state) => state.cacheUrl);
  const getCachedUrl = useUrlCacheStore((state) => state.getCachedUrl);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const handleEdit = createHandleEdit<Document, DocumentUpdateData>(setData, updateDocument, data);

  const fetchSignedUrl = useCallback(async () => {
    if (!document.id) return null;

    try {
      const response = await fetch(`/api/documents/get-signed-url?documentId=${document.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch signed URL: ${response.statusText}`);
      }
      const { signedUrl, expiresIn } = await response.json();

      if (signedUrl) {
        cacheUrl(document.id, signedUrl, expiresIn);
        return signedUrl;
      }
      return null;
    } catch (error) {
      console.error("Error fetching signed URL for preview:", error);
      toast.error(t("Documents.error.preview_load_failed_detailed", { error: (error as Error).message }));
      return null;
    }
  }, [document.id, t, cacheUrl]);

  useEffect(() => {
    if (isPreviewOpen && !documentUrl) {
      const loadUrl = async () => {
        setIsLoading(true);
        const cachedUrl = getCachedUrl(document.id);
        if (cachedUrl) {
          setDocumentUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        const newUrl = await fetchSignedUrl();
        if (newUrl) {
          setDocumentUrl(newUrl);
        } else {
          setIsPreviewOpen(false);
          toast.error(t("Documents.error.preview_load_failed"));
        }
        setIsLoading(false);
      };

      loadUrl();
    }
  }, [isPreviewOpen, documentUrl, document.id, getCachedUrl, fetchSignedUrl, t]);

  const handlePreview = () => {
    if (!document.id || !document.name) {
      console.warn("Document ID or name is missing for preview.");
      toast.error(t("Documents.error.preview_load_failed"));
      return;
    }

    const cachedUrl = getCachedUrl(document.id);
    setDocumentUrl(cachedUrl);
    setIsPreviewOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) {
      setDocumentUrl(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      <ModuleCard
        id={document.id}
        title={document.name}
        currentStatus={document.status as CommonStatusProps}
        statuses={Object.values(CommonStatus) as CommonStatusProps[]}
        onStatusChange={(status: CommonStatusProps) => handleEdit(document.id, "status", status)}
        onEdit={() => onActionClicked("edit", document.id)}
        onDelete={() => onActionClicked("delete", document.id)}
        onDuplicate={() => onActionClicked("duplicate", document.id)}
        onPreview={handlePreview}
      >
        <div className="space-y-3">
          {document.user_id && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{document.user_id}</span>
            </div>
          )}
          {/* {document.url && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link className="h-4 w-4" />
              <a href={document.url} target="_blank" rel="noopener noreferrer" className="underline">
                Link
              </a>
            </div>
          )} */}

          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{document.file_path}</p>
              {/* Displaying entity_id and entity_type might be for debugging, consider if needed for end-user */}
              <p className="text-xs text-gray-500">{`${document.entity_id || 'N/A'}, ${document.entity_type || 'N/A'}`}</p>
            </div>
          </div>
        </div>
      </ModuleCard>
      <DocumentPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={handleOpenChange}
        documentUrl={documentUrl}
        documentName={document.name}
        isUrlLoading={isLoading}
      />
    </>
  );
};

export default DocumentCard;

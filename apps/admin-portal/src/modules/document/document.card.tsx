import { MapPin, User } from "lucide-react";
import { useState } from "react";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";
import { DocumentPreviewDialog } from "@/components/dialogs/document-preview-dialog";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateDocument } from "@/document/document.hooks";
import useDocumentStore from "@/document/document.store";
import { Document, DocumentUpdateData } from "@/document/document.type";

const DocumentCard = ({
  document,
  onActionClicked,
}: {
  document: Document;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateDocument } = useUpdateDocument();
  const data = useDocumentStore((state) => state.data);
  const setData = useDocumentStore((state) => state.setData);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const handleEdit = createHandleEdit<Document, DocumentUpdateData>(setData, updateDocument, data);

  const handlePreview = () => {
    if (document.url && document.name) {
      setPreviewUrl(document.url);
      setPreviewName(document.name);
      setIsPreviewOpen(true);
    } else {
      console.warn("Document URL or name is missing for preview.");
    }
  };

  return (
    <>
      <ModuleCard
        id={document.id}
        title={document.name}
        subtitle={document.url || ""}
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

          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{document.file_path}</p>
              <p>{`${document.entity_id}, ${document.entity_type}`}</p>
            </div>
          </div>
        </div>
      </ModuleCard>
      <DocumentPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        documentUrl={previewUrl}
        documentName={previewName}
      />
    </>
  );
};

export default DocumentCard;

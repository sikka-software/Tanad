import { useState } from "react";

import { Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TemplateViewerProps {
  templateId: string;
  pdfUrl: string;
  onEdit?: (templateId: string) => void;
}

export default function TemplateViewer({ templateId, pdfUrl, onEdit }: TemplateViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(templateId);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        View PDF
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[80vh] max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Template Preview</span>
              <Button variant="outline" size="icon" onClick={handleEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="h-full min-h-[60vh] w-full flex-1">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
              className="h-full w-full rounded-lg border"
              title="PDF Viewer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

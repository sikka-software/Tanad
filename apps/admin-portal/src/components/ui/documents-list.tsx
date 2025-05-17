"use client";

import { format } from "date-fns";
import { File, Download, ExternalLink, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/dialogs/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { deleteDocument, getDocumentsByEntity } from "@/services/documents";

interface DocumentListProps {
  entityId?: string;
  entityType: "company" | "expense";
}

export function DocumentList({ entityId, entityType }: DocumentListProps) {
  const t = useTranslations();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (entityId) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [entityId]);

  const fetchDocuments = async () => {
    if (!entityId) return;

    try {
      setLoading(true);
      const docs = await getDocumentsByEntity(entityId, entityType);
      setDocuments(docs);
    } catch (error) {
      // TODO: only when editing a entity that has documents
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete);
      setDocuments(documents.filter((doc) => doc.id !== documentToDelete));
      toast.success(t("Documents.delete_success"));
    } catch (error) {
      toast.error(t("Documents.delete_error"));
      console.error("Error deleting document:", error);
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground text-sm">{t("General.loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <File className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">{t("Documents.no_documents")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Documents.name")}</TableHead>
                <TableHead>{t("Documents.uploaded_on")}</TableHead>
                <TableHead className="text-right">{t("Documents.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(doc.created_at), "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <a href={doc.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Documents.confirm_delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("Documents.delete_warning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("General.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t("General.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

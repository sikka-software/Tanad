import { Document, DocumentCreateData, DocumentUpdateData } from "./document.type";
import { DocumentFile } from "@/ui/documents-uploader";
import { createClient } from "@/utils/supabase/component";

const supabase = createClient();

interface EnterpriseInfo {
  id?: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("/api/resource/documents");
    if (!response.ok) {
      console.error("Failed to fetch documents:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function fetchDocumentById(id: string): Promise<Document> {
  const response = await fetch(`/api/resource/documents/${id}`);
  if (!response.ok) {
    throw new Error(`Document with id ${id} not found`);
  }
  return response.json();
}

export async function createDocument(document: DocumentCreateData): Promise<Document> {
  const response = await fetch("/api/resource/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error("Failed to create document");
  }

  return response.json();
}

export async function updateDocument(id: string, document: DocumentUpdateData): Promise<Document> {
  const response = await fetch(`/api/resource/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Failed to update document with id ${id}`);
  }

  return response.json();
}

export async function duplicateDocument(id: string): Promise<Document> {
  const response = await fetch(`/api/resource/documents/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate document");
  }

  return response.json();
}

export async function uploadDocument(document: DocumentFile, enterprise: EnterpriseInfo | null | undefined) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user?.id) {
    throw userError || new Error("Could not get user");
  }

  const user_id = userData.user.id;
  if (!document.file || !document.entity_id || !document.entity_type) {
    throw new Error("Missing required document information");
  }

  const fileExt = document.file.name.split(".").pop();
  const fileName = `${document.entity_type}/${document.entity_id}/${Date.now()}-${document.name}.${fileExt}`;

  // Upload file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from("enterprise-documents")
    .upload(fileName, document.file);

  if (storageError) {
    throw storageError;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("enterprise-documents")
    .getPublicUrl(fileName);

  // Insert document record in the database
  const { data: documentData, error: documentError } = await supabase
    .from("documents")
    .insert({
      name: document.name,
      url: publicUrlData.publicUrl,
      entity_id: document.entity_id,
      entity_type: document.entity_type,
      file_path: fileName,
      user_id: user_id,
      enterprise_id: enterprise?.id || "",
    })
    .select()
    .single();

  if (documentError) {
    throw documentError;
  }

  return documentData;
}

export async function getDocumentsByEntity(entityId: string, entityType: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("entity_id", entityId)
    .eq("entity_type", entityType);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteDocument(documentId: string) {
  // Get document info first
  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("enterprise-documents")
    .remove([document.file_path]);

  if (storageError) {
    throw storageError;
  }

  // Delete from database
  const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId);

  if (deleteError) {
    throw deleteError;
  }
}

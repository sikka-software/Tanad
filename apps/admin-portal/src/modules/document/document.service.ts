import { Document, DocumentCreateData, DocumentUpdateData } from "@/document/document.type";

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

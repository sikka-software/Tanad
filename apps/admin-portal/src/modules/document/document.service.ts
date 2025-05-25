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
  const document = await response.json();

  // Generate signed URL if file_path exists
  if (document.file_path) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("enterprise-documents")
      .createSignedUrl(document.file_path, 3600); // Expires in 1 hour

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      // Handle error, perhaps return a document with a null URL or throw
    } else {
      document.url = signedUrlData?.signedUrl;
    }
  }

  return document;
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

  const fileExt = document.file.name.split(".").pop() || "bin";
  
  // Sanitize the document name for the file path
  let originalNameWithoutExtension = document.name.includes('.') 
    ? document.name.substring(0, document.name.lastIndexOf('.'))
    : document.name;

  let safeDocumentName = originalNameWithoutExtension
    .trim() // Trim whitespace from beginning and end
    .replace(/\s+/g, "-") // Replace internal spaces with hyphens
    .replace(/[^a-zA-Z0-9\-]/g, ""); // Remove characters not alphanumeric or hyphen

  // If safeDocumentName is empty or just hyphens after sanitization, use a default name
  if (!safeDocumentName.replace(/-/g, "")) { 
    safeDocumentName = "document";
  }
  // Ensure name is not too long (optional, but good practice for some storage systems)
  safeDocumentName = safeDocumentName.substring(0, 100); // Max 100 chars for the name part

  const fileName = `${document.entity_type}/${document.entity_id}/${Date.now()}-${safeDocumentName}.${fileExt}`;

  // Upload file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from("enterprise-documents")
    .upload(fileName, document.file);

  if (storageError) {
    throw storageError;
  }

  // Create signed URL for the uploaded file
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("enterprise-documents")
    .createSignedUrl(fileName, 3600); // Expires in 1 hour

  if (signedUrlError) {
    console.error("Error creating signed URL:", signedUrlError);
    // Decide how to handle this error. Maybe throw, or proceed without a URL.
    // For now, let's throw an error.
    throw new Error("Failed to create a signed URL for the document.");
  }

  // Insert document record in the database
  const { data: dbDocumentData, error: documentError } = await supabase
    .from("documents")
    .insert({
      name: document.name,
      url: "", // Set URL to an empty string to satisfy type checking & DB schema
      entity_id: document.entity_id,
      entity_type: document.entity_type,
      file_path: fileName, // Storing the file_path is crucial
      user_id: user_id,
      enterprise_id: enterprise?.id || "",
    })
    .select()
    .single();

  if (documentError) {
    throw documentError;
  }

  if (!dbDocumentData) {
    throw new Error("Failed to create document record or retrieve it after creation.");
  }

  // Generate a signed URL for the newly created document to be returned to the client
  let finalUrl = null;
  // dbDocumentData.file_path should be the same as fileName which is known to be valid if we reached here
  if (dbDocumentData.file_path) {
    const { data: newSignedUrlData, error: newSignedUrlError } = await supabase.storage
      .from("enterprise-documents")
      .createSignedUrl(dbDocumentData.file_path, 3600); // Expires in 1 hour

    if (newSignedUrlError) {
      console.error("Error creating signed URL for the new document object:", newSignedUrlError);
      // If creating signed URL fails here, we might return the document with an empty/null URL
      // or the initially generated (but not stored) signedUrlData.signedUrl if requirements allow.
      // For now, we'll use the signedUrlData from before the insert as a fallback,
      // though ideally, we rely on the one generated from file_path post-insert.
      finalUrl = signedUrlData.signedUrl; // Fallback, consider logging this state
    } else {
      finalUrl = newSignedUrlData?.signedUrl;
    }
  } else {
    // Fallback if file_path was unexpectedly missing from dbDocumentData
     finalUrl = signedUrlData.signedUrl;
     console.warn("file_path was missing from the document record immediately after creation. Using pre-insert signed URL.");
  }
  

  return { ...dbDocumentData, url: finalUrl };
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

  // Generate signed URLs for each document
  const documentsWithSignedUrls = await Promise.all(
    (data || []).map(async (doc) => {
      if (doc.file_path) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("enterprise-documents")
          .createSignedUrl(doc.file_path, 3600); // Expires in 1 hour

        if (signedUrlError) {
          console.error("Error creating signed URL for", doc.file_path, ":", signedUrlError);
          return { ...doc, url: null }; // Handle error, return doc with null URL
        }
        return { ...doc, url: signedUrlData?.signedUrl };
      }
      return { ...doc, url: null }; // If no file_path, URL is null
    })
  );

  return documentsWithSignedUrls as Document[];
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

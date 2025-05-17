import { DocumentFile } from "@/ui/documents-uploader";

import { createClient } from "@/utils/supabase/component";

const supabase = createClient();

export async function uploadDocument(document: DocumentFile) {
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
      enterprise_id: enterprise_id,
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

import { supabase } from "@/lib/supabase";
import { Client, ClientCreateData } from "@/types/client.type";

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }

  return data || [];
}

export async function fetchClientById(id: string): Promise<Client> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching client with id ${id}:`, error);
    throw new Error(`Failed to fetch client with id ${id}`);
  }

  return data;
}

export async function createClient(client: ClientCreateData) {
  const dbClient = { ...client };
  // Handle userId to user_id conversion if needed
  if (client.userId) {
    (dbClient as any).user_id = client.userId;
    delete (dbClient as any).userId;
  }

  const { data, error } = await supabase.from("clients").insert([dbClient]).select().single();

  if (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to create client");
  }

  return data;
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data, error } = await supabase
    .from("clients")
    .update(client)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating client with id ${id}:`, error);
    throw new Error(`Failed to update client with id ${id}`);
  }

  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting client with id ${id}:`, error);
    throw new Error(`Failed to delete client with id ${id}`);
  }
}

import { Client, ClientCreateData, ClientUpdateData } from "@/client/client.type";

export async function fetchClients(): Promise<Client[]> {
  try {
    const response = await fetch("/api/resource/clients");
    if (!response.ok) {
      console.error("Failed to fetch clients:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function fetchClientById(id: string): Promise<Client> {
  const response = await fetch(`/api/resource/clients/${id}`);
  if (!response.ok) {
    throw new Error(`Client with id ${id} not found`);
  }
  return response.json();
}

export async function createClient(client: ClientCreateData): Promise<Client> {
  const response = await fetch("/api/resource/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    throw new Error("Failed to create client");
  }

  return response.json();
}

export async function updateClient(id: string, client: ClientUpdateData): Promise<Client> {
  const response = await fetch(`/api/resource/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    throw new Error(`Failed to update client with id ${id}`);
  }

  return response.json();
}

export async function duplicateClient(id: string): Promise<Client> {
  const response = await fetch(`/api/resource/clients/${id}/duplicate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to duplicate client with id ${id}`);
  }

  return response.json();
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/resource/clients/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete client with id ${id}`);
  }
}

export async function bulkDeleteClients(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/clients", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete clients");
  }
}

import { Client, ClientCreateData } from "@/modules/client/client.type";

export async function fetchClients(): Promise<Client[]> {
  try {
    const response = await fetch("/api/clients");
    if (!response.ok) {
      throw new Error("Failed to fetch clients");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
}

export async function fetchClientById(id: string): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`);
  if (!response.ok) {
    throw new Error(`Client with id ${id} not found`);
  }
  return response.json();
}

export async function createClient(client: ClientCreateData) {
  const response = await fetch("/api/clients", {
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

export async function updateClient(id: string, client: Partial<Client>) {
  const response = await fetch(`/api/clients/${id}`, {
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

export async function deleteClient(id: string) {
  const response = await fetch(`/api/clients/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete client with id ${id}`);
  }
}

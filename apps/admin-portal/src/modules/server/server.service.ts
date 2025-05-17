import { Server, ServerCreateData, ServerUpdateData } from "@/server/server.type";

export async function fetchServers(): Promise<Server[]> {
  try {
    const response = await fetch("/api/resource/servers");
    if (!response.ok) {
      console.error("Failed to fetch servers:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching servers:", error);
    return [];
  }
}

export async function fetchServerById(id: string): Promise<Server> {
  const response = await fetch(`/api/resource/servers/${id}`);
  if (!response.ok) {
    throw new Error(`Server with id ${id} not found`);
  }
  return response.json();
}

export async function createServer(server: ServerCreateData): Promise<Server> {
  const response = await fetch("/api/resource/servers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(server),
  });

  if (!response.ok) {
    throw new Error("Failed to create server");
  }

  return response.json();
}

export async function updateServer(id: string, server: ServerUpdateData): Promise<Server> {
  const response = await fetch(`/api/resource/servers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(server),
  });

  if (!response.ok) {
    throw new Error(`Failed to update server with id ${id}`);
  }

  return response.json();
}

export async function duplicateServer(id: string): Promise<Server> {
  const response = await fetch(`/api/resource/servers/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate server");
  }

  return response.json();
}

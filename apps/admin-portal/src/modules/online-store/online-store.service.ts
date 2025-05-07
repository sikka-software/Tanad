import { OnlineStore, OnlineStoreCreateData, OnlineStoreUpdateData } from "./online-store.type";

export async function fetchOnlineStores(): Promise<OnlineStore[]> {
  try {
    const response = await fetch("/api/resource/online_stores");
    if (!response.ok) {
      console.error("Failed to fetch online stores:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching online stores:", error);
    return [];
  }
}

export async function fetchOnlineStoreById(id: string): Promise<OnlineStore> {
  const response = await fetch(`/api/resource/online_stores/${id}`);
  if (!response.ok) {
    throw new Error(`Online store with id ${id} not found`);
  }
  return response.json();
}

export async function createOnlineStore(onlineStore: OnlineStoreCreateData): Promise<OnlineStore> {
  const response = await fetch("/api/resource/online_stores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(onlineStore),
  });

  if (!response.ok) {
    throw new Error("Failed to create online store");
  }

  return response.json();
}

export async function updateOnlineStore(
  id: string,
  onlineStore: OnlineStoreUpdateData,
): Promise<OnlineStore> {
  const response = await fetch(`/api/resource/online_stores/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(onlineStore),
  });

  if (!response.ok) {
    throw new Error(`Failed to update online store with id ${id}`);
  }

  return response.json();
}

export async function duplicateOnlineStore(id: string): Promise<OnlineStore> {
  const response = await fetch(`/api/resource/online_stores/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate online store");
  }

  return response.json();
}

export async function deleteOnlineStore(id: string): Promise<void> {
  const response = await fetch(`/api/resource/online_stores/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete online store with id ${id}`);
  }
}

export async function bulkDeleteOnlineStores(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/online_stores", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete online stores");
  }
}

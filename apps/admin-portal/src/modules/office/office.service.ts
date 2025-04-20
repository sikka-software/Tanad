import { Office } from "@/modules/office/office.type";

export async function fetchOffices(): Promise<Office[]> {
  const response = await fetch("/api/resource/offices");
  if (!response.ok) {
    throw new Error("Failed to fetch offices");
  }
  return response.json();
}

export async function fetchOfficeById(id: string): Promise<Office> {
  const response = await fetch(`/api/resource/offices/${id}`);
  if (!response.ok) {
    throw new Error(`Office with id ${id} not found`);
  }
  return response.json();
}

export async function createOffice(office: Omit<Office, "id" | "created_at">): Promise<Office> {
  const response = await fetch("/api/resource/offices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(office),
  });
  if (!response.ok) {
    throw new Error("Failed to create office");
  }
  return response.json();
}

export async function updateOffice(id: string, updates: Partial<Office>): Promise<Office> {
  const response = await fetch(`/api/resource/offices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update office with id ${id}`);
  }
  return response.json();
}

export async function duplicateOffice(id: string): Promise<Office> {
  const response = await fetch(`/api/resource/offices/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate office with id ${id}`);
  }
  return response.json();
}
export async function deleteOffice(id: string): Promise<void> {
  const response = await fetch(`/api/resource/offices/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete office with id ${id}`);
  }
}

export async function bulkDeleteOffices(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/offices", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete offices");
  }
}

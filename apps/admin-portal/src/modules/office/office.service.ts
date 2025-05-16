import { Office, OfficeCreateData, OfficeUpdateData } from "@/office/office.type";

export async function fetchOffices(): Promise<Office[]> {
  try {
    const response = await fetch("/api/resource/offices");
    if (!response.ok) {
      console.error("Failed to fetch offices:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching offices:", error);
    return [];
  }
}

export async function fetchOfficeById(id: string): Promise<Office> {
  try {
    const response = await fetch(`/api/resource/offices/${id}`);
    if (!response.ok) {
      throw new Error(`Office with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching office by id:", error);
    throw error;
  }
}

export async function createOffice(office: OfficeCreateData): Promise<Office> {
  try {
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
  } catch (error) {
    console.error("Error creating office:", error);
    throw error;
  }
}

export async function updateOffice(id: string, updates: OfficeUpdateData): Promise<Office> {
  const response = await fetch(`/api/resource/offices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

import { Office, OfficeCreateData } from "@/types/office.type";

export async function fetchOffices(): Promise<Office[]> {
  try {
    const response = await fetch("/api/offices");
    if (!response.ok) {
      throw new Error("Failed to fetch offices");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching offices:", error);
    throw new Error("Failed to fetch offices");
  }
}

export async function fetchOfficeById(id: string): Promise<Office> {
  const response = await fetch(`/api/offices/${id}`);
  if (!response.ok) {
    throw new Error(`Office with id ${id} not found`);
  }
  return response.json();
}

export async function createOffice(office: OfficeCreateData) {
  const response = await fetch("/api/offices", {
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

export async function updateOffice(id: string, office: Partial<Office>) {
  const response = await fetch(`/api/offices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(office),
  });

  if (!response.ok) {
    throw new Error(`Failed to update office with id ${id}`);
  }

  return response.json();
}

export async function deleteOffice(id: string) {
  const response = await fetch(`/api/offices/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete office with id ${id}`);
  }
}

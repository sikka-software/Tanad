import { Office, OfficeCreateData } from "@/modules/office/office.type";

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
  try {
    const response = await fetch(`/api/offices/${id}`);
    if (!response.ok) {
      throw new Error(`Office with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching office ${id}:`, error);
    throw error;
  }
}

export async function createOffice(office: OfficeCreateData): Promise<Office> {
  try {
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
  } catch (error) {
    console.error("Error creating office:", error);
    throw error;
  }
}

export async function updateOffice(id: string, office: Partial<Office>) {
  try {
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
  } catch (error) {
    console.error("Error updating office:", error);
    throw error;
  }
}

export async function deleteOffice(id: string) {
  try {
    const response = await fetch(`/api/offices/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete office with id ${id}`);
    }
  } catch (error) {
    console.error("Error deleting office:", error);
    throw error;
  }
}

export async function bulkDeleteOffices(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/offices/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete warehouses");
    }
  } catch (error) {
    console.error("Error bulk deleting offices:", error);
    throw error;
  }
}

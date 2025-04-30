import { Salary, SalaryCreateData } from "@/modules/salary/salary.type";

export async function fetchSalaries(): Promise<Salary[]> {
  try {
    const response = await fetch("/api/resource/salaries");
    if (!response.ok) {
      throw new Error("Failed to fetch salaries");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching salaries:", error);
    throw new Error("Failed to fetch salaries");
  }
}

export async function fetchSalaryById(id: string): Promise<Salary> {
  try {
    const response = await fetch(`/api/resource/salaries/${id}`);
    if (!response.ok) {
      throw new Error(`Salary with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching salary ${id}:`, error);
    throw new Error(`Failed to fetch salary with id ${id}`);
  }
}

export async function createSalary(data: SalaryCreateData): Promise<Salary> {
  try {
    const response = await fetch("/api/resource/salaries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create salary");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating salary:", error);
    throw new Error("Failed to create salary");
  }
}

export async function updateSalary(id: string, data: Partial<Salary>): Promise<Salary> {
  try {
    const response = await fetch(`/api/resource/salaries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update salary");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating salary:", error);
    throw new Error("Failed to update salary");
  }
}

export async function deleteSalary(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/resource/salaries/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete salary");
    }
  } catch (error) {
    console.error("Error deleting salary:", error);
    throw new Error("Failed to delete salary");
  }
}

export async function bulkDeleteSalaries(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/resource/salaries/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete salaries");
    }
  } catch (error) {
    console.error("Error deleting salaries:", error);
    throw new Error("Failed to delete salaries");
  }
}

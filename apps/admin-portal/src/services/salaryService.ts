import { Salary, SalaryCreateData } from "@/types/salary.type";

export async function fetchSalaries(): Promise<Salary[]> {
  try {
    const response = await fetch("/api/salaries");
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
    const response = await fetch(`/api/salaries/${id}`);
    if (!response.ok) {
      throw new Error(`Salary with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching salary ${id}:`, error);
    throw new Error(`Failed to fetch salary with id ${id}`);
  }
}

export async function createSalary(salary: SalaryCreateData): Promise<Salary> {
  try {
    const response = await fetch("/api/salaries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(salary),
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

export async function updateSalary(id: string, updates: Partial<Salary>): Promise<Salary> {
  try {
    const response = await fetch(`/api/salaries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update salary with id ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating salary ${id}:`, error);
    throw new Error(`Failed to update salary with id ${id}`);
  }
}

export async function deleteSalary(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/salaries/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete salary with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting salary ${id}:`, error);
    throw new Error(`Failed to delete salary with id ${id}`);
  }
}

export async function bulkDeleteSalaries(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/salaries/bulk-delete", {
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

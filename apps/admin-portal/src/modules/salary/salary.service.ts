import { Salary, SalaryCreateData, SalaryUpdateData } from "@/salary/salary.type";

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

export async function duplicateSalary(id: string): Promise<Salary> {
  try {
    const response = await fetch(`/api/resource/salaries/${id}/duplicate`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to duplicate salary");
    }
    return response.json();
  } catch (error) {
    console.error("Error duplicating salary:", error);
    throw new Error("Failed to duplicate salary");
  }
}

export async function updateSalary(id: string, data: SalaryUpdateData): Promise<Salary> {
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

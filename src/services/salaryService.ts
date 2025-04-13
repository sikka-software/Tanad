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
  const response = await fetch(`/api/salaries/${id}`);
  if (!response.ok) {
    throw new Error(`Salary with id ${id} not found`);
  }
  return response.json();
}

export async function createSalary(salary: SalaryCreateData) {
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
}

export async function updateSalary(id: string, salary: Partial<Salary>) {
  const response = await fetch(`/api/salaries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(salary),
  });

  if (!response.ok) {
    throw new Error(`Failed to update salary with id ${id}`);
  }

  return response.json();
}

export async function deleteSalary(id: string) {
  const response = await fetch(`/api/salaries/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete salary with id ${id}`);
  }
}

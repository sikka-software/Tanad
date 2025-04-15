import { Department, DepartmentCreateData } from "@/types/department.type";

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const response = await fetch("/api/departments");
    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw new Error("Failed to fetch departments");
  }
}

export async function fetchDepartmentById(id: string): Promise<Department> {
  const response = await fetch(`/api/departments/${id}`);
  if (!response.ok) {
    throw new Error(`Department with id ${id} not found`);
  }
  return response.json();
}

export async function createDepartment(department: DepartmentCreateData) {
  const response = await fetch("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(department),
  });

  if (!response.ok) {
    throw new Error("Failed to create department");
  }

  return response.json();
}

export async function updateDepartment(id: string, department: Partial<Department>) {
  const response = await fetch(`/api/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(department),
  });

  if (!response.ok) {
    throw new Error(`Failed to update department with id ${id}`);
  }

  return response.json();
}

export async function deleteDepartment(id: string) {
  const response = await fetch(`/api/departments/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete department with id ${id}`);
  }
}

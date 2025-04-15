import { Department, DepartmentCreateData } from "@/types/department.type";

export async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch("/api/departments");
  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }
  return response.json();
}

export async function fetchDepartmentById(id: string): Promise<Department> {
  const response = await fetch(`/api/departments/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch department with id ${id}`);
  }
  return response.json();
}

export async function createDepartment(department: DepartmentCreateData): Promise<Department> {
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

export async function updateDepartment(
  id: string,
  updates: Partial<Department>
): Promise<Department> {
  const response = await fetch(`/api/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update department with id ${id}`);
  }
  return response.json();
}

export async function deleteDepartment(id: string): Promise<void> {
  const response = await fetch(`/api/departments/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete department with id ${id}`);
  }
}

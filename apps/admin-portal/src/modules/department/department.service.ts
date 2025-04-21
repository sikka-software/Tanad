import { Department, DepartmentCreateData } from "@/modules/department/department.type";

export async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch("/api/resource/departments");
  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }
  return response.json();
}

export async function fetchDepartmentById(id: string): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}`);
  if (!response.ok) {
    throw new Error(`Department with id ${id} not found`);
  }
  return response.json();
}

export async function createDepartment(department: DepartmentCreateData): Promise<Department> {
  const response = await fetch("/api/resource/departments", {
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
  updates: Partial<Department>,
): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}`, {
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

export async function duplicateDepartment(id: string): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate department with id ${id}`);
  }
  return response.json();
}

export async function deleteDepartment(id: string): Promise<void> {
  const response = await fetch(`/api/resource/departments/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete department with id ${id}`);
  }
}

export async function bulkDeleteDepartments(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/departments", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete departments");
  }
}

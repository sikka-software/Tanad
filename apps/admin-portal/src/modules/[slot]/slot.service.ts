import { Employee, EmployeeCreateData, EmployeeUpdateData } from "@/employee/employee.types";

export async function fetchEmployees(): Promise<Employee[]> {
  const response = await fetch("/api/resource/employees");
  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  return response.json();
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  const response = await fetch(`/api/resource/employees/${id}`);
  if (!response.ok) {
    throw new Error(`Employee with id ${id} not found`);
  }
  return response.json();
}

export async function createEmployee(employee: EmployeeCreateData): Promise<Employee> {
  const response = await fetch("/api/resource/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });
  if (!response.ok) {
    throw new Error("Failed to create employee");
  }
  return response.json();
}

export async function updateEmployee(id: string, updates: EmployeeUpdateData): Promise<Employee> {
  const response = await fetch(`/api/resource/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update employee with id ${id}`);
  }
  return response.json();
}

export async function duplicateEmployee(id: string): Promise<Employee> {
  const response = await fetch(`/api/resource/employees/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate employee with id ${id}`);
  }
  return response.json();
}
export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`/api/resource/employees/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete employee with id ${id}`);
  }
}

export async function bulkDeleteEmployees(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/employees", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete employees");
  }
}

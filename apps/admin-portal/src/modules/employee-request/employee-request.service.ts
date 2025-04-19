import { EmployeeRequest } from "./employee-request.type";

export async function fetchEmployeeRequests(): Promise<EmployeeRequest[]> {
  try {
    const response = await fetch("/api/employee-requests");
    if (!response.ok) {
      throw new Error("Failed to fetch employee requests");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

export async function fetchEmployeeRequestById(id: string): Promise<EmployeeRequest> {
  try {
    const response = await fetch(`/api/employee-requests/${id}`);
    if (!response.ok) {
      throw new Error(`Employee request with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching employee request ${id}:`, error);
    throw new Error(`Failed to fetch employee request with id ${id}`);
  }
}

export async function createEmployeeRequest(
  employeeRequest: EmployeeRequest,
): Promise<EmployeeRequest> {
  try {
    const response = await fetch("/api/employee-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeRequest),
    });
    if (!response.ok) {
      throw new Error("Failed to create employee request");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating employee request:", error);
    throw new Error("Failed to create employee request");
  }
}

export async function updateEmployeeRequest(
  id: string,
  updates: Partial<EmployeeRequest>,
): Promise<EmployeeRequest> {
  try {
    const response = await fetch(`/api/employee-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update employee request with id ${id}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error updating employee request ${id}:`, error);
    throw new Error(`Failed to update employee request with id ${id}`);
  }
}

export async function deleteEmployeeRequest(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/employee-requests/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete employee request with id ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting employee request ${id}:`, error);
    throw new Error(`Failed to delete employee request with id ${id}`);
  }
}

export async function bulkDeleteEmployeeRequests(ids: string[]): Promise<void> {
  try {
    const response = await fetch("/api/employee-requests/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete employee requests");
    }
  } catch (error) {
    console.error("Error deleting employee requests:", error);
    throw new Error("Failed to delete employee requests");
  }
}

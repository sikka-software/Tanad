import {
  EmployeeRequest,
  EmployeeRequestCreateData,
  EmployeeRequestUpdateData,
} from "./employee-request.type";

export async function fetchEmployeeRequests(): Promise<EmployeeRequest[]> {
  try {
    const response = await fetch("/api/resource/employee_requests");
    if (!response.ok) {
      throw new Error("Failed to fetch employee requests");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching employee requests:", error);
    throw new Error("Failed to fetch employee requests");
  }
}

export async function fetchEmployeeRequestById(id: string): Promise<EmployeeRequest> {
  try {
    const response = await fetch(`/api/resource/employee_requests/${id}`);
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
  employeeRequest: EmployeeRequestCreateData,
): Promise<EmployeeRequest> {
  try {
    const response = await fetch("/api/resource/employee_requests", {
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

export async function duplicateEmployeeRequest(id: string): Promise<EmployeeRequest> {
  const response = await fetch(`/api/resource/employee_requests/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to duplicate employee request");
  }
  return response.json();
}

export async function updateEmployeeRequest(
  id: string,
  updates: EmployeeRequestUpdateData,
): Promise<EmployeeRequest> {
  try {
    const response = await fetch(`/api/resource/employee_requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    // console.log("response", response);
    // if (!response.ok) {
    //   let errorDetails = {};
    //   let errorMessage = `Failed to update employee request with id ${id}. Status: ${response.status}`;
    //   try {
    //     // Try to parse the error response from the API
    //     const errorData = await response.json();
    //     errorMessage = errorData.message || errorMessage; // Use the message from the API if available
    //     errorDetails = errorData.errorDetails || {};
    //     console.error("API Error Data:", errorData); // Log the full error data from API
    //   } catch (parseError) {
    //     // Ignore if the response body isn't valid JSON
    //     console.error("Could not parse error response JSON:", parseError);
    //   }
    //   // Throw an error that includes the message from the API response
    //   const error = new Error(errorMessage);
    //   (error as any).details = errorDetails; // Attach details if available
    //   throw error;
    // }
    return response.json();
  } catch (error) {
    // Log the final error being thrown (could be the original network error or the one constructed above)
    console.error(`Error updating employee request ${id}:`, error);
    // Re-throw the error to be caught by the mutation hook
    throw error;
  }
}

export async function deleteEmployeeRequest(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/resource/employee_requests/${id}`, {
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
    const response = await fetch("/api/resource/employee_requests", {
      method: "DELETE",
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

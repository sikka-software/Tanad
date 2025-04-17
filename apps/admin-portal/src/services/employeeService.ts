import { supabase } from "@/lib/supabase";
import useUserStore from "@/hooks/use-user-store";

import { Employee } from "@/types/employee.type";

export const EMPLOYEES_QUERY_KEY = ["employees"] as const;

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select(`
    *,
    department:departments (
      name
    )
  `);

  if (error) throw error;

  // Transform the data to match our Employee type
  return data.map((employee: any) => ({
    id: employee.id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone,
    position: employee.position,
    department: employee.department?.name || null,
    department_id: employee.departmentId,
    hire_date: employee.hireDate,
    salary: employee.salary,
    status: employee.status,
    notes: employee.notes,
    created_at: employee.createdAt,
    updated_at: employee.updatedAt,
  }));
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      *,
      department:departments (
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  // Transform the data to match our Employee type
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    department: data.department?.name || null,
    department_id: data.departmentId,
    hire_date: data.hireDate,
    salary: data.salary,
    status: data.status,
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const user = useUserStore.getState().user;
  if (!user?.id) {
    throw new Error("No authenticated user");
  }

  // Convert from snake_case to camelCase for the database
  const employeeData: Record<string, any> = {};

  // Map from snake_case interface to camelCase database fields
  Object.entries(updates).forEach(([key, value]) => {
    // Special case for department_id
    if (key === "department_id") {
      employeeData["departmentId"] = value;
    }
    // Skip department field as it's a virtual field
    else if (key === "department") {
      // Skip this field as it's handled by the join
    } else if (key === "status") {
      employeeData["status"] = value;
    }
    // Fields that should remain with snake_case in the database
    else if (["first_name", "last_name", "phone"].includes(key)) {
      employeeData[key] = value;
    }
    // All other fields: convert from snake_case to camelCase
    else if (key.includes("_")) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      employeeData[camelKey] = value;
    }
    // For fields already in camelCase, keep as is
    else {
      employeeData[key] = value;
    }
  });

  const response = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...employeeData,
      userId: user.id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update employee");
  }

  const updatedEmployee = await response.json();

  // Transform the data back to snake_case for our application
  return {
    id: updatedEmployee.id,
    first_name: updatedEmployee.first_name,
    last_name: updatedEmployee.last_name,
    email: updatedEmployee.email,
    phone: updatedEmployee.phone,
    position: updatedEmployee.position,
    department: updatedEmployee.department?.name || null,
    department_id: updatedEmployee.departmentId,
    hire_date: updatedEmployee.hireDate,
    salary: updatedEmployee.salary,
    status: updatedEmployee.status,
    notes: updatedEmployee.notes,
    created_at: updatedEmployee.createdAt,
    updated_at: updatedEmployee.updatedAt,
  };
}

export async function addEmployee(
  employee: Omit<Employee, "id" | "created_at" | "updated_at">,
): Promise<Employee> {
  // Convert from snake_case to camelCase for the database
  const employeeData: Record<string, any> = {};

  // Map from snake_case interface to camelCase database fields
  Object.entries(employee).forEach(([key, value]) => {
    // Special case for department_id
    if (key === "department_id") {
      employeeData["departmentId"] = value;
    }
    // Skip department field as it's a virtual field
    else if (key === "department") {
      // Skip this field as it's handled by the join
    } else if (key === "status") {
      employeeData["status"] = value;
    }
    // Fields that should remain with snake_case in the database
    else if (["first_name", "last_name", "phone"].includes(key)) {
      employeeData[key] = value;
    }
    // All other fields: convert from snake_case to camelCase
    else if (key.includes("_")) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      employeeData[camelKey] = value;
    }
    // For fields already in camelCase, keep as is
    else {
      employeeData[key] = value;
    }
  });

  const { data, error } = await supabase
    .from("employees")
    .insert([employeeData])
    .select(
      `
      *,
      department:departments (
        name
      )
    `,
    )
    .single();

  if (error) throw error;

  // Transform the data back to snake_case for our application
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    department: data.department?.name || null,
    department_id: data.departmentId,
    hire_date: data.hireDate,
    salary: data.salary,
    status: data.status,
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) throw error;
}

import { supabase } from "@/lib/supabase";

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
    status: employee.is_active ? "active" : "inactive",
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
    status: data.is_active ? "active" : "inactive",
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  // Make a copy of updates to avoid modifying the original object
  const updatesToApply: Record<string, any> = {};

  console.log("Original updates:", updates);

  // Map from snake_case interface to camelCase database fields
  Object.entries(updates).forEach(([key, value]) => {
    // Special case for department_id which stays as is
    if (key === "department_id") {
      updatesToApply["departmentId"] = value;
    }
    // Skip department field as it's a virtual field
    else if (key === "department") {
      // Skip this field as it's handled by the join
    }
    // Special case for status field which maps to is_active in DB
    else if (key === "status") {
      // If status is 'active', set is_active to true, otherwise false
      updatesToApply["is_active"] = value === "active";
    }
    // All other fields: convert from snake_case to camelCase
    else if (key.includes("_")) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updatesToApply[camelKey] = value;
    }
    // For fields already in camelCase, keep as is
    else {
      updatesToApply[key] = value;
    }
  });

  console.log("Updates to apply (after mapping):", updatesToApply);

  // If we're updating department_id, we need special handling to also update department field
  if (updatesToApply.departmentId !== undefined) {
    const { data: departmentData, error: departmentError } = await supabase
      .from("departments")
      .select("name")
      .eq("id", updatesToApply.departmentId)
      .single();

    if (departmentError) throw departmentError;
  }

  // Log the object keys we're updating and their values
  Object.keys(updatesToApply).forEach((key) => {
    console.log(`Updating key: ${key}, value:`, updatesToApply[key]);
  });

  // First perform the update
  const { data: updateResult, error: updateError } = await supabase
    .from("employees")
    .update(updatesToApply)
    .eq("id", id)
    .select();

  console.log("Update response:", updateResult);

  if (updateError) {
    console.error("Update error:", updateError);
    throw updateError;
  }

  // Then fetch the updated record separately to avoid PGRST116 error
  const { data, error: fetchError } = await supabase
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
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    throw fetchError;
  }

  if (!data) {
    console.error("No data returned after update");
    throw new Error(`Employee with id ${id} not found after update`);
  }

  console.log("Fetched updated employee:", data);

  // Transform the data back to snake_case for our application
  const transformedEmployee: Employee = {
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
    // Map is_active back to status enum
    status: data.is_active ? "active" : "inactive",
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };

  return transformedEmployee;
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
    }
    // Special case for status field which maps to is_active in DB
    else if (key === "status") {
      // If status is 'active', set is_active to true, otherwise false
      employeeData["is_active"] = value === "active";
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
    status: data.is_active ? "active" : "inactive",
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) throw error;
}

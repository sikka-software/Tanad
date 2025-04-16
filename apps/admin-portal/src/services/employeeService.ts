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
    ...employee,
    department: employee.department?.name || null,
  }));
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments (
        name
      )
    `)
    .eq("id", id)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    department: data.department?.name || null,
  };
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  // Make a copy of updates to avoid modifying the original object
  const updatesToApply = { ...updates };
  
  // If we're updating department_id, we need special handling to also update department field
  if (updatesToApply.department_id !== undefined) {
    const { data: departmentData, error: departmentError } = await supabase
      .from("departments")
      .select("name")
      .eq("id", updatesToApply.department_id)
      .single();
      
    if (departmentError) throw departmentError;
    
    // Update the department name in the updates object
    updatesToApply.department = departmentData?.name || null;
  }
  
  // First perform the update
  const { error: updateError } = await supabase
    .from("employees")
    .update(updatesToApply)
    .eq("id", id);
  
  if (updateError) throw updateError;
  
  // Then fetch the updated record separately to avoid PGRST116 error
  const { data, error: fetchError } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments (
        name
      )
    `)
    .eq("id", id)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors
  
  if (fetchError) throw fetchError;
  
  if (!data) {
    throw new Error(`Employee with id ${id} not found after update`);
  }
  
  return {
    ...data,
    department: data.department?.name || null,
  };
}

export async function addEmployee(employee: Omit<Employee, "id" | "created_at" | "updated_at">): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .insert([employee])
    .select(`
      *,
      department:departments (
        name
      )
    `)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    department: data.department?.name || null,
  };
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
} 
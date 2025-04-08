import { supabase } from "@/lib/supabase";
import { Salary, SalaryCreateData } from "@/types/salary.type";

export async function fetchSalaries(): Promise<Salary[]> {
  const { data, error } = await supabase
    .from("salaries")
    .select("*")
    .order("payment_date", { ascending: false }); // Order by payment date

  if (error) {
    console.error("Error fetching salaries:", error);
    throw new Error(error.message);
  }

  // Ensure numeric fields are parsed correctly if they come as strings
  return (data || []).map((salary) => ({
    ...salary,
    gross_amount: parseFloat(salary.gross_amount),
    net_amount: parseFloat(salary.net_amount),
  }));
}

export async function fetchSalaryById(id: string): Promise<Salary> {
  const { data, error } = await supabase.from("salaries").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching salary with id ${id}:`, error);
    throw new Error(error.message);
  }

  return {
    ...data,
    gross_amount: parseFloat(data.gross_amount),
    net_amount: parseFloat(data.net_amount),
  };
}

export async function createSalary(salary: SalaryCreateData): Promise<Salary> {
  // Convert userId to user_id if needed
  const dbSalary = { ...salary };
  if (salary.userId) {
    (dbSalary as any).user_id = salary.userId;
    delete (dbSalary as any).userId;
  }

  const { data, error } = await supabase.from("salaries").insert([dbSalary]).select().single();

  if (error) {
    console.error("Error creating salary:", error);
    throw new Error(error.message);
  }

  return {
    ...data,
    gross_amount: parseFloat(data.gross_amount),
    net_amount: parseFloat(data.net_amount),
  };
}

export async function updateSalary(
  id: string,
  salary: Partial<Omit<Salary, "id" | "created_at">>,
): Promise<Salary> {
  const { data, error } = await supabase
    .from("salaries")
    .update(salary)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating salary with id ${id}:`, error);
    throw new Error(error.message);
  }

  return {
    ...data,
    gross_amount: parseFloat(data.gross_amount),
    net_amount: parseFloat(data.net_amount),
  };
}

export async function deleteSalary(id: string): Promise<void> {
  const { error } = await supabase.from("salaries").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting salary with id ${id}:`, error);
    throw new Error(error.message);
  }
}

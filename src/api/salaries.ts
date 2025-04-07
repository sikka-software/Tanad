import { supabase } from '@/lib/supabase';

// Define the structure for Deductions if it's consistent
// For flexibility, using Record<string, any> or a more specific type if known
interface DeductionDetail {
  type: string;
  amount: number;
  // add other relevant fields if structure is known
}

export interface Salary {
  id: string;
  created_at: string;
  pay_period_start: string; // Use string for date types from Supabase
  pay_period_end: string;
  payment_date: string;
  gross_amount: number; // Use number for numeric types
  net_amount: number;
  deductions: Record<string, DeductionDetail> | DeductionDetail[] | null; // Flexible JSONB type
  notes: string | null;
  employee_name: string;
  // userId might not be needed here if handled by RLS
}

export async function fetchSalaries(): Promise<Salary[]> {
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .order('payment_date', { ascending: false }); // Order by payment date

  if (error) {
    console.error('Error fetching salaries:', error);
    throw new Error(error.message);
  }

  // Ensure numeric fields are parsed correctly if they come as strings
  return (data || []).map(salary => ({
    ...salary,
    gross_amount: parseFloat(salary.gross_amount),
    net_amount: parseFloat(salary.net_amount),
  }));
}

export async function fetchSalaryById(id: string): Promise<Salary> {
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .eq('id', id)
    .single();

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

// Input type excludes generated fields like id, created_at
export async function createSalary(salary: Omit<Salary, 'id' | 'created_at'>): Promise<Salary> {
  const { data, error } = await supabase
    .from('salaries')
    .insert([salary]) // RLS adds userId
    .select()
    .single();

  if (error) {
    console.error('Error creating salary:', error);
    throw new Error(error.message);
  }

  return {
    ...data,
    gross_amount: parseFloat(data.gross_amount),
    net_amount: parseFloat(data.net_amount),
  };
}

export async function updateSalary(id: string, salary: Partial<Omit<Salary, 'id' | 'created_at'>>): Promise<Salary> {
  const { data, error } = await supabase
    .from('salaries')
    .update(salary)
    .eq('id', id)
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
  const { error } = await supabase
    .from('salaries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting salary with id ${id}:`, error);
    throw new Error(error.message);
  }
} 
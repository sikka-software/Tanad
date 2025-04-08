// Define the structure for Deductions if it's consistent
export interface DeductionDetail {
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

// For creating a new salary entry
export type SalaryCreateData = Omit<Salary, "id" | "created_at"> & { userId?: string };

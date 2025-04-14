// Define the structure for Deductions if it's consistent
export interface DeductionDetail {
  type: string;
  amount: number;
  // add other relevant fields if structure is known
}

export interface Salary {
  id: string;
  employee_name: string;
  gross_amount: number;
  net_amount: number;
  payment_date: string;
  pay_period_start: string;
  pay_period_end: string;
  deductions?: Record<string, number>;
  notes?: string;
}

// For creating a new salary entry
export type SalaryCreateData = Omit<Salary, "id" | "created_at"> & { userId?: string };

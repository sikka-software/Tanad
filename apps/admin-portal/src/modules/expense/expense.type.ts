export interface Expense {
  id: string;
  created_at: string;
  expense_number: string;
  issue_date: Date;
  due_date: Date;
  status: "pending" | "paid" | "overdue";
  amount: number;
  category: string;
  notes?: string;
  client_id?: string;
  user_id: string;
}

// Define an explicit type for branch creation data
export type ExpenseCreateData = Omit<Expense, "id" | "created_at"> & { user_id: string };
export type ExpenseUpdateData = Omit<Expense, "created_at" | "user_id">;

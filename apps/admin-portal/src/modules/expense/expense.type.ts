import { Constants, Database } from "@/lib/database.types";

export const ExpenseStatus = Constants.public.Enums.expense_status;
export type ExpenseStatusProps = (typeof ExpenseStatus)[number];

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseCreateData = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdateData = Database["public"]["Tables"]["expenses"]["Update"];

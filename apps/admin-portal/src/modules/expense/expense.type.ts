import { Database } from "@/lib/database.types";

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseCreateData = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdateData = Database["public"]["Tables"]["expenses"]["Update"];

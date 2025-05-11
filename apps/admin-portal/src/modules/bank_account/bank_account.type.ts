import { Database } from "@/lib/database.types";

export type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];
export type BankAccountCreateData = Database["public"]["Tables"]["bank_accounts"]["Insert"];
export type BankAccountUpdateData = Database["public"]["Tables"]["bank_accounts"]["Update"];

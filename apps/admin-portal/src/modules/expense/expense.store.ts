import { createGenericStore } from "@/utils/generic-store";

import { Expense } from "./expense.type";

const searchExpenseFn = (expense: Expense, searchQuery: string) =>
  expense.expense_number.toLowerCase().includes(searchQuery.toLowerCase());

const useExpenseStore = createGenericStore<Expense>("expenses", searchExpenseFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
});

export default useExpenseStore;

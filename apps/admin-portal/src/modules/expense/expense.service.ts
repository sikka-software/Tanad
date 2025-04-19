import { Expense, ExpenseCreateData } from "@/modules/expense/expense.type";

export async function fetchExpenses(): Promise<Expense[]> {
  try {
    const response = await fetch("/api/expenses");
    if (!response.ok) {
      throw new Error("Failed to fetch expenses");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
}

export async function fetchExpenseById(id: string): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`);
  if (!response.ok) {
    throw new Error(`Expense with id ${id} not found`);
  }
  return response.json();
}

export async function createExpense(expense: ExpenseCreateData): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

export async function updateExpense(
  id: string,
  expense: Partial<Omit<Expense, "id" | "created_at">>,
): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error(`Failed to update expense with id ${id}`);
  }

  return response.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete expense with id ${id}`);
  }
}

export async function bulkDeleteExpenses(ids: string[]): Promise<void> {
  const response = await fetch("/api/expenses", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete expenses");
  }
}

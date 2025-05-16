import { Expense, ExpenseCreateData, ExpenseUpdateData } from "./expense.type";

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch("/api/resource/expenses");
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

export async function fetchExpenseById(id: string): Promise<Expense> {
  const response = await fetch(`/api/resource/expenses/${id}`);
  if (!response.ok) {
    throw new Error(`Expense with id ${id} not found`);
  }
  return response.json();
}

export async function createExpense(expense: ExpenseCreateData): Promise<Expense> {
  const response = await fetch("/api/resource/expenses", {
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

export async function updateExpense(id: string, updates: ExpenseUpdateData): Promise<Expense> {
  const response = await fetch(`/api/resource/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update expense with id ${id}`);
  }
  return response.json();
}

export async function duplicateExpense(id: string): Promise<Expense> {
  const response = await fetch(`/api/resource/expenses/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate expense with id ${id}`);
  }
  return response.json();
}

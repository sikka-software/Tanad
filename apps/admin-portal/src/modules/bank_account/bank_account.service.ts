import {
  BankAccount,
  BankAccountCreateData,
  BankAccountUpdateData,
} from "@/bank_account/bank_account.type";

export async function fetchBankAccounts(): Promise<BankAccount[]> {
  try {
    const response = await fetch("/api/resource/bank_accounts");
    if (!response.ok) {
      console.error("Failed to fetch bank accounts:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return [];
  }
}

export async function fetchBankAccountById(id: string): Promise<BankAccount> {
  const response = await fetch(`/api/resource/bank_accounts/${id}`);
  if (!response.ok) {
    throw new Error(`Bank account with id ${id} not found`);
  }
  return response.json();
}

export async function createBankAccount(bankAccount: BankAccountCreateData): Promise<BankAccount> {
  const response = await fetch("/api/resource/bank_accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bankAccount),
  });

  if (!response.ok) {
    throw new Error("Failed to create bank account");
  }

  return response.json();
}

export async function updateBankAccount(
  id: string,
  bankAccount: BankAccountUpdateData,
): Promise<BankAccount> {
  const response = await fetch(`/api/resource/bank_accounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bankAccount),
  });

  if (!response.ok) {
    throw new Error(`Failed to update bank account with id ${id}`);
  }

  return response.json();
}

export async function deleteBankAccount(id: string): Promise<void> {
  const response = await fetch(`/api/resource/bank_accounts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete bank account with id ${id}`);
  }
}

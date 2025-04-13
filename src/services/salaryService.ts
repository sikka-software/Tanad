import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";
import { Salary, SalaryCreateData } from "@/types/salary.type";

// Helper to convert Drizzle salary to our Salary type
function convertDrizzleSalary(data: typeof salaries.$inferSelect): Salary {
  return {
    id: data.id,
    created_at: data.createdAt?.toString() || "",
    pay_period_start: data.payPeriodStart,
    pay_period_end: data.payPeriodEnd,
    payment_date: data.paymentDate,
    gross_amount: Number(data.grossAmount),
    net_amount: Number(data.netAmount),
    deductions: data.deductions as Salary["deductions"],
    notes: data.notes,
    employee_name: data.employeeName,
  };
}

export async function fetchSalaries(): Promise<Salary[]> {
  try {
    const response = await fetch("/api/salaries");
    if (!response.ok) {
      throw new Error("Failed to fetch salaries");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching salaries:", error);
    throw new Error("Failed to fetch salaries");
  }
}

export async function fetchSalaryById(id: string): Promise<Salary> {
  const response = await fetch(`/api/salaries/${id}`);
  if (!response.ok) {
    throw new Error(`Salary with id ${id} not found`);
  }
  return response.json();
}

export async function createSalary(salary: SalaryCreateData) {
  const response = await fetch("/api/salaries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(salary),
  });

  if (!response.ok) {
    throw new Error("Failed to create salary");
  }

  return response.json();
}

export async function updateSalary(id: string, salary: Partial<Salary>) {
  const response = await fetch(`/api/salaries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(salary),
  });

  if (!response.ok) {
    throw new Error(`Failed to update salary with id ${id}`);
  }

  return response.json();
}

export async function deleteSalary(id: string) {
  const response = await fetch(`/api/salaries/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete salary with id ${id}`);
  }
}

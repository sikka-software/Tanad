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
    const data = await db.query.salaries.findMany({
      orderBy: desc(salaries.paymentDate),
    });
    return data.map(convertDrizzleSalary);
  } catch (error) {
    console.error("Error fetching salaries:", error);
    throw error;
  }
}

export async function fetchSalaryById(id: string): Promise<Salary> {
  const data = await db.query.salaries.findFirst({
    where: eq(salaries.id, id),
  });

  if (!data) {
    throw new Error(`Salary with id ${id} not found`);
  }

  return convertDrizzleSalary(data);
}

export async function createSalary(salary: SalaryCreateData): Promise<Salary> {
  // Map salary data to match Drizzle schema
  const dbSalary = {
    payPeriodStart: salary.pay_period_start,
    payPeriodEnd: salary.pay_period_end,
    paymentDate: salary.payment_date,
    grossAmount: salary.gross_amount.toString(),
    netAmount: salary.net_amount.toString(),
    deductions: salary.deductions,
    notes: salary.notes,
    employeeName: salary.employee_name,
    userId: salary.userId || "",
  };

  const [data] = await db.insert(salaries).values(dbSalary).returning();

  if (!data) {
    throw new Error("Failed to create salary");
  }

  return convertDrizzleSalary(data);
}

export async function updateSalary(
  id: string,
  salary: Partial<Omit<Salary, "id" | "created_at">>,
): Promise<Salary> {
  // Map salary data to match Drizzle schema
  const dbSalary = {
    ...(salary.pay_period_start && { payPeriodStart: salary.pay_period_start }),
    ...(salary.pay_period_end && { payPeriodEnd: salary.pay_period_end }),
    ...(salary.payment_date && { paymentDate: salary.payment_date }),
    ...(salary.gross_amount && { grossAmount: salary.gross_amount.toString() }),
    ...(salary.net_amount && { netAmount: salary.net_amount.toString() }),
    ...(salary.deductions && { deductions: salary.deductions }),
    ...(salary.notes !== undefined && { notes: salary.notes }),
    ...(salary.employee_name && { employeeName: salary.employee_name }),
  };

  const [data] = await db.update(salaries).set(dbSalary).where(eq(salaries.id, id)).returning();

  if (!data) {
    throw new Error(`Failed to update salary with id ${id}`);
  }

  return convertDrizzleSalary(data);
}

export async function deleteSalary(id: string): Promise<void> {
  await db.delete(salaries).where(eq(salaries.id, id));
}

import { NextApiRequest, NextApiResponse } from "next";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";
import { SalaryCreateData } from "@/types/salary.type";

// Helper to convert Drizzle salary to our Salary type
function convertDrizzleSalary(data: typeof salaries.$inferSelect) {
  return {
    id: data.id,
    created_at: data.created_at?.toString() || "",
    pay_period_start: data.payPeriodStart,
    pay_period_end: data.payPeriodEnd,
    payment_date: data.paymentDate,
    gross_amount: Number(data.grossAmount),
    net_amount: Number(data.netAmount),
    deductions: data.deductions as Record<string, number> | null,
    notes: data.notes || undefined,
    employee_name: data.employeeName,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        if (!db) throw new Error("Database connection not initialized");
        const data = await db.query.salaries.findMany({
          orderBy: desc(salaries.paymentDate),
        });
        return res.status(200).json(data.map(convertDrizzleSalary));
      }

      case "POST": {
        if (!db) throw new Error("Database connection not initialized");
        const salary = req.body as SalaryCreateData;
        
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
          user_id: salary.user_id || "",
        };

        const [data] = await db.insert(salaries).values(dbSalary).returning();
        if (!data) {
          throw new Error("Failed to create salary");
        }
        return res.status(201).json(convertDrizzleSalary(data));
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in salary API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { salaries } from '@/db/schema';
import { Salary } from '@/types/salary.type';

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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing salary ID' });
  }

  if (!db) throw new Error('Database connection not initialized');

  try {
    switch (req.method) {
      case 'GET': {
        const data = await db.query.salaries.findFirst({
          where: eq(salaries.id, id),
        });

        if (!data) {
          return res.status(404).json({ error: `Salary with id ${id} not found` });
        }

        return res.status(200).json(convertDrizzleSalary(data));
      }

      case 'PUT': {
        const salary = req.body as Partial<Salary>;
        
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

        const [data] = await db.update(salaries)
          .set(dbSalary)
          .where(eq(salaries.id, id))
          .returning();

        if (!data) {
          return res.status(404).json({ error: `Salary with id ${id} not found` });
        }

        return res.status(200).json(convertDrizzleSalary(data));
      }

      case 'DELETE': {
        await db.delete(salaries).where(eq(salaries.id, id));
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in salary API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { createSalary, fetchSalaries } from '@/services/salaryService';
import { SalaryCreateData } from '@/types/salary.type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const salaries = await fetchSalaries();
        return res.status(200).json(salaries);
      
      case 'POST':
        const newSalary = await createSalary(req.body as SalaryCreateData);
        return res.status(201).json(newSalary);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Salary API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 
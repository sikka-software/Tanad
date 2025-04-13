import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSalary, fetchSalaryById, updateSalary } from '@/services/salaryService';
import { Salary } from '@/types/salary.type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid salary ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const salary = await fetchSalaryById(id);
        return res.status(200).json(salary);
      
      case 'PUT':
        const updatedSalary = await updateSalary(id, req.body as Partial<Omit<Salary, 'id' | 'created_at'>>);
        return res.status(200).json(updatedSalary);
      
      case 'DELETE':
        await deleteSalary(id);
        return res.status(204).end();
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Salary API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSalary, fetchSalaryById, updateSalary } from '@/services/salaryService';
import { Salary } from '@/types/salary.type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing salary ID' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const salary = await fetchSalaryById(id);
        return res.status(200).json(salary);
      }

      case 'PUT': {
        const salary = await updateSalary(id, req.body);
        return res.status(200).json(salary);
      }

      case 'DELETE': {
        await deleteSalary(id);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in salary API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
import { NextResponse } from "next/server";

import {
  createSalary,
  deleteSalary,
  fetchSalaries,
  fetchSalaryById,
  updateSalary,
} from "@/services/salaryService";
import { SalaryCreateData } from "@/types/salary.type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const salary = await fetchSalaryById(id);
      return NextResponse.json(salary);
    }

    const salaries = await fetchSalaries();
    return NextResponse.json(salaries);
  } catch (error) {
    console.error("Error in GET /api/salaries:", error);
    return NextResponse.json({ error: "Failed to fetch salaries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const salary = await createSalary(data as SalaryCreateData);
    return NextResponse.json(salary);
  } catch (error) {
    console.error("Error in POST /api/salaries:", error);
    return NextResponse.json({ error: "Failed to create salary" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing salary ID" }, { status: 400 });
    }

    const data = await request.json();
    const salary = await updateSalary(id, data);
    return NextResponse.json(salary);
  } catch (error) {
    console.error("Error in PUT /api/salaries:", error);
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing salary ID" }, { status: 400 });
    }

    await deleteSalary(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/salaries:", error);
    return NextResponse.json({ error: "Failed to delete salary" }, { status: 500 });
  }
}

//
//
// import { NextApiRequest, NextApiResponse } from 'next';
// import { createSalary, fetchSalaries } from '@/services/salaryService';
// import { SalaryCreateData } from '@/types/salary.type';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     switch (req.method) {
//       case 'GET':
//         const salaries = await fetchSalaries();
//         return res.status(200).json(salaries);

//       case 'POST':
//         const newSalary = await createSalary(req.body as SalaryCreateData);
//         return res.status(201).json(newSalary);

//       default:
//         res.setHeader('Allow', ['GET', 'POST']);
//         return res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
//   } catch (error) {
//     console.error('Salary API error:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

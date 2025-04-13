import { NextApiRequest, NextApiResponse } from "next";

import { fetchSalaries } from "@/services/salaryService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const salaries = await fetchSalaries();
      res.status(200).json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

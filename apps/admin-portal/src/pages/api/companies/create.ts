import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";
import { Company } from "@/types/company.type";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      industry,
      size,
      notes,
      is_active,
      user_id,
    } = req.body;

    if (!name || !email || !user_id) {
      return res.status(400).json({ error: "Name, email, and user_id are required" });
    }

    const [company] = await db
      .insert(companies)
      .values({
        name,
        email,
        phone,
        website,
        address,
        city,
        state,
        zipCode,
        industry,
        size,
        notes,
        is_active,
        user_id,
      })
      .returning();

    return res.status(201).json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

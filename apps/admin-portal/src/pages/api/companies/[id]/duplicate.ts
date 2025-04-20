import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;

    // Fetch the original company
    const [originalCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id as string))
      .limit(1);

    if (!originalCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Verify user owns the company
    if (originalCompany.user_id !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Create new company with copied data
    const [duplicatedCompany] = await db
      .insert(companies)
      .values({
        name: `${originalCompany.name} (Copy)`,
        email: originalCompany.email,
        phone: originalCompany.phone,
        website: originalCompany.website,
        address: originalCompany.address,
        city: originalCompany.city,
        state: originalCompany.state,
        zip_code: originalCompany.zip_code,
        industry: originalCompany.industry,
        size: originalCompany.size,
        notes: originalCompany.notes,
        is_active: originalCompany.is_active,
        user_id: user.id,
      })
      .returning();

    return res.status(201).json(duplicatedCompany);
  } catch (error) {
    console.error("Error duplicating company:", error);
    return res.status(500).json({ message: "Error duplicating company" });
  }
}

import { sql } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { employees } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("req.body", req.body);
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      department_id,
      hire_date,
      salary,
      status,
      notes,
    } = req.body;

    const [employee] = await db
      .insert(employees)
      .values({
        user_id: user.id,
        first_name,
        last_name,
        email,
        phone,
        position,
        department_id,
        hire_date,
        salary: salary ? sql`${salary}::numeric` : null,
        status,
        notes,
      })
      .returning();

    console.log(employee);

    return res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ error: "Failed to create employee" });
  }
}

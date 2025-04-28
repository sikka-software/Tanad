import { desc, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { salaries } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });
  try {
    switch (req.method) {
      case "GET": {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await db.query.salaries.findMany({
          where: eq(salaries.user_id, user?.id),
          orderBy: desc(salaries.start_date),
        });
        return res.status(200).json(data);
      }

      case "POST": {
        const { employeeId, amount, start_date, notes, currency, paymentFrequency, end_date } =
          req.body;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        // Ensure enterprise_id exists
        const enterprise_id = user.app_metadata.enterprise_id;
        if (!enterprise_id) {
          return res.status(400).json({ error: "Enterprise association not found for user" });
        }

        // Validate required fields from request
        if (!employeeId || amount === undefined || !start_date) {
          return res.status(400).json({
            error:
              "Missing required fields: employeeId, amount, start_date are required in the request body",
          });
        }

        const [data] = await db
          .insert(salaries)
          .values({
            employeeId: employeeId,
            amount: amount.toString(),
            start_date: start_date,
            notes: notes,
            currency: currency,
            paymentFrequency: paymentFrequency,
            end_date: end_date,
            user_id: user.id,
            enterprise_id: enterprise_id,
          })
          .returning();
        if (!data) {
          throw new Error("Failed to create salary");
        }
        return res.status(201).json(data);
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

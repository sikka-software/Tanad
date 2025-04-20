import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";
import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const supabase = createClient({
    req,
    res,
    query: {},
    resolvedUrl: "",
  });

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid company ID" });
  }

  if (req.method === "GET") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, id as string),
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      return res.status(200).json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      return res.status(500).json({ message: "Error fetching company" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const existingCompany = await db.query.companies.findFirst({
        where: eq(companies.id, id as string),
      });

      if (!existingCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      if (existingCompany.user_id !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this company" });
      }

      const dbCompany = {
        ...req.body,
        zip_code: req.body.zip_code,
        is_active: req.body.is_active,
      };

      const [company] = await db
        .update(companies)
        .set(dbCompany)
        .where(eq(companies.id, id as string))
        .returning();

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      return res.status(500).json({ message: "Error updating company" });
    }
  }

  if (req.method === "DELETE") {
    try {
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
        return res
          .status(401)
          .json({ message: "Unauthorized, you must be logged in to delete a company" });
      }

      await db.delete(companies).where(eq(companies.id, id as string));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting company:", error);
      return res.status(500).json({ message: "Error deleting company" });
    }
  }

  return res
    .status(405)
    .json({ message: "Method not allowed, only GET, PUT and DELETE are allowed" });
}

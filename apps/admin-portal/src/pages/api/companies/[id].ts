import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.query.companies.findFirst({
        where: eq(companies.id, id),
      });

      if (!result) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching company:", error);
      return res.status(500).json({ message: "Error fetching company" });
    }
  }

  if (req.method === "PUT") {
    try {
      const updates = req.body;

      const result = await db
        .update(companies)
        .set(updates)
        .where(eq(companies.id, id))
        .returning();

      if (!result.length) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error("Error updating company:", error);
      return res.status(500).json({ message: "Error updating company" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await db.delete(companies).where(eq(companies.id, id)).returning();

      if (!result.length) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Error deleting company:", error);
      return res.status(500).json({ message: "Error deleting company" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

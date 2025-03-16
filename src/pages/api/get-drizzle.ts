import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle";
import { usersInAuth } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Example query - adjust based on your needs
    const users = await db.select().from(usersInAuth).limit(5);
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

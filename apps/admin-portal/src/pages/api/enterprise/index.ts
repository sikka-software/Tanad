import { eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { enterprises } from "@/db/schema";

// TODO: Replace with your actual authentication/session utility
// import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // TODO: Replace with your actual authentication/session logic
  // const user = await getUserFromRequest(req);
  // if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { id, ...updateFields } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Enterprise id is required" });
  }

  try {
    // Optionally: Check if the user is allowed to update this enterprise (ownership/role check)
    // Example: if (!user.enterpriseIds.includes(id)) return res.status(403).json({ message: 'Forbidden' });

    const [updated] = await db
      .update(enterprises)
      .set(updateFields)
      .where(eq(enterprises.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Enterprise not found" });
    }
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Failed to update enterprise:", error);
    return res
      .status(500)
      .json({ message: "Failed to update enterprise", error: (error as Error).message });
  }
}

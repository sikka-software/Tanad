// pages/api/branches/index.ts
import { createApiHandler } from "@/lib/api-handler";

import { db } from "@/db/drizzle";
import { branches } from "@/db/schema";

export default createApiHandler({
  table: branches,
  query: db.query.branches,
});

// import { desc, eq, inArray } from "drizzle-orm";
// import { NextApiRequest, NextApiResponse } from "next";

// import { db } from "@/db/drizzle";
// import { branches } from "@/db/schema";
// import { createClient } from "@/utils/supabase/server-props";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const supabase = createClient({
//     req,
//     res,
//     query: {},
//     resolvedUrl: "",
//   });

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user?.id) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   if (req.method === "GET") {
//     try {
//       const branchesList = await db.query.branches.findMany({
//         where: eq(branches.user_id, user?.id),
//         orderBy: desc(branches.created_at),
//       });
//       return res.status(200).json(branchesList);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       return res.status(500).json({ message: "Error fetching branches" });
//     }
//   }

//   if (req.method === "POST") {
//     try {
//       const dbBranch = {
//         ...req.body,
//         user_id: user?.id,
//       };

//       const [branch] = await db.insert(branches).values(dbBranch).returning();
//       return res.status(201).json(branch);
//     } catch (error) {
//       console.error("Error creating branch:", error);
//       return res.status(500).json({ message: "Error creating branch" });
//     }
//   }

//   if (req.method === "DELETE") {
//     try {
//       const { ids } = req.body;

//       if (!Array.isArray(ids) || ids.length === 0) {
//         return res.status(400).json({ message: "Invalid request body" });
//       }

//       await db.delete(branches).where(inArray(branches.id, ids));
//       return res.status(204).end();
//     } catch (error) {
//       console.error("Error deleting branches:", error);
//       return res.status(500).json({ message: "Error deleting branches" });
//     }
//   }

//   return res.status(405).json({ message: "Method not allowed" });
// }

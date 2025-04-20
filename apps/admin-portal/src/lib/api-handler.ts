import { desc, eq, inArray } from "drizzle-orm";
import { PgTable, AnyPgColumn } from "drizzle-orm/pg-core";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { createClient } from "@/utils/supabase/server-props";

type UserOwnedTable = PgTable & {
  user_id: AnyPgColumn;
  created_at: AnyPgColumn;
  id: AnyPgColumn;
};

type Options<T extends UserOwnedTable> = {
  table: T;
  query: any; // you can type this further if you want
  customHandlers?: Partial<{
    GET: (userId: string, req: NextApiRequest) => Promise<any>;
    POST: (userId: string, req: NextApiRequest) => Promise<any>;
    DELETE: (userId: string, req: NextApiRequest) => Promise<any>;
  }>;
};

export function createApiHandler<T extends UserOwnedTable>({
  table,
  query,
  customHandlers = {},
}: Options<T>) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user.id;

    try {
      switch (req.method) {
        case "GET":
          if (customHandlers.GET) {
            const data = await customHandlers.GET(userId, req);
            return res.status(200).json(data);
          }

          const list = await query.findMany({
            where: eq(table.user_id, userId),
            orderBy: desc(table.created_at),
          });
          return res.status(200).json(list);

        case "POST":
          if (customHandlers.POST) {
            const data = await customHandlers.POST(userId, req);
            return res.status(201).json(data);
          }

          const [created] = await db
            .insert(table)
            .values({
              ...req.body,
              user_id: userId,
            })
            .returning();
          return res.status(201).json(created);

        case "DELETE":
          if (customHandlers.DELETE) {
            await customHandlers.DELETE(userId, req);
            return res.status(204).end();
          }

          const { ids } = req.body;
          if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Invalid request body" });
          }

          await db.delete(table).where(inArray(table.id, ids));
          return res.status(204).end();

        default:
          return res.status(405).json({ message: "Method not allowed" });
      }
    } catch (error) {
      console.error(`Error in ${req.method}:`, error);
      return res.status(500).json({ message: `Error handling ${req.method}` });
    }
  };
}

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
    GET: (user_id: string, req: NextApiRequest) => Promise<any>;
    POST: (user_id: string, req: NextApiRequest) => Promise<any>;
    DELETE: (user_id: string, req: NextApiRequest) => Promise<any>;
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

    const user_id = user.id;

    try {
      switch (req.method) {
        case "GET":
          if (customHandlers.GET) {
            const data = await customHandlers.GET(user_id, req);
            return res.status(200).json(data);
          }

          const list = await query.findMany({
            where: eq(table.user_id, user_id),
            orderBy: desc(table.created_at),
          });
          return res.status(200).json(list);

        case "POST":
          if (customHandlers.POST) {
            const data = await customHandlers.POST(user_id, req);
            return res.status(201).json(data);
          }

          // Get the user's enterprise_id from their profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("enterprise_id")
            .eq("id", user_id)
            .single();

          if (!profile?.enterprise_id) {
            return res.status(400).json({ message: "User is not associated with an enterprise" });
          }

          const [created] = await db
            .insert(table)
            .values({
              ...req.body,
              user_id,
              enterprise_id: profile.enterprise_id,
            })
            .returning();
          return res.status(201).json(created);

        case "DELETE":
          if (customHandlers.DELETE) {
            await customHandlers.DELETE(user_id, req);
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

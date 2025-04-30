import { desc, eq, inArray } from "drizzle-orm";
import { PgTable, AnyPgColumn } from "drizzle-orm/pg-core";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/drizzle";
import { createClient } from "@/utils/supabase/server-props";

type UserOwnedTable = PgTable & {
  user_id: AnyPgColumn;
  enterprise_id: AnyPgColumn;
  created_at: AnyPgColumn;
  id: AnyPgColumn;
};

type Options<T extends UserOwnedTable> = {
  table: T;
  query: any; // you can type this further if you want
  customHandlers?: Partial<{
    GET: (user_id: string, req: NextApiRequest) => Promise<any>;
    POST: (user_id: string, enterprise_id: string, req: NextApiRequest) => Promise<any>;
    DELETE: (user_id: string, req: NextApiRequest) => Promise<any>;
  }>;
};

async function getUserEnterpriseId(supabase: any, user_id: string): Promise<string> {
  const { data: membership } = await supabase
    .from("memberships")
    .select("enterprise_id")
    .eq("profile_id", user_id)
    .single();

  if (!membership?.enterprise_id) {
    throw new Error("User is not associated with an enterprise");
  }

  return membership.enterprise_id;
}

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

          const enterprise_id = await getUserEnterpriseId(supabase, user_id);
          const list = await query.findMany({
            where: eq(table.enterprise_id, enterprise_id),
            orderBy: desc(table.created_at),
          });
          return res.status(200).json(list);

        case "POST":
          const postEnterpriseId = await getUserEnterpriseId(supabase, user_id);
          
          if (customHandlers.POST) {
            const data = await customHandlers.POST(user_id, postEnterpriseId, req);
            return res.status(201).json(data);
          }

          const [created] = await db
            .insert(table)
            .values({
              ...req.body,
              user_id,
              enterprise_id: postEnterpriseId,
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
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: `Error handling ${req.method}` });
    }
  };
}

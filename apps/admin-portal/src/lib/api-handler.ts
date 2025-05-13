import { SupabaseClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

type Options = {
  tableName: string;
  customHandlers?: Partial<{
    GET: (
      supabase: SupabaseClient<any, "public", any>,
      user_id: string,
      req: NextApiRequest,
    ) => Promise<any>;
    POST: (
      supabase: SupabaseClient<any, "public", any>,
      user_id: string,
      enterprise_id: string,
      req: NextApiRequest,
    ) => Promise<any>;
    DELETE: (
      supabase: SupabaseClient<any, "public", any>,
      user_id: string,
      req: NextApiRequest,
    ) => Promise<any>;
  }>;
};

async function getUserEnterpriseId(
  supabase: SupabaseClient<any, "public", any>,
  user_id: string,
): Promise<string> {
  const { data: membership, error } = await supabase
    .from("memberships")
    .select("enterprise_id")
    .eq("profile_id", user_id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching enterprise ID:", error);
    throw new Error("Failed to retrieve enterprise association");
  }
  if (!membership?.enterprise_id) {
    throw new Error("User is not associated with an enterprise");
  }

  return membership.enterprise_id;
}

export function createApiHandler({ tableName, customHandlers = {} }: Options) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      console.error("API Auth Error:", authError);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user_id = user.id;
    let enterprise_id: string | null = null;

    try {
      enterprise_id = await getUserEnterpriseId(supabase, user_id);

      switch (req.method) {
        case "GET":
          if (customHandlers.GET) {
            const data = await customHandlers.GET(supabase, user_id, req);
            return res.status(200).json(data);
          }

          const { data: listData, error: listError } = await supabase
            .from(tableName)
            .select("*")
            .eq("enterprise_id", enterprise_id)
            .order("created_at", { ascending: false });

          if (listError) throw listError;
          return res.status(200).json(listData);

        case "POST":
          if (customHandlers.POST) {
            const data = await customHandlers.POST(supabase, user_id, enterprise_id, req);
            return res.status(201).json(data);
          }

          const { data: createdData, error: createError } = await supabase
            .from(tableName)
            .insert({
              ...req.body,
              user_id,
              enterprise_id,
            })
            .select()
            .single();

          if (createError) throw createError;
          return res.status(201).json(createdData);

        case "DELETE":
          if (customHandlers.DELETE) {
            await customHandlers.DELETE(supabase, user_id, req);
            return res.status(204).end();
          }

          const { ids } = req.body;
          if (!Array.isArray(ids) || ids.length === 0) {
            return res
              .status(400)
              .json({ message: "Invalid request body: 'ids' array is required." });
          }

          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .in("id", ids)
            .eq("enterprise_id", enterprise_id);

          if (deleteError) throw deleteError;
          return res.status(204).end();

        default:
          res.setHeader("Allow", ["GET", "POST", "DELETE"]);
          return res.status(405).json({ message: `Method ${req.method} not allowed` });
      }
    } catch (error: any) {
      console.error(`Error in ${req.method} /api/resource/${tableName}:`, error);
      const message = error.message || `Error handling ${req.method} for ${tableName}`;
      const status = typeof error.status === "number" ? error.status : 400;
      return res.status(status).json({ message });
    }
  };
}

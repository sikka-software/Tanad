import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("user", user);
  try {
    switch (req.method) {
      case "GET":
        const { data: users, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        return res.status(200).json(users);

      case "POST":
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert(req.body)
          .select()
          .single();

        if (createError) throw createError;
        return res.status(201).json(created);

      case "DELETE":
        const { ids } = req.body;
        const { error: deleteError } = await supabase.from("profiles").delete().in("id", ids);

        if (deleteError) throw deleteError;
        return res.status(200).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Users API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

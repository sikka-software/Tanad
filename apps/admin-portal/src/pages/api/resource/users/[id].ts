import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });

  // Get user session
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  if (authError || !session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        const { data: user, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json(user);

      case "PUT":
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .update(req.body)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json(updated);

      case "DELETE":
        const { error: deleteError } = await supabase.from("profiles").delete().eq("id", id);

        if (deleteError) throw deleteError;
        return res.status(200).end();

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("User API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

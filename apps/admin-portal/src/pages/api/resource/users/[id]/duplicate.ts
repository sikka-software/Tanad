import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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
    // 1. Get the original user
    const { data: originalUser, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!originalUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Create a duplicate user with modified data
    const { id: _, created_at: __, updated_at: ___, ...duplicateData } = originalUser;
    duplicateData.email = `${duplicateData.email.split("@")[0]}_copy@${duplicateData.email.split("@")[1]}`;

    const { data: duplicatedUser, error: createError } = await supabase
      .from("profiles")
      .insert(duplicateData)
      .select()
      .single();

    if (createError) throw createError;
    return res.status(201).json(duplicatedUser);
  } catch (error) {
    console.error("User duplication error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

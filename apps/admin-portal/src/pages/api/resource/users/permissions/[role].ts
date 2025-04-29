import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

interface RolePermission {
  permission: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
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

  const { role } = req.query;
  if (!role || Array.isArray(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("permission")
      .eq("role", role);

    if (error) throw error;
    return res.status(200).json(data?.map((p: RolePermission) => p.permission) || []);
  } catch (error) {
    console.error("User permissions error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

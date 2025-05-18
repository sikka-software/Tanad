import { NextApiRequest, NextApiResponse } from "next";

import createClient from "@/utils/supabase/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const supabase = createClient(req, res);

    const { data, error } = await supabase.rpc("check_employee_has_requests", {
      employee_ids: ids,
    });

    if (error) {
      console.error("Error checking employee requests:", error);
      return res.status(500).json({ error: "Failed to check employee requests" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in check_requests handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

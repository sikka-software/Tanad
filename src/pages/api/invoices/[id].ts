import { NextApiRequest, NextApiResponse } from "next";
import { Invoice } from "@/types/invoice.type";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Invoice | { error: string }>
) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Invoice not found" });

    return res.status(200).json(data as Invoice);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
} 
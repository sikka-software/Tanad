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
        // First get the user's profile to get their enterprise_id
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("enterprise_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!userProfile?.enterprise_id) {
          return res.status(400).json({ error: "User is not associated with an enterprise" });
        }

        // Then fetch all users from the same enterprise
        const { data: users, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("enterprise_id", userProfile.enterprise_id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        return res.status(200).json(users);

      case "POST":
        // Get the user's enterprise_id for creating new user
        const { data: creatorProfile, error: creatorProfileError } = await supabase
          .from("profiles")
          .select("enterprise_id")
          .eq("id", user.id)
          .single();

        if (creatorProfileError) throw creatorProfileError;
        if (!creatorProfile?.enterprise_id) {
          return res.status(400).json({ error: "User is not associated with an enterprise" });
        }

        // Add enterprise_id to the new user data
        const userData = {
          ...req.body,
          enterprise_id: creatorProfile.enterprise_id,
        };

        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert(userData)
          .select()
          .single();

        if (createError) throw createError;
        return res.status(201).json(created);

      case "DELETE":
        const { ids } = req.body;

        // Verify all users belong to the same enterprise as the requester
        const { data: requesterProfile, error: requesterProfileError } = await supabase
          .from("profiles")
          .select("enterprise_id")
          .eq("id", user.id)
          .single();

        if (requesterProfileError) throw requesterProfileError;
        if (!requesterProfile?.enterprise_id) {
          return res.status(400).json({ error: "User is not associated with an enterprise" });
        }

        // Only delete users from the same enterprise
        const { error: deleteError } = await supabase
          .from("profiles")
          .delete()
          .in("id", ids)
          .eq("enterprise_id", requesterProfile.enterprise_id);

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

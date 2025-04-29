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
        console.log("enterprise users are users", users?.length);
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

        const { email, password, role, first_name, last_name } = req.body;

        if (!email || !password || !role || !first_name || !last_name) {
          return res.status(400).json({
            error: "Missing required fields",
            details: "Email, password, role, first name, and last name are required",
          });
        }

        // First create the auth user using the admin client
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) throw authError;
        if (!authData.user) {
          throw new Error("Failed to create auth user");
        }

        // Then create the profile with the auth user's ID
        const userData = {
          id: authData.user.id,
          user_id: authData.user.id,
          email,
          role,
          first_name,
          last_name,
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

        // First delete the auth users using the admin client
        for (const id of ids) {
          const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);
          if (deleteAuthError) throw deleteAuthError;
        }

        // Then delete the profiles
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

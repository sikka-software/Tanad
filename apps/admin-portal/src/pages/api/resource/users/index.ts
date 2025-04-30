import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-admin";

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
        // First get the user's membership to find their enterprise_id
        const { data: userMembership, error: membershipError } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user.id)
          .single();

        if (membershipError) {
          console.error("Membership Error:", membershipError);
          if (membershipError.code === "PGRST116") {
            // Resource not found
            return res.status(400).json({ error: "User is not associated with an enterprise" });
          }
          throw membershipError;
        }
        if (!userMembership?.enterprise_id) {
          return res.status(400).json({ error: "User is not associated with an enterprise" });
        }

        const enterpriseId = userMembership.enterprise_id;

        // Then fetch all profile_ids belonging to that enterprise from memberships
        const { data: enterpriseMemberships, error: enterpriseMembershipsError } = await supabase
          .from("memberships")
          .select("profile_id")
          .eq("enterprise_id", enterpriseId);

        if (enterpriseMembershipsError) {
          console.error("Enterprise Memberships Error:", enterpriseMembershipsError);
          throw enterpriseMembershipsError;
        }

        const profileIds = enterpriseMemberships?.map((m) => m.profile_id) || [];

        if (profileIds.length === 0) {
          return res.status(200).json([]); // No users found for this enterprise
        }

        // Finally, fetch the profiles for these IDs
        const { data: users, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileIds) // Use 'in' operator with the list of profile IDs
          .order("created_at", { ascending: false });

        console.log(`Fetched ${users?.length ?? 0} users for enterprise ${enterpriseId}`);
        if (fetchError) {
          console.error("Fetch Profiles Error:", fetchError);
          throw fetchError;
        }
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

        // First get or create the role
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select()
          .eq("name", role)
          .eq("enterprise_id", creatorProfile.enterprise_id)
          .single();

        if (roleError) {
          // Role doesn't exist, create it
          const { data: newRole, error: createRoleError } = await supabase
            .from("roles")
            .insert({
              name: role,
              enterprise_id: creatorProfile.enterprise_id,
            })
            .select()
            .single();

          if (createRoleError) throw createRoleError;

          // Create user_roles entry with the new role
          const { error: userRoleError } = await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role_id: newRole.id,
            enterprise_id: creatorProfile.enterprise_id,
          });

          if (userRoleError) throw userRoleError;
        } else {
          // Role exists, use it
          const { error: userRoleError } = await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role_id: roleData.id,
            enterprise_id: creatorProfile.enterprise_id,
          });

          if (userRoleError) throw userRoleError;
        }

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

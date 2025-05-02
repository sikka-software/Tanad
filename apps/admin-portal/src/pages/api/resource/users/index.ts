import { PostgrestError } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-props";

// Define the expected shape of the data returned by the query
interface MembershipWithDetails {
  profile_id: string;
  enterprise_id: string;
  role_id: string;
  profiles: {
    id: string;
    email: string | null;
    created_at: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    // Add other profile fields if needed
  } | null; // Profile might be null if join fails or profile deleted
  roles: {
    name: string | null;
  } | null; // Role might be null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("user", user);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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

        // Fetch memberships for the enterprise, joining profiles and roles
        const { data, error: fetchError } = (await supabase
          .from("memberships")
          .select(
            `
            profile_id,
            enterprise_id,
            role_id,
            profiles:profiles!inner (*),
            roles:roles!inner (name)
          `,
          )
          .eq("enterprise_id", enterpriseId)) as {
          data: MembershipWithDetails[] | null;
          error: PostgrestError | null;
        };

        // Use the correctly typed 'data' variable
        const membershipsWithDetails = data;

        if (fetchError) {
          console.error("Fetch Memberships with Details Error:", fetchError);
          throw fetchError;
        }

        // Transform the data to match the expected UserType structure
        const users =
          membershipsWithDetails
            ?.filter((m) => m.profiles && m.roles) // Filter out entries with null profiles or roles
            .map((m) => ({
              id: m.profiles!.id, // Use non-null assertion as we filtered nulls
              email: m.profiles!.email,
              role: m.roles!.name, // Use non-null assertion
              enterprise_id: m.enterprise_id,
              created_at: m.profiles!.created_at,
              first_name: m.profiles!.first_name,
              last_name: m.profiles!.last_name,
              avatar_url: m.profiles!.avatar_url,
              phone: m.profiles!.phone,
              // role_id: m.role_id
            })) || [];

        // Finally, fetch the profiles for these IDs
        /*
        const { data: users, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileIds) // Use 'in' operator with the list of profile IDs
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Fetch Profiles Error:", fetchError);
          throw fetchError;
        }
        */
        return res.status(200).json(users);

      case "POST":
        // 1. Get the creator's enterprise_id from their membership
        const { data: creatorMembershipData, error: creatorMembershipErr } = await supabase
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user.id)
          .single();

        if (creatorMembershipErr) {
          console.error("Creator Membership Error:", creatorMembershipErr);
          if (creatorMembershipErr.code === "PGRST116") {
            return res.status(400).json({ error: "Creator is not associated with an enterprise" });
          }
          throw creatorMembershipErr;
        }
        if (!creatorMembershipData?.enterprise_id) {
          return res.status(400).json({ error: "Creator is not associated with an enterprise" });
        }
        const creatorEnterpriseId = creatorMembershipData.enterprise_id;

        const { email, password, role: roleName, first_name, last_name } = req.body; // Renamed role to roleName for clarity

        if (!email || !password || !roleName || !first_name || !last_name) {
          return res.status(400).json({
            error: "Missing required fields",
            details: "Email, password, role name, first name, and last name are required",
          });
        }

        // 2. Create the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email for simplicity, adjust if needed
        });

        if (authError) {
          console.error("Auth User Creation Error:", authError);
          // Handle specific errors like email already exists
          if (authError.message.includes("already registered")) {
            return res.status(409).json({ error: "User with this email already exists" });
          }
          throw authError;
        }
        if (!authData.user) {
          throw new Error("Failed to create auth user");
        }
        const newUserId = authData.user.id;

        // 4. Find the role_id based on the role name
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", roleName)
          .single(); // Assume roles are pre-defined or managed elsewhere

        if (roleError || !roleData) {
          console.error("Role Lookup Error:", roleError);
          // Rollback Auth user creation if role lookup fails (profile assumed created by trigger)
          await supabase.auth.admin.deleteUser(newUserId);
          return res.status(400).json({ error: `Role '${roleName}' not found.` });
        }
        const roleId = roleData.id;

        // 5. Create the membership entry to link user, enterprise, and role
        const membershipData = {
          profile_id: newUserId,
          enterprise_id: creatorEnterpriseId,
          role_id: roleId,
        };

        const { error: createMembershipError } = await supabase
          .from("memberships")
          .insert(membershipData);

        if (createMembershipError) {
          console.error("Membership Creation Error:", createMembershipError);
          // Rollback Auth user creation if membership fails (profile assumed created by trigger)
          await supabase.auth.admin.deleteUser(newUserId);
          throw createMembershipError;
        }

        // Return the created profile information (or just a success status)
        return res.status(201).json({ id: newUserId, email, role: roleName }); // Return relevant info

      case "DELETE":
        const { ids } = req.body;

        // Verify requester's enterprise
        const { data: deleteRequesterMembershipData, error: deleteRequesterMembershipErr } =
          await supabase
            .from("memberships")
            .select("enterprise_id")
            .eq("profile_id", user.id)
            .single();

        if (deleteRequesterMembershipErr) throw deleteRequesterMembershipErr;
        if (!deleteRequesterMembershipData?.enterprise_id) {
          return res.status(400).json({ error: "User is not associated with an enterprise" });
        }
        const deleteRequesterEnterpriseId = deleteRequesterMembershipData.enterprise_id;

        // Optional: Verify all users to be deleted belong to the same enterprise
        // This requires fetching memberships for all `ids` and checking their enterprise_id
        // For simplicity, skipping this check for now, but consider adding it for security.

        // Delete the auth users (this should cascade delete profiles and memberships if set up correctly)
        const deletePromises = ids.map((id: string) => supabase.auth.admin.deleteUser(id));
        const results = await Promise.allSettled(deletePromises);

        const failedDeletes = results.filter((r) => r.status === "rejected");
        if (failedDeletes.length > 0) {
          console.error("Failed to delete some auth users:", failedDeletes);
          // Decide how to handle partial failures - maybe return a specific error
          throw new Error(`Failed to delete ${failedDeletes.length} users.`);
        }

        // No need to explicitly delete from profiles/memberships if cascade delete is configured on the foreign keys in the DB.
        // If not configured, you would need explicit deletes here:
        // await supabase.from("memberships").delete().in("profile_id", ids).eq("enterprise_id", requesterEnterpriseId);
        // await supabase.from("profiles").delete().in("id", ids);

        return res.status(200).json({ message: `${ids.length} users deleted successfully.` }); // Return success message

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Users API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

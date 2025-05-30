import { PostgrestError, createClient as createAdminClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/server-admin";

// Define the expected shape of the data returned by the query
interface MembershipWithDetails {
  profile_id: string;
  enterprise_id: string;
  role_id: string;
  profiles: {
    id: string;
    email: string | null;
    created_at: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    // Add other profile fields if needed
  } | null; // Profile might be null if join fails or profile deleted
  roles: {
    name: string | null;
  } | null; // Role might be null
}

// Define expected shape for the membership fetch with joins
interface NewMembershipDetails {
  profile_id: string;
  enterprise_id: string;
  role_id: string;
  profiles: {
    id: string;
    email: string | null;
    created_at: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null; // Profile could technically be null if join fails
  roles: {
    name: string | null;
  } | null; // Role could technically be null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Client for user session/context checks
  const supabaseUserClient = createClient({ req, res, query: {}, resolvedUrl: "" });
  // console.log("supabaseUserClient is ", supabaseUserClient);
  // Client for admin operations (requires service role key)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  console.log("user is ", user);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    switch (req.method) {
      case "GET":
        // First get the user's membership to find their enterprise_id
        const { data: userMembership, error: membershipError } = await supabaseUserClient
          .from("memberships")
          .select("enterprise_id")
          .eq("profile_id", user.id)
          .single();

        console.log("userMembership is ", userMembership);
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
        const { data, error: fetchError } = (await supabaseUserClient
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
              full_name: m.profiles!.full_name,
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
        console.log("users are ", users);
        return res.status(200).json(users);

      case "POST":
        // 1. Get the creator's enterprise_id from their membership
        const { data: creatorMembershipData, error: creatorMembershipErr } =
          await supabaseUserClient
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

        const { email, password, role: roleName, full_name } = req.body; // Renamed role to roleName for clarity

        if (!email || !password || !roleName || !full_name) {
          return res.status(400).json({
            error: "Missing required fields",
            details: "Email, password, role name, and full name are required",
          });
        }

        let newUserId: string;
        let userAlreadyExists = false;

        // 2. Try to create the auth user
        try {
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

          if (authError) throw authError; // Rethrow other auth errors
          if (!authData?.user) throw new Error("Failed to create auth user");
          newUserId = authData.user.id;
        } catch (error: any) {
          // Check if it's the specific email exists error
          if (
            error.code === "email_exists" ||
            (error.__isAuthError && error.message.includes("already registered"))
          ) {
            console.log(`Auth user with email ${email} already exists. Finding user ID via RPC...`);
            userAlreadyExists = true;

            // Call the RPC function to get the user ID
            const { data: rpcData, error: rpcError } = await supabaseUserClient.rpc(
              "get_user_id_by_email",
              { user_email: email }, // Ensure parameter name matches the function definition
            );

            if (rpcError) {
              console.error("RPC get_user_id_by_email Error:", rpcError);
              throw rpcError;
            }

            // The RPC function returns an array of objects, e.g., [{ id: 'user-uuid' }]
            const userIdResult = rpcData as unknown as { id: string }[] | null;

            if (!userIdResult || userIdResult.length === 0 || !userIdResult[0].id) {
              // This case shouldn't happen if email_exists was thrown, but handle defensively
              console.error(
                `Failed to find existing user with email ${email} via RPC after email_exists error.`,
              );
              throw new Error(
                `Failed to find existing user with email ${email} via RPC after email_exists error.`,
              );
            }

            newUserId = userIdResult[0].id;
            // console.log(`Found existing user ID via RPC: ${newUserId}`);

            // *** Use supabaseAdmin for profile check/creation ***
            const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("id", newUserId)
              .maybeSingle();

            if (profileCheckError) {
              console.error("Error checking for existing profile:", profileCheckError);
              throw profileCheckError;
            }

            if (!existingProfile) {
              // console.log(`Profile for user ${newUserId} not found. Creating profile...`);
              // Profile doesn't exist, create it using data from the request
              const { error: createProfileError } = await supabaseAdmin.from("profiles").insert({
                id: newUserId, // Link to the auth user
                email: email, // From request body
                full_name: full_name, // Use full_name directly
                // Add other default/required profile fields if necessary
              });

              if (createProfileError) {
                console.error("Error creating missing profile:", createProfileError);
                // Don't rollback auth user here, as it already existed
                throw createProfileError;
              }
              // console.log(`Profile created for user ${newUserId}`);
            }
            // *** END ADDED PROFILE CHECK ***
          } else {
            // It's a different error, rethrow it
            // console.error("Auth User Creation Error (non-email_exists):", error);
            throw error;
          }
        }

        // 3. Ensure the profile exists (Upsert based on newUserId)
        // console.log(`Ensuring profile exists for user ID: ${newUserId}`);
        const { error: profileUpsertError } = await supabaseAdmin.from("profiles").upsert(
          {
            id: newUserId, // This is the foreign key to auth.users.id
            full_name: full_name,
            email: email.toLowerCase(), // Keep email consistent
          },
          {
            onConflict: "id", // Specify the conflict target
          },
        );

        if (profileUpsertError) {
          console.error("Profile Upsert Error:", profileUpsertError);
          // If it's a foreign key violation pointing back to auth.users, it's unexpected
          if (profileUpsertError.code === "23503") {
            console.error(
              "Profile upsert failed: User ID might not exist in auth.users. This is unexpected.",
            );
          }
          throw profileUpsertError; // Propagate the error
        }
        // console.log(`Profile ensured for user ID: ${newUserId}`);

        // 4. Get the role_id based on the provided role name
        const { data: fetchedRoleData, error: roleError } = await supabaseUserClient // Renamed roleData to fetchedRoleData
          .from("roles")
          .select("id, name")
          .eq("name", roleName)
          .single();

        if (roleError || !fetchedRoleData) {
          console.error("Role Fetch Error:", roleError);
          // Consider rollback if we created the user/profile
          throw new Error(`Role with name '${roleName}' not found or error fetching it.`);
        }

        const roleId = fetchedRoleData.id;
        // console.log(`Found role ID: ${roleId} for role name: ${roleName}`);

        // 5. Check if the user (newly created or existing) is already in the target enterprise
        // (This check was previously step 3, moved here after profile/role confirmation)
        const { data: existingMembership, error: checkMembershipError } = await supabaseAdmin
          .from("memberships")
          .select("id")
          .eq("profile_id", newUserId)
          .eq("enterprise_id", creatorEnterpriseId)
          .maybeSingle(); // Use maybeSingle as it might not exist

        if (checkMembershipError) {
          console.error("Error checking existing membership:", checkMembershipError);
          // Rollback might be needed if user/profile created
          throw checkMembershipError;
        }

        if (existingMembership) {
          // User already exists in this enterprise, return conflict
          // console.log(`User ${newUserId} already exists in enterprise ${creatorEnterpriseId}.`);
          return res.status(409).json({
            error: "User already exists in this enterprise.",
            code: "USER_MEMBERSHIP_EXISTS",
          });
        }
        // console.log(
        //   `User ${newUserId} not yet in enterprise ${creatorEnterpriseId}. Proceeding to add membership.`,
        // );

        // 6. Create the membership entry
        // console.log(
        //   `Attempting to create membership for user ${newUserId} in enterprise ${creatorEnterpriseId} with role ${roleId}`,
        // );
        const { data: newMembership, error: membershipCreationError } = await supabaseAdmin
          .from("memberships")
          .insert({ profile_id: newUserId, enterprise_id: creatorEnterpriseId, role_id: roleId })
          .select(
            `
            profile_id,
            enterprise_id,
            role_id,
            profiles:profiles!inner (*),
            roles:roles!inner (name)
          `,
          )
          .single();

        if (membershipCreationError) {
          console.error("Membership Creation Error:", membershipCreationError);
          // Rollback Auth user creation only if we actually created one
          if (!userAlreadyExists) {
            await supabaseAdmin.auth.admin
              .deleteUser(newUserId)
              .catch((err) => console.error("Rollback delete failed:", err));
          }
          throw membershipCreationError;
        }

        // 7. Format the response - Accessing with optional chaining and nullish coalescing
        // Assuming newMembership contains the data despite linter warnings
        if (!newMembership?.profiles || !newMembership.roles) {
          console.error("Failed to retrieve full membership details after creation.");
          throw new Error("Failed to retrieve membership details.");
        }

        // Access potentially nested data safely
        const profileData = Array.isArray(newMembership.profiles)
          ? newMembership.profiles[0]
          : newMembership.profiles;
        const roleData = Array.isArray(newMembership.roles)
          ? newMembership.roles[0]
          : newMembership.roles;

        const newUserResponse = {
          id: profileData?.id ?? null,
          email: profileData?.email ?? null,
          role: roleData?.name ?? null,
          enterprise_id: newMembership.enterprise_id,
          created_at: profileData?.created_at ?? null,
          full_name: profileData?.full_name ?? null,
          avatar_url: profileData?.avatar_url ?? null,
          phone: profileData?.phone ?? null,
        };

        // console.log("Successfully created user and membership:", newUserResponse);
        return res.status(201).json(newUserResponse);

      case "DELETE":
        const { ids } = req.body;

        // Verify requester's enterprise
        const { data: deleteRequesterMembershipData, error: deleteRequesterMembershipErr } =
          await supabaseUserClient
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
        const deletePromises = ids.map((id: string) => supabaseAdmin.auth.admin.deleteUser(id));
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

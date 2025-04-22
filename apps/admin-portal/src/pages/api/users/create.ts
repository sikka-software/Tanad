import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client with service role key
// IMPORTANT: Ensure these environment variables are set in your Vercel/hosting environment
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

type ProfileInsert = {
  user_id: string;
  email: string;
  role: string;
  enterprise_id: string;
  first_name: string;
  last_name: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // TODO: Add proper authorization check here!
  // Example: Get the requesting user's session and check their role/permissions
  // const { data: { user: requestingUser } } = await supabaseClient.auth.getUser();
  // if (!requestingUser || !userHasPermissionToCreate(requestingUser)) {
  //    return res.status(403).json({ message: 'Forbidden: You do not have permission to create users.' });
  // }

  const { email, password, role, enterprise_id, firstName, lastName } = req.body;

  // Basic validation
  if (!email || !password || !role || !enterprise_id || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "Missing required fields: email, password, role, enterprise_id, firstName, lastName" });
  }

  try {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for simplicity, adjust as needed
      // You might want to add user_metadata here if necessary
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      // Provide a more specific error message if possible
      const message = authError.message.includes("unique constraint")
        ? "User with this email already exists."
        : "Failed to create user authentication.";
      return res.status(409).json({ message, details: authError.message }); // 409 Conflict is often suitable
    }

    if (!authData || !authData.user) {
      throw new Error("User creation did not return expected data.");
    }

    // 2. Create the user profile in the 'profiles' table
    const profileData: ProfileInsert = {
      user_id: authData.user.id,
      email: authData.user.email!,
      role,
      enterprise_id,
      first_name: firstName,
      last_name: lastName,
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error("Supabase Profile Error:", profileError);
      // IMPORTANT: Consider rolling back the auth user creation if profile insertion fails
      // await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res
        .status(500)
        .json({ message: "Failed to create user profile.", details: profileError.message });
    }

    // 3. Return the created profile (or just success status)
    return res.status(201).json(profile); // 201 Created
  } catch (error) {
    console.error("User Creation Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred during user creation.";
    return res.status(500).json({ message });
  }
}

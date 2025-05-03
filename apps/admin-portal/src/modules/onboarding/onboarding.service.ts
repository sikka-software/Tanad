import { createClient } from "@/utils/supabase/component";

import type { Enterprise, EnterpriseCreateData } from "./onboarding.type";

export class OnboardingService {
  // Remove TABLE_NAME, not needed for RPC
  // private static readonly TABLE_NAME = "user_enterprises";

  static async createEnterprise(data: EnterpriseCreateData) {
    const supabase = createClient();

    try {
      // Get the current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Step 1: Check if system roles exist, create them if not
      const { count, error: countError } = await supabase
        .from("roles")
        .select("*", { count: "exact", head: true })
        .eq("is_system", true);

      if (countError) throw countError;

      // Create system roles if none exist
      if (!count || count === 0) {
        // Create system roles
        const systemRoles = [
          {
            name: "Admin",
            description: "Full administrator with all permissions",
            is_system: true,
          },
          {
            name: "User",
            description: "Standard user with basic permissions",
            is_system: true,
          },
        ];

        const { error: rolesError } = await supabase.from("roles").insert(systemRoles);

        if (rolesError) throw rolesError;
      }

      // Step 2: Create a new enterprise
      const { data: enterpriseData, error: enterpriseError } = await supabase
        .from("enterprises")
        .insert({
          name: data.name,
          email: data.email,
          industry: data.industry,
          size: data.size,
        })
        .select()
        .single();

      if (enterpriseError) throw enterpriseError;
      if (!enterpriseData) throw new Error("Failed to create enterprise");

      // Step 3: Update the user's profile with the enterprise_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ enterprise_id: enterpriseData.id })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Step 4: Get the admin role ID
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "Admin")
        .eq("is_system", true)
        .single();

      if (roleError) {
        console.error("Error fetching admin role:", roleError);
        // If there's no admin role, try to get any available system role
        const { data: anyRoleData, error: anyRoleError } = await supabase
          .from("roles")
          .select("id")
          .eq("is_system", true)
          .limit(1)
          .single();

        if (anyRoleError) throw new Error("No system roles found. Please set up roles first.");
        if (!anyRoleData) throw new Error("No roles available");

        var roleId = anyRoleData.id;
      } else {
        var roleId = roleData.id;
      }

      // Step 5: Create membership record for the user
      const { error: membershipError } = await supabase.from("memberships").insert({
        profile_id: userId,
        enterprise_id: enterpriseData.id,
        role_id: roleId,
      });

      if (membershipError) throw membershipError;

      // Step 6: Create permissions for the admin role if they don't exist
      if (roleId) {
        const { count: permCount, error: permCountError } = await supabase
          .from("permissions")
          .select("*", { count: "exact", head: true })
          .eq("role_id", roleId);

        if (permCountError) throw permCountError;

        // If no permissions exist for this role, create them
        if (!permCount || permCount === 0) {
          // Basic permission set
          const permissions = [
            "users.create",
            "users.read",
            "users.update",
            "users.delete",
            "enterprises.read",
            "enterprises.update",
            "roles.read",
          ].map((permission) => ({
            role_id: roleId,
            permission,
          }));

          const { error: permError } = await supabase.from("permissions").insert(permissions);

          if (permError) throw permError;
        }
      }

      return enterpriseData as Enterprise;
    } catch (error) {
      console.error("Error in createEnterprise:", error);
      throw error;
    }
  }
}

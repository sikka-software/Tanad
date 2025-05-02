import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment variables.",
  );
  process.exit(1);
}

// Initialize Supabase client with service_role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Prevent client from trying to use user sessions
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Define the system roles and their desired permissions
const systemRolePermissions: Record<string, string[]> = {
  superadmin: [
    "companies.read",
    "companies.create",
    "companies.delete",
    "companies.update",
    "companies.duplicate",
    "companies.export",
    "users.read",
    "users.invite",
    "users.update",
    "users.delete",
    "roles.create",
    "roles.read",
    "roles.update",
    "roles.delete",
    "permissions.create",
    "permissions.read",
    "permissions.update",
    "permissions.delete",
    // Add any other superadmin permissions here
  ],
  human_resources: [
    "users.read",
    "users.invite",
    "roles.read",
    // Add HR-specific permissions here
  ],
  accounting: [
    "invoices.read",
    "invoices.create",
    "invoices.delete",
    // Add accounting-specific permissions here
  ],
  // Add other system roles if needed
};

async function seedPermissions() {
  console.log("Starting permission seeding for system roles...");

  try {
    const roleNames = Object.keys(systemRolePermissions);

    // 1. Fetch the system roles by name
    console.log(`Fetching system roles: ${roleNames.join(", ")}...`);
    const { data: roles, error: fetchError } = await supabase
      .from("roles")
      .select("id, name")
      .in("name", roleNames)
      .eq("is_system", true); // Ensure we only get system roles

    if (fetchError) {
      throw new Error(`Error fetching roles: ${fetchError.message}`);
    }

    if (!roles || roles.length === 0) {
      console.warn("No system roles found matching the defined names. Exiting.");
      return;
    }

    console.log(`Found ${roles.length} system roles.`);

    const roleIds = roles.map((role) => role.id);

    // 2. Delete existing permissions for these roles to ensure a clean slate
    console.log("Deleting existing permissions for these roles...");
    const { error: deleteError } = await supabase
      .from("permissions")
      .delete()
      .in("role_id", roleIds);

    if (deleteError) {
      throw new Error(`Error deleting existing permissions: ${deleteError.message}`);
    }
    console.log("Existing permissions deleted successfully.");

    // 3. Prepare and insert new permissions
    const permissionsToInsert: { role_id: string; permission: string }[] = [];
    for (const role of roles) {
      const permissions = systemRolePermissions[role.name];
      if (permissions) {
        // Use a Set to ensure uniqueness within the script logic itself
        const uniquePermissions = [...new Set(permissions)];
        uniquePermissions.forEach((permission) => {
          permissionsToInsert.push({ role_id: role.id, permission });
        });
        console.log(
          `Prepared ${uniquePermissions.length} permissions for role: ${role.name} (ID: ${role.id})`,
        );
      } else {
        console.warn(`No permissions defined for role: ${role.name}`);
      }
    }

    if (permissionsToInsert.length > 0) {
      console.log(`Inserting ${permissionsToInsert.length} new permissions...`);
      const { error: insertError } = await supabase.from("permissions").insert(permissionsToInsert);

      if (insertError) {
        // Check for unique constraint violation (code 23505 for PostgreSQL)
        if (insertError.code === "23505") {
          console.error(
            "Error inserting permissions: Duplicate permission detected. This might indicate a conflict that deletion couldnt resolve or an issue with the script logic.",
            insertError,
          );
        } else {
          throw new Error(`Error inserting permissions: ${insertError.message}`);
        }
      } else {
        console.log("New permissions inserted successfully.");
      }
    } else {
      console.log("No new permissions to insert.");
    }

    console.log("Permission seeding completed successfully!");
  } catch (error) {
    console.error("Permission seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedPermissions();

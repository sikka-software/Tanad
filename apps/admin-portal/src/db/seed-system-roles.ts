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
    "activity_logs.read",
    "activity_logs.delete",
    "activity_logs.export",

    "users.read",
    "users.invite",
    "users.create",
    "users.update",
    "users.delete",
    "users.export",
    "users.duplicate",

    "roles.create",
    "roles.read",
    "roles.update",
    "roles.delete",
    "roles.duplicate",
    "roles.export",

    "employees.read",
    "employees.create",
    "employees.delete",
    "employees.update",
    "employees.duplicate",
    "employees.export",

    "departments.read",
    "departments.create",
    "departments.delete",
    "departments.update",
    "departments.duplicate",
    "departments.export",

    "employee_requests.read",
    "employee_requests.create",
    "employee_requests.delete",
    "employee_requests.update",
    "employee_requests.duplicate",
    "employee_requests.export",

    "jobs.read",
    "jobs.create",
    "jobs.delete",
    "jobs.update",
    "jobs.duplicate",
    "jobs.export",

    "job_listings.read",
    "job_listings.create",
    "job_listings.delete",
    "job_listings.update",
    "job_listings.duplicate",
    "job_listings.export",

    "salaries.read",
    "salaries.create",
    "salaries.delete",
    "salaries.update",
    "salaries.duplicate",
    "salaries.export",

    "clients.read",
    "clients.create",
    "clients.delete",
    "clients.update",
    "clients.duplicate",
    "clients.export",

    "expenses.read",
    "expenses.create",
    "expenses.delete",
    "expenses.update",
    "expenses.duplicate",
    "expenses.export",

    "offices.read",
    "offices.create",
    "offices.delete",
    "offices.update",
    "offices.duplicate",
    "offices.export",

    "warehouses.read",
    "warehouses.create",
    "warehouses.delete",
    "warehouses.update",
    "warehouses.duplicate",
    "warehouses.export",

    "products.read",
    "products.create",
    "products.delete",
    "products.update",
    "products.duplicate",
    "products.export",

    "invoices.read",
    "invoices.create",
    "invoices.delete",
    "invoices.update",
    "invoices.duplicate",
    "invoices.export",

    "quotes.read",
    "quotes.create",
    "quotes.delete",
    "quotes.update",
    "quotes.duplicate",
    "quotes.export",

    "vendors.read",
    "vendors.create",
    "vendors.delete",
    "vendors.update",
    "vendors.duplicate",
    "vendors.export",

    "branches.read",
    "branches.create",
    "branches.delete",
    "branches.update",
    "branches.duplicate",
    "branches.export",

    "companies.read",
    "companies.create",
    "companies.delete",
    "companies.update",
    "companies.duplicate",
    "companies.export",

    "purchases.read",
    "purchases.create",
    "purchases.delete",
    "purchases.update",
    "purchases.duplicate",
    "purchases.export",

    "domains.read",
    "domains.create",
    "domains.delete",
    "domains.update",
    "domains.export",

    "servers.read",
    "servers.create",
    "servers.delete",
    "servers.update",
    "servers.duplicate",
    "servers.export",

    "websites.read",
    "websites.create",
    "websites.delete",
    "websites.update",
    "websites.duplicate",
    "websites.export",

    "online_stores.read",
    "online_stores.create",
    "online_stores.delete",
    "online_stores.update",
    "online_stores.duplicate",
    "online_stores.export",

    "cars.read",
    "cars.create",
    "cars.delete",
    "cars.update",
    "cars.export",
    "cars.duplicate",

    "trucks.read",
    "trucks.create",
    "trucks.delete",
    "trucks.update",
    "trucks.export",
    "trucks.duplicate",
  ],
  human_resources: [
    "employees.read",
    "employees.create",
    "employees.delete",
    "employees.update",
    "employees.duplicate",
    "employees.export",

    "employee_requests.read",
    "employee_requests.create",
    "employee_requests.delete",
    "employee_requests.update",
    "employee_requests.duplicate",
    "employee_requests.export",

    "departments.read",
    "departments.create",
    "departments.delete",
    "departments.update",
    "departments.duplicate",
    "departments.export",

    "jobs.read",
    "jobs.create",
    "jobs.delete",
    "jobs.update",
    "jobs.duplicate",
    "jobs.export",

    "job_listings.read",
    "job_listings.create",
    "job_listings.delete",
    "job_listings.update",
    "job_listings.duplicate",
    "job_listings.export",

    "salaries.read",
    "salaries.create",
    "salaries.delete",
    "salaries.update",
    "salaries.duplicate",
    "salaries.export",

    // Add HR-specific permissions here
  ],
  accounting: [
    "clients.read",
    "clients.create",
    "clients.delete",
    "clients.update",
    "clients.duplicate",
    "clients.export",

    "expenses.read",
    "expenses.create",
    "expenses.delete",
    "expenses.update",
    "expenses.duplicate",
    "expenses.export",

    "offices.read",
    "offices.create",
    "offices.delete",
    "offices.update",
    "offices.duplicate",
    "offices.export",

    "warehouses.read",
    "warehouses.create",
    "warehouses.delete",
    "warehouses.update",
    "warehouses.duplicate",
    "warehouses.export",

    "products.read",
    "products.create",
    "products.delete",
    "products.update",
    "products.duplicate",
    "products.export",

    "invoices.read",
    "invoices.create",
    "invoices.delete",
    "invoices.update",
    "invoices.duplicate",
    "invoices.export",

    "quotes.read",
    "quotes.create",
    "quotes.delete",
    "quotes.update",
    "quotes.duplicate",
    "quotes.export",

    "vendors.read",
    "vendors.create",
    "vendors.delete",
    "vendors.update",
    "vendors.duplicate",
    "vendors.export",

    "branches.read",
    "branches.create",
    "branches.delete",
    "branches.update",
    "branches.duplicate",
    "branches.export",

    "companies.read",
    "companies.create",
    "companies.delete",
    "companies.update",
    "companies.duplicate",
    "companies.export",

    "purchases.read",
    "purchases.create",
    "purchases.delete",
    "purchases.update",
    "purchases.duplicate",
    "purchases.export",
    // Add accounting-specific permissions here
  ],
  it: [
    "domains.read",
    "domains.create",
    "domains.delete",
    "domains.update",
    "domains.export",

    "servers.read",
    "servers.create",
    "servers.delete",
    "servers.update",
    "servers.duplicate",
    "servers.export",

    "websites.read",
    "websites.create",
    "websites.delete",
    "websites.update",
    "websites.duplicate",
    "websites.export",

    "online_stores.read",
    "online_stores.create",
    "online_stores.delete",
    "online_stores.update",
    "online_stores.duplicate",
    "online_stores.export",
  ],
};

async function ensureSystemRolesExist() {
  const roleNames = Object.keys(systemRolePermissions);
  // Fetch existing system roles
  const { data: existingRoles, error: fetchError } = await supabase
    .from("roles")
    .select("name")
    .in("name", roleNames)
    .eq("is_system", true);

  if (fetchError) {
    throw new Error(`Error fetching roles: ${fetchError.message}`);
  }

  const existingRoleNames = (existingRoles || []).map((r) => r.name);
  const missingRoleNames = roleNames.filter((name) => !existingRoleNames.includes(name));

  if (missingRoleNames.length > 0) {
    console.log(`Inserting missing system roles: ${missingRoleNames.join(", ")}`);
    const rolesToInsert = missingRoleNames.map((name) => ({ name, is_system: true }));
    const { error: insertError } = await supabase.from("roles").insert(rolesToInsert);
    if (insertError) {
      throw new Error(`Error inserting missing roles: ${insertError.message}`);
    }
    console.log("Missing system roles inserted successfully.");
  } else {
    console.log("All system roles already exist.");
  }
}

async function seedPermissions() {
  console.log("Ensuring all system roles exist...");
  await ensureSystemRolesExist();
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

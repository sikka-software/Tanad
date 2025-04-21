import { GetServerSideProps } from "next";

import RolesList from "@/components/app/new-role-dialog";

import { createClient } from "@/utils/supabase/component";
import { Role, Permission } from "@/utils/supabase/types";

interface RolesPageProps {
  roles: Role[];
  permissions: Permission[];
}

export default function RolesPage({ roles, permissions }: RolesPageProps) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Role Management</h1>
      <p className="text-muted-foreground mb-8">
        Define roles and their permissions to control what users can do in the system.
      </p>

      <RolesList initialRoles={roles} permissions={permissions} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient();

  // Check if user is authenticated and has superadmin role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  // Fetch the user's role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect if not a superadmin
  if (!profile || profile.role !== "superadmin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Fetch all roles
  const { data: roles } = await supabase.from("roles").select().order("name", { ascending: true });

  // Fetch all permissions
  const { data: permissions } = await supabase
    .from("permissions")
    .select()
    .order("category", { ascending: true });

  return {
    props: {
      roles: roles || [],
      permissions: permissions || [],
    },
  };
};

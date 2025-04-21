import { GetStaticProps } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import UsersTable from "@/modules/user/user.table";
import { createClient } from "@/utils/supabase/component";

export default function UsersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const getCurrentUserAndEnterprises = async () => {
      // Check if user is authenticated and has superadmin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch the current user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentUser(profile);

      // Fetch all enterprises
      const { data: enterprisesData } = await supabase.from("enterprises").select("*");
      setEnterprises(enterprisesData || []);

      // Fetch all users with their roles
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(usersData || []);

      // Fetch permissions for each user
      if (usersData) {
        const permissionsMap: Record<string, string[]> = {};
        for (const user of usersData) {
          const { data: permissions } = await supabase
            .from("role_permissions")
            .select("permission")
            .eq("role", user.role);

          permissionsMap[user.id] = permissions?.map(p => p.permission) || [];
        }
        setUserPermissions(permissionsMap);
      }
    };

    getCurrentUserAndEnterprises();
  }, []);

  const handleCreateUser = async (
    email: string,
    password: string,
    role: string,
    enterpriseId: string,
  ) => {
    try {
      // Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        role,
        enterprise_id: enterpriseId,
      });

      if (profileError) throw profileError;

      // Refresh users list and permissions
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(users || []);

      // Fetch permissions for the new user
      if (users) {
        const { data: permissions } = await supabase
          .from("role_permissions")
          .select("permission")
          .eq("role", role);

        setUserPermissions(prev => ({
          ...prev,
          [authData.user.id]: permissions?.map(p => p.permission) || [],
        }));
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async (userId: string, role: string, enterpriseId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role, enterprise_id: enterpriseId })
        .eq("id", userId);

      if (error) throw error;

      // Refresh users list
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(users || []);

      // Fetch updated permissions for the user
      const { data: permissions } = await supabase
        .from("role_permissions")
        .select("permission")
        .eq("role", role);

      setUserPermissions(prev => ({
        ...prev,
        [userId]: permissions?.map(p => p.permission) || [],
      }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage all users in your enterprise. As a superadmin, you can edit user details, change
        roles, and control account access.
      </p>

      <UsersTable
        enterprises={enterprises}
        currentUser={currentUser}
        users={users}
        userPermissions={userPermissions}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

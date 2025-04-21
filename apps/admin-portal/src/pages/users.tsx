import { User } from "@supabase/supabase-js";
import { GetStaticProps } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import UsersTable, { UserType } from "@/modules/user/user.table";
import { createClient } from "@/utils/supabase/component";

export default function UsersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const getUsersAndProfiles = async () => {
      // Check if user is authenticated and has superadmin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }

      // Fetch the user's role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      // Fetch all users with their profiles
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
    };

    getUsersAndProfiles();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage all users in your enterprise. As a superadmin, you can edit user details, change
        roles, and control account access.
      </p>

      <UsersTable initialUsers={users as UserType[]} />
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

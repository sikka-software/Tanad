import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";

import { UserForm } from "@/modules/user/user.form";
import UsersTable, { UserType } from "@/modules/user/user.table";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function UsersPage() {
  const t = useTranslations();
  const supabase = createClient();
  const router = useRouter();
  const { user: currentUser, enterprise, loading: authLoading } = useUserStore();

  const [users, setUsers] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  // Fetch users data when enterprise is available
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      if (!isMounted || !enterprise?.id) {
        return;
      }

      try {
        // Fetch all users with their roles for the current enterprise
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .eq("enterprise_id", enterprise.id)
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;
        if (!isMounted) return;

        setUsers(usersData || []);

        // Fetch permissions for each user
        if (usersData) {
          const permissionsMap: Record<string, string[]> = {};
          for (const user of usersData) {
            const { data: permissions } = await supabase
              .from("role_permissions")
              .select("permission")
              .eq("role", user.role);

            if (isMounted) {
              permissionsMap[user.id] = permissions?.map((p) => p.permission) || [];
            }
          }
          if (isMounted) {
            setUserPermissions(permissionsMap);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (isMounted) {
          toast.error(t("Users.error_fetching"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (enterprise?.id) {
      fetchUsers();
    } else if (!authLoading) {
      // If not loading and no enterprise, show empty state
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [enterprise?.id, supabase, t, authLoading]);

  const handleCreateUser = async (email: string, password: string, role: string) => {
    try {
      if (!enterprise) return;

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
        enterprise_id: enterprise.id,
      });

      if (profileError) throw profileError;

      // Create the user_role entry
      const { error: userRoleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role,
        enterprise_id: enterprise.id,
      });

      if (userRoleError) throw userRoleError;

      // Refresh the users list
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .eq("enterprise_id", enterprise.id)
        .order("created_at", { ascending: false });

      setUsers(users || []);
      toast.success(t("Users.user_created"));
      setFormDialogOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(t("Users.error_creating"));
    }
  };

  const handleUpdateUser = async (user_id: string, role: string) => {
    try {
      if (!enterprise) return;

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user_id)
        .eq("enterprise_id", enterprise.id);

      if (error) throw error;

      // Refresh users list
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .eq("enterprise_id", enterprise.id)
        .order("created_at", { ascending: false });

      setUsers(users || []);

      // Fetch updated permissions for the user
      const { data: permissions } = await supabase
        .from("role_permissions")
        .select("permission")
        .eq("role", role);

      setUserPermissions((prev) => ({
        ...prev,
        [user_id]: permissions?.map((p) => p.permission) || [],
      }));

      toast.success(t("Users.user_updated"));
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(t("Users.error_updating"));
    }
  };

  // Show loading state while fetching data
  if (isLoading || authLoading) {
    return (
      <DataPageLayout>
        <PageTitle texts={{ title: t("Users.title") }} />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </DataPageLayout>
    );
  }

  // Show empty state if no enterprise
  if (!enterprise) {
    return (
      <DataPageLayout>
        <PageTitle texts={{ title: t("Users.title") }} />
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">
            No enterprise found. Please contact your administrator.
          </p>
        </div>
      </DataPageLayout>
    );
  }

  return (
    <DataPageLayout>
      <PageTitle
        texts={{ title: t("Users.title") }}
        customButton={
          <Button size="sm" onClick={() => setFormDialogOpen(true)}>
            {t("Users.add_user")}
          </Button>
        }
      />

      <UsersTable
        users={users}
        userPermissions={userPermissions}
        onUpdateUser={handleUpdateUser}
        currentUser={currentUser as unknown as UserType}
        loading={isLoading}
      />

      <FormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={t("Users.add_user")}
        formId="user-form"
      >
        <UserForm
          id="user-form"
          onSuccess={() => {
            setFormDialogOpen(false);
          }}
        />
      </FormDialog>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

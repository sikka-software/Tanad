-- Policies for auth.users
CREATE POLICY "Users can view their own user data" ON "auth"."users" AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = id));

-- Policies for public.user_enterprise_roles
CREATE POLICY "Enable read access for users" ON "public"."user_enterprise_roles" AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Enable insert for authenticated users" ON "public"."user_enterprise_roles" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Enable update for users" ON "public"."user_enterprise_roles" AS PERMISSIVE FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Enable delete for users" ON "public"."user_enterprise_roles" AS PERMISSIVE FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- Policies for public.enterprises
CREATE POLICY "Access if member" ON "public"."enterprises" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM memberships
  WHERE ((memberships.enterprise_id = enterprises.id) AND (memberships.profile_id = auth.uid())))));

-- Policies for public.memberships
CREATE POLICY "Access if same user" ON "public"."memberships" AS PERMISSIVE FOR SELECT TO public USING ((profile_id = auth.uid()));

-- Policies for public.invoices
CREATE POLICY "Read if has permission" ON "public"."invoices" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM user_permissions_view
  WHERE ((user_permissions_view.permission = 'invoices.read'::text) AND (user_permissions_view.profile_id = auth.uid()) AND (user_permissions_view.enterprise_id = invoices.enterprise_id)))));
CREATE POLICY "Delete if has permission" ON "public"."invoices" AS PERMISSIVE FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM user_permissions_view
  WHERE ((user_permissions_view.permission = 'invoices.delete'::text) AND (user_permissions_view.profile_id = auth.uid()) AND (user_permissions_view.enterprise_id = invoices.enterprise_id)))));

-- Policies for public.expenses
CREATE POLICY "Read if has permission" ON "public"."expenses" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM user_permissions_view
  WHERE ((user_permissions_view.permission = 'expenses.read'::text) AND (user_permissions_view.profile_id = auth.uid()) AND (user_permissions_view.enterprise_id = expenses.enterprise_id)))));
CREATE POLICY "Create if has permission" ON "public"."expenses" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM user_permissions_view
  WHERE ((user_permissions_view.permission = 'expenses.create'::text) AND (user_permissions_view.profile_id = auth.uid()) AND (user_permissions_view.enterprise_id = expenses.enterprise_id)))));

-- Policies for public.profiles
CREATE POLICY "Users can view own profile" ON "public"."profiles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY "Users can insert own profile" ON "public"."profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile" ON "public"."profiles" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

-- Policies for public.user_roles
CREATE POLICY "Admins can manage user roles" ON "public"."user_roles" AS PERMISSIVE FOR ALL TO authenticated USING (has_enterprise_permission(enterprise_id, ARRAY['roles.create'::app_permission, 'roles.update'::app_permission])) WITH CHECK (has_enterprise_permission(enterprise_id, ARRAY['roles.create'::app_permission, 'roles.update'::app_permission]));

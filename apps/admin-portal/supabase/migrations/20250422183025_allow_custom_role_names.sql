-- Drop constraints that depend on the 'role' column type or 'app_role' enum, if they still exist
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_enterprise_id_pk;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey; -- Also try dropping the key possibly created by the older migration
ALTER TABLE public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_permission_key;
DROP INDEX IF EXISTS public.user_roles_role_idx;

-- Alter relevant columns from enum to text BEFORE dropping the type
-- The user_roles.role column should have been removed by migration 20250430111354
-- ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;
ALTER TABLE public.role_permissions ALTER COLUMN role TYPE text;
ALTER TABLE public.profiles ALTER COLUMN role TYPE text; -- Alter profiles.role as well

-- Drop the now unused enum type if it exists

-- Recreate the constraints for role_permissions with the new text type
-- The user_roles constraints are handled by migration 20250430111354
-- ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_enterprise_id_pk PRIMARY KEY (user_id, role, enterprise_id);
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission);
-- CREATE INDEX user_roles_role_idx ON public.user_roles USING btree (role);

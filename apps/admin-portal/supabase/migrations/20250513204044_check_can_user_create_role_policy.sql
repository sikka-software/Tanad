-- Step 1: Ensure RLS is enabled on the 'public.roles' table (if not already)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Step 2: (Important) Drop any existing INSERT policies on 'public.roles'
-- This is to ensure this new simple policy is the one that applies for INSERTs.
-- Replace "your_existing_policy_name_here" with actual names of policies you've created.
-- Be cautious and ensure you know which policies you are dropping.
DROP POLICY IF EXISTS "allow_role_creation_via_helper_function" ON public.roles;

DROP POLICY IF EXISTS "test_very_simple_new_access" ON public.roles;

DROP POLICY IF EXISTS "test_simple_new_current_user" ON public.roles;

DROP POLICY IF EXISTS "allow_insert_roles_if_member_with_roles_create_permission" ON public.roles;

-- Add any other names
-- Add any other INSERT policies you might have on 'public.roles'
-- Step 3: Create the simple policy
CREATE POLICY "allow_authenticated_user_to_create_role_entry" ON public.roles FOR INSERT TO public -- This policy applies to all database roles attempting the action
WITH
    CHECK (
        auth.uid () IS NOT NULL -- Allows the INSERT if the current user is authenticated (has a UID)
    );
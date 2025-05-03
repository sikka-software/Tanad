-- Enable Row Level Security if not already enabled
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to ensure a clean state
DROP POLICY IF EXISTS "Allow members to view own enterprise requests" ON public.employee_requests;
DROP POLICY IF EXISTS "Allow members to insert for own enterprise" ON public.employee_requests;
DROP POLICY IF EXISTS "Allow creator to update own requests" ON public.employee_requests;
DROP POLICY IF EXISTS "Allow creator to delete own requests" ON public.employee_requests;

-- Helper function to check enterprise membership
CREATE OR REPLACE FUNCTION is_member_of_enterprise(p_enterprise_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Important for accessing memberships table
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships
    WHERE enterprise_id = p_enterprise_id
      AND profile_id = auth.uid()
  );
$$;

-- 1. Policy: Allow members to view requests for their enterprise
CREATE POLICY "Allow members to view own enterprise requests"
ON public.employee_requests
FOR SELECT
USING (is_member_of_enterprise(enterprise_id));

-- 2. Policy: Allow members to insert requests for their enterprise
CREATE POLICY "Allow members to insert for own enterprise"
ON public.employee_requests
FOR INSERT
WITH CHECK (
  enterprise_id = (
    SELECT enterprise_id
    FROM memberships
    WHERE profile_id = auth.uid()
    LIMIT 1
  )
  AND user_id = auth.uid() -- Ensure creator is set correctly
);

-- 3. Policy: Allow creator to update their own requests within their enterprise
CREATE POLICY "Allow creator to update own requests"
ON public.employee_requests
FOR UPDATE
USING (
  user_id = auth.uid() AND is_member_of_enterprise(enterprise_id)
)
WITH CHECK (
  user_id = auth.uid() AND is_member_of_enterprise(enterprise_id)
);

-- 4. Policy: Allow creator to delete their own requests within their enterprise
CREATE POLICY "Allow creator to delete own requests"
ON public.employee_requests
FOR DELETE
USING (
  user_id = auth.uid() AND is_member_of_enterprise(enterprise_id)
);

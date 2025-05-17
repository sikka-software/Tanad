-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow creator to delete own requests" ON public.employee_requests;

-- Create a new policy to allow any enterprise member to delete
CREATE POLICY "Allow enterprise members to delete requests" ON public.employee_requests FOR DELETE USING (is_member_of_enterprise (enterprise_id));
-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Allow creator to update own requests" ON public.employee_requests;

-- Create a new policy allowing any user within the same enterprise to update
CREATE POLICY "Allow enterprise members to update requests"
ON public.employee_requests
FOR UPDATE
USING (is_member_of_enterprise(enterprise_id)) -- Check if the user is part of the enterprise associated with the row being updated
WITH CHECK (is_member_of_enterprise(enterprise_id)); -- Ensure the enterprise_id isn't changed to one the user isn't part of

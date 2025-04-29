-- Drop view if exists
DROP VIEW IF EXISTS public.user_permissions_view;

-- Create view for user permissions with security
CREATE VIEW public.user_permissions_view 
WITH (security_invoker = true)
AS
SELECT 
    ur.user_id,
    ur.enterprise_id,
    ur.role_id,
    r.name as role_name,
    rp.permission
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
WHERE ur.user_id = auth.uid(); -- Apply the security check in the view definition

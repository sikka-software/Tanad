-- Set enterprise_id to NULL for all existing system roles
UPDATE public.roles
SET enterprise_id = NULL
WHERE is_system = true;

-- Note: If you have existing *custom* roles (is_system = false)
-- that currently have enterprise_id = NULL, they will still violate
-- the constraint. You might need to manually update them or add
-- another UPDATE statement here to assign them a default enterprise_id
-- if applicable.
-- Example:
-- UPDATE public.roles
-- SET enterprise_id = 'YOUR_DEFAULT_ENTERPRISE_ID_HERE' -- Replace with an actual enterprise ID
-- WHERE is_system = false AND enterprise_id IS NULL;

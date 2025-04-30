-- Delete all custom roles (non-system roles)
DELETE FROM public.roles
WHERE is_system = false;

-- Delete all enterprises (this will cascade delete memberships)
DELETE FROM public.enterprises;

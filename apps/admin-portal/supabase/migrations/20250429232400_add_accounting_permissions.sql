-- Add permissions for the accounting role
DO $$ 
DECLARE
    accounting_role_id uuid;
BEGIN
    -- Get the accounting role ID
    SELECT id INTO accounting_role_id
    FROM public.roles
    WHERE name = 'accounting';

    -- If accounting role doesn't exist, create it
    IF accounting_role_id IS NULL THEN
        INSERT INTO public.roles (name)
        VALUES ('accounting')
        RETURNING id INTO accounting_role_id;
    END IF;

    -- Insert accounting permissions
    INSERT INTO public.role_permissions (role_id, permission)
    VALUES
        (accounting_role_id, 'invoices.create'),
        (accounting_role_id, 'invoices.read'),
        (accounting_role_id, 'invoices.update'),
        (accounting_role_id, 'invoices.delete'),
        (accounting_role_id, 'invoices.export'),
        (accounting_role_id, 'invoices.duplicate'),
        (accounting_role_id, 'products.create'),
        (accounting_role_id, 'products.read'),
        (accounting_role_id, 'products.update'),
        (accounting_role_id, 'products.delete'),
        (accounting_role_id, 'products.export'),
        (accounting_role_id, 'expenses.create'),
        (accounting_role_id, 'expenses.read'),
        (accounting_role_id, 'expenses.update'),
        (accounting_role_id, 'expenses.delete'),
        (accounting_role_id, 'expenses.export'),
        (accounting_role_id, 'expenses.duplicate'),
        (accounting_role_id, 'vendors.create'),
        (accounting_role_id, 'vendors.read'),
        (accounting_role_id, 'vendors.update'),
        (accounting_role_id, 'vendors.delete'),
        (accounting_role_id, 'vendors.export'),
        (accounting_role_id, 'clients.read'),
        (accounting_role_id, 'companies.read')
    ON CONFLICT (role_id, permission) DO NOTHING;
END $$; 
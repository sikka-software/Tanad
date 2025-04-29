-- First, ensure the accounting role exists
INSERT INTO roles (name, description)
VALUES ('accounting', 'Accounting role with access to financial data')
ON CONFLICT (name) DO NOTHING;

-- Get the role_id for the accounting role
WITH accounting_role AS (
  SELECT id FROM roles WHERE name = 'accounting'
)
INSERT INTO role_permissions (role_id, permission)
SELECT 
  accounting_role.id,
  permission
FROM 
  accounting_role,
  unnest(ARRAY[
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'invoices.delete',
    'invoices.export',
    'invoices.duplicate',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'products.export',
    'expenses.create',
    'expenses.read',
    'expenses.update',
    'expenses.delete',
    'expenses.export',
    'expenses.duplicate',
    'vendors.create',
    'vendors.read',
    'vendors.update',
    'vendors.delete',
    'vendors.export',
    'clients.read',
    'companies.read'
  ]::app_permission[]) AS permission
ON CONFLICT (role_id, permission) DO NOTHING;

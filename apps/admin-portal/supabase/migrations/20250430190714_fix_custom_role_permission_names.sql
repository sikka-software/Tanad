-- Correct permission names for custom role 'surub2_role'
UPDATE permissions SET permission = 'companies.create' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Create companies';
UPDATE permissions SET permission = 'companies.read' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Read companies';
UPDATE permissions SET permission = 'companies.update' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Update companies';
UPDATE permissions SET permission = 'companies.delete' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Delete companies';
UPDATE permissions SET permission = 'companies.export' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Export companies';
UPDATE permissions SET permission = 'companies.duplicate' WHERE role_id = '9aa8f264-2190-4383-82a4-2200136a3716' AND permission = 'Duplicate companies';

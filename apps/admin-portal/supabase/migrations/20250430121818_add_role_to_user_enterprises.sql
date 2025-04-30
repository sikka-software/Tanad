-- Add role_id column to user_enterprises
ALTER TABLE user_enterprises
ADD COLUMN role_id UUID REFERENCES roles(id);

-- Make role_id NOT NULL
ALTER TABLE user_enterprises
ALTER COLUMN role_id SET NOT NULL;

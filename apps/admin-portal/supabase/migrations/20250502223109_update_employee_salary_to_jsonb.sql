-- Assuming the table is named 'employees' and the column is 'salary'
-- Alter the column type to jsonb
ALTER TABLE public.employees
ALTER COLUMN salary TYPE jsonb
USING jsonb_build_array(jsonb_build_object('type', 'base', 'amount', salary)); -- Convert existing numeric salary to a base component

-- Set the default value for the jsonb column
ALTER TABLE public.employees
ALTER COLUMN salary SET DEFAULT '[]'::jsonb;

-- Ensure the column cannot be null if needed, or keep it nullable
-- ALTER TABLE public.employees ALTER COLUMN salary SET NOT NULL; -- Uncomment if salary components are required

-- Add a comment to the column for clarity
COMMENT ON COLUMN public.employees.salary IS 'Stores salary components as a JSON array, e.g., [{ "type": "base", "amount": 5000 }, { "type": "housing", "amount": 1000 }]';

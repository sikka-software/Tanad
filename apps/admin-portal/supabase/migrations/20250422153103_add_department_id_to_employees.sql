-- Add department_id column to employees table
ALTER TABLE employees
ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX employees_department_id_idx ON employees(department_id);

-- Update RLS policy to allow access through department relationship
CREATE POLICY "Users can access employees through departments"
    ON employees
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM departments d
            WHERE d.id = employees.department_id
            AND d.user_id = auth.uid()
        )
    );
-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own vendors" ON "vendors";

-- Create new policy with WITH CHECK for INSERT
CREATE POLICY "Users can insert their own vendors" ON "vendors" 
  FOR INSERT TO public 
  WITH CHECK (true); 
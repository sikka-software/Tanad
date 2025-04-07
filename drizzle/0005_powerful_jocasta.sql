DROP POLICY "Users can insert their own vendors" ON "vendors";
CREATE POLICY "Users can insert their own vendors" ON "vendors" FOR INSERT TO public USING (true);
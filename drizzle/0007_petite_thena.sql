CREATE POLICY "Users can insert their own branches" ON "branches" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "Users can update their own branches" ON "branches" TO public USING (true) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "Users can read their own branches" ON "branches" TO public USING (true) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "Users can delete their own branches" ON "branches" TO public USING (true) WITH CHECK (true);
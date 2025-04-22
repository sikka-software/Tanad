-- Create test table
CREATE TABLE IF NOT EXISTS public.test_table_2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  first_name text NOT NULL
);


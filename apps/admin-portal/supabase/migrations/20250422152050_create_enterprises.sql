-- Create enterprises table
CREATE TABLE IF NOT EXISTS public.enterprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  is_active boolean DEFAULT true NOT NULL,
  website text,
  industry text,
  size text,
  notes text
);

-- Enable RLS
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

-- Add email column if it doesn't exist (to handle partial application)
ALTER TABLE public.enterprises ADD COLUMN IF NOT EXISTS email text;

-- Create indexes
CREATE INDEX IF NOT EXISTS enterprises_email_idx ON public.enterprises USING btree (email);
CREATE INDEX IF NOT EXISTS enterprises_name_idx ON public.enterprises USING btree (name); 
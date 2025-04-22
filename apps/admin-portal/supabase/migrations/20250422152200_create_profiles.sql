-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  username text UNIQUE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  role app_role
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles USING btree (username);
CREATE INDEX IF NOT EXISTS profiles_enterprise_id_idx ON public.profiles USING btree (enterprise_id);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles USING btree (id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 
-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  hire_date date,
  position text,
  salary numeric(10,2),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS employees_email_idx ON public.employees USING btree (email);
CREATE INDEX IF NOT EXISTS employees_user_id_idx ON public.employees USING btree (user_id);
CREATE INDEX IF NOT EXISTS employees_department_id_idx ON public.employees USING btree (department_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 
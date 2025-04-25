-- Create user_roles table
CREATE TABLE public.user_roles (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Add indices for faster lookups
CREATE INDEX user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX user_roles_role_idx ON public.user_roles(role);

-- Add comments
COMMENT ON TABLE public.user_roles IS 'Stores roles assigned to user profiles.';

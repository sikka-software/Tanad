CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    enterprise_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, enterprise_id)
);

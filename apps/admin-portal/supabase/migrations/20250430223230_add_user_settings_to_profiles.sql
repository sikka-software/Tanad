ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_settings jsonb;

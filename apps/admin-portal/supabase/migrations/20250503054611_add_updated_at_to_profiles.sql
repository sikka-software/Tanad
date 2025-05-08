alter table "public"."profiles"
add column "updated_at" timestamp with time zone null default timezone('utc'::text, now());

-- Enable the existing trigger
-- (The trigger definition already exists, we just need the column)
-- Ensure the trigger is associated if it wasn't automatically
-- This might not be necessary if the trigger was already created but just failing
-- We can double-check if needed after applying the migration

-- Optional: Grant permissions if needed (adjust based on roles)
-- GRANT UPDATE ON TABLE public.profiles TO authenticated;

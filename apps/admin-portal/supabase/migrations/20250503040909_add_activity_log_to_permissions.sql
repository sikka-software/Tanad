ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'activity_logs.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'activity_logs.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'activity_logs.export';
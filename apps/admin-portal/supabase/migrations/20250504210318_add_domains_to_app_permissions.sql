ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'domains.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'domains.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'domains.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'domains.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'domains.export';

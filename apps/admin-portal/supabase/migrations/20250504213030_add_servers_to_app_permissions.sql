ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'servers.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'servers.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'servers.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'servers.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'servers.export';

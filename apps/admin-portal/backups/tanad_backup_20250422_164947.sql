

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgres_fdw" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_permission" AS ENUM (
    'profiles.create',
    'profiles.read',
    'profiles.update',
    'profiles.delete',
    'profiles.export',
    'enterprises.create',
    'enterprises.read',
    'enterprises.update',
    'enterprises.delete',
    'enterprises.export',
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'invoices.delete',
    'invoices.export',
    'invoices.duplicate',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'products.export',
    'quotes.create',
    'quotes.read',
    'quotes.update',
    'quotes.delete',
    'quotes.export',
    'quotes.duplicate',
    'employees.create',
    'employees.read',
    'employees.update',
    'employees.delete',
    'employees.export',
    'salaries.create',
    'salaries.read',
    'salaries.update',
    'salaries.delete',
    'salaries.export',
    'documents.create',
    'documents.read',
    'documents.update',
    'documents.delete',
    'documents.export',
    'templates.create',
    'templates.read',
    'templates.update',
    'templates.delete',
    'templates.export',
    'templates.duplicate',
    'employee-requests.create',
    'employee-requests.read',
    'employee-requests.update',
    'employee-requests.delete',
    'employee-requests.export',
    'job-listings.create',
    'job-listings.read',
    'job-listings.update',
    'job-listings.delete',
    'job-listings.export',
    'offices.create',
    'offices.read',
    'offices.update',
    'offices.delete',
    'offices.export',
    'expenses.create',
    'expenses.read',
    'expenses.update',
    'expenses.delete',
    'expenses.export',
    'expenses.duplicate',
    'departments.create',
    'departments.read',
    'departments.update',
    'departments.delete',
    'departments.export',
    'warehouses.create',
    'warehouses.read',
    'warehouses.update',
    'warehouses.delete',
    'warehouses.export',
    'vendors.create',
    'vendors.read',
    'vendors.update',
    'vendors.delete',
    'vendors.export',
    'clients.create',
    'clients.read',
    'clients.update',
    'clients.delete',
    'clients.export',
    'companies.create',
    'companies.read',
    'companies.update',
    'companies.delete',
    'companies.export',
    'branches.create',
    'branches.read',
    'branches.update',
    'branches.delete',
    'branches.export'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'superadmin',
    'admin',
    'accounting',
    'hr'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    claims jsonb;
    user_role public.app_role;
    user_permissions text[];
BEGIN
    -- Fetch the user role in the user_roles table
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = (event->>'user_id')::uuid;

    -- Get user permissions
    SELECT array_agg(rp.permission::text)
    INTO user_permissions
    FROM public.role_permissions rp
    WHERE rp.role = user_role;

    claims := event->'claims';
    
    IF user_role IS NOT NULL THEN
        -- Set the role claim
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        -- Set the permissions claim
        claims := jsonb_set(claims, '{user_permissions}', to_jsonb(user_permissions));
    ELSE
        claims := jsonb_set(claims, '{user_role}', 'null');
        claims := jsonb_set(claims, '{user_permissions}', '[]');
    END IF;

    -- Update the claims object in the original event
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    _role public.app_role;
BEGIN
    -- Set the role
    _role := 'superadmin'::public.app_role;

    -- Log the trigger execution
    INSERT INTO public.trigger_audit_log (trigger_name, table_name, user_id, data)
    VALUES ('handle_new_user_profile', 'auth.users', NEW.id, row_to_json(NEW)::jsonb);

    -- Insert into user_roles first with explicit schema
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);

    -- Then create the profile with explicit schema
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        first_name,
        last_name,
        role,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''), 'New'),
        COALESCE(NULLIF(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''), 'User'),
        _role,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.trigger_audit_log (trigger_name, table_name, user_id, data)
    VALUES ('handle_new_user_profile_error', 'auth.users', NEW.id, jsonb_build_object('error', SQLERRM));
    RAISE;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Create a superadmin role for the new user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("permission_name" "text", "enterprise_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND ur.enterprise_id = has_permission.enterprise_id
    AND rp.permission = permission_name::app_permission
  );
END;
$$;


ALTER FUNCTION "public"."has_permission"("permission_name" "text", "enterprise_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_department_location"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.location_type = 'office' AND NOT EXISTS (SELECT 1 FROM offices WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid office location_id';
  ELSIF NEW.location_type = 'branch' AND NOT EXISTS (SELECT 1 FROM branches WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid branch location_id';
  ELSIF NEW.location_type = 'warehouse' AND NOT EXISTS (SELECT 1 FROM warehouses WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid warehouse location_id';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_department_location"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_role_permission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if the role is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.role::text AND enumtypid = 'app_role'::regtype) THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Check if the permission is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.permission::text AND enumtypid = 'app_permission'::regtype) THEN
    RAISE EXCEPTION 'Invalid permission';
  END IF;

  -- Check if this role already has this permission
  IF EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role = NEW.role 
    AND permission = NEW.permission
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Role already has this permission';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_role_permission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  -- Check if the role is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.role::text AND enumtypid = 'app_role'::regtype) THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Check if the enterprise exists
  IF NEW.enterprise_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM enterprises WHERE id = NEW.enterprise_id) THEN
    RAISE EXCEPTION 'Invalid enterprise_id';
  END IF;

  -- Check if the user is already assigned this role in this enterprise
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role = NEW.role 
    AND enterprise_id = NEW.enterprise_id
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'User already has this role in this enterprise';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_user_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "code" "text",
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "manager" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    "company" "uuid",
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "website" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "industry" "text",
    "size" "text",
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."department_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "location_type" "text" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "location_type_check" CHECK (("location_type" = ANY (ARRAY['office'::"text", 'branch'::"text", 'warehouse'::"text"])))
);


ALTER TABLE "public"."department_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "description" "text",
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean DEFAULT true NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "documents_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['company'::"text", 'expense'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_date" "date",
    "end_date" "date",
    "amount" numeric(10,2),
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."employee_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "hire_date" "date",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "country" "text",
    "termination_date" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "department_id" "uuid"
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enterprises" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "website" "text",
    "industry" "text",
    "size" "text",
    "notes" "text"
);


ALTER TABLE "public"."enterprises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "expense_number" "text" NOT NULL,
    "issue_date" "date" NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "category" "text" NOT NULL,
    "notes" "text",
    "client_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "expenses_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'overdue'::"text"])))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text" NOT NULL,
    "quantity" numeric(10,2) DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "amount" numeric(10,2) GENERATED ALWAYS AS (("quantity" * "unit_price")) STORED,
    "invoice_id" "uuid" NOT NULL,
    "product_id" "uuid"
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "invoice_number" "text" NOT NULL,
    "issue_date" "date" NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "tax_rate" numeric(5,2) DEFAULT 0,
    "notes" "text",
    "client_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tax_amount" numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ("tax_rate" IS NULL) THEN (0)::numeric
    ELSE "round"(("subtotal" * "tax_rate"), 2)
END) STORED,
    "total" numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ("tax_rate" IS NULL) THEN "subtotal"
    ELSE "round"(("subtotal" * ((1)::numeric + "tax_rate")), 2)
END) STORED,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'paid'::"text", 'overdue'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_listing_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_listing_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."job_listing_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "slug" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."job_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "requirements" "text",
    "location" character varying(255),
    "department" character varying(255),
    "type" character varying(50) NOT NULL,
    "salary" numeric(10,2),
    "is_active" boolean DEFAULT true NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."offices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "sku" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    "cost" numeric(10,2),
    "quantity" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "unit" "text",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "full_name" "text",
    "email" "text" NOT NULL,
    "user_settings" "jsonb",
    "enterprise_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "stripe_customer_id" "text",
    "avatar_url" "text",
    "username" "text",
    "subscribed_to" "text",
    "price_id" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "country" "text",
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quote_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text" NOT NULL,
    "quantity" numeric(10,2) DEFAULT '1'::numeric NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "amount" numeric(10,2) GENERATED ALWAYS AS (("quantity" * "unit_price")) STORED,
    "quote_id" "uuid" NOT NULL,
    "product_id" "uuid"
);


ALTER TABLE "public"."quote_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "quote_number" "text" NOT NULL,
    "issue_date" "date" NOT NULL,
    "expiry_date" "date" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "subtotal" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "tax_rate" numeric(5,2) DEFAULT '0'::numeric,
    "notes" "text",
    "client_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tax_amount" numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ("tax_rate" IS NULL) THEN (0)::numeric
    ELSE "round"(("subtotal" * "tax_rate"), 2)
END) STORED,
    "total" numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ("tax_rate" IS NULL) THEN "subtotal"
    ELSE "round"(("subtotal" * ((1)::numeric + "tax_rate")), 2)
END) STORED,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "quotes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'accepted'::"text", 'rejected'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."salaries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "payment_frequency" "text" DEFAULT 'monthly'::"text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date"
);


ALTER TABLE "public"."salaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "content" "jsonb" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL,
    CONSTRAINT "templates_type_check" CHECK (("type" = ANY (ARRAY['invoice'::"text", 'quote'::"text"])))
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trigger_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trigger_name" "text",
    "table_name" "text",
    "user_id" "uuid",
    "executed_at" timestamp with time zone DEFAULT "now"(),
    "data" "jsonb"
);


ALTER TABLE "public"."trigger_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role" "public"."app_role" NOT NULL,
    "enterprise_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "company" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."warehouses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "capacity" numeric(10,2),
    "is_active" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    "enterprise_id" "uuid" NOT NULL
);


ALTER TABLE "public"."warehouses" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_locations"
    ADD CONSTRAINT "department_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_requests"
    ADD CONSTRAINT "employee_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enterprises"
    ADD CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listing_jobs"
    ADD CONSTRAINT "job_listing_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offices"
    ADD CONSTRAINT "offices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trigger_audit_log"
    ADD CONSTRAINT "trigger_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_locations"
    ADD CONSTRAINT "unique_department_location" UNIQUE ("department_id", "location_type", "location_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_enterprise_id_key" UNIQUE ("user_id", "role", "enterprise_id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."warehouses"
    ADD CONSTRAINT "warehouses_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."warehouses"
    ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id");



CREATE INDEX "branches_code_idx" ON "public"."branches" USING "btree" ("code");



CREATE INDEX "branches_name_idx" ON "public"."branches" USING "btree" ("name");



CREATE INDEX "branches_user_id_idx" ON "public"."branches" USING "btree" ("user_id");



CREATE INDEX "clients_email_idx" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "clients_name_idx" ON "public"."clients" USING "btree" ("name");



CREATE INDEX "clients_user_id_idx" ON "public"."clients" USING "btree" ("user_id");



CREATE INDEX "companies_email_idx" ON "public"."companies" USING "btree" ("email");



CREATE INDEX "companies_is_active_idx" ON "public"."companies" USING "btree" ("is_active");



CREATE INDEX "companies_name_idx" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "departments_name_idx" ON "public"."departments" USING "btree" ("name");



CREATE INDEX "departments_user_id_idx" ON "public"."departments" USING "btree" ("user_id");



CREATE INDEX "documents_entity_id_idx" ON "public"."documents" USING "btree" ("entity_id");



CREATE INDEX "documents_entity_type_idx" ON "public"."documents" USING "btree" ("entity_type");



CREATE INDEX "documents_user_id_idx" ON "public"."documents" USING "btree" ("user_id");



CREATE INDEX "employee_requests_created_at_idx" ON "public"."employee_requests" USING "btree" ("created_at");



CREATE INDEX "employee_requests_employee_id_idx" ON "public"."employee_requests" USING "btree" ("employee_id");



CREATE INDEX "employee_requests_status_idx" ON "public"."employee_requests" USING "btree" ("status");



CREATE INDEX "employee_requests_type_idx" ON "public"."employee_requests" USING "btree" ("type");



CREATE INDEX "employee_requests_user_id_idx" ON "public"."employee_requests" USING "btree" ("user_id");



CREATE INDEX "employees_department_id_idx" ON "public"."employees" USING "btree" ("department_id");



CREATE INDEX "employees_email_idx" ON "public"."employees" USING "btree" ("email");



CREATE INDEX "employees_user_id_idx" ON "public"."employees" USING "btree" ("user_id");



CREATE INDEX "enterprises_email_idx" ON "public"."enterprises" USING "btree" ("email");



CREATE INDEX "enterprises_name_idx" ON "public"."enterprises" USING "btree" ("name");



CREATE INDEX "expenses_client_id_idx" ON "public"."expenses" USING "btree" ("client_id");



CREATE INDEX "expenses_status_idx" ON "public"."expenses" USING "btree" ("status");



CREATE INDEX "expenses_user_id_idx" ON "public"."expenses" USING "btree" ("user_id");



CREATE INDEX "invoice_items_invoice_id_idx" ON "public"."invoice_items" USING "btree" ("invoice_id");



CREATE INDEX "invoices_client_id_idx" ON "public"."invoices" USING "btree" ("client_id");



CREATE INDEX "invoices_status_idx" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "invoices_user_id_idx" ON "public"."invoices" USING "btree" ("user_id");



CREATE INDEX "job_listing_jobs_job_id_idx" ON "public"."job_listing_jobs" USING "btree" ("job_id");



CREATE INDEX "job_listing_jobs_job_listing_id_idx" ON "public"."job_listing_jobs" USING "btree" ("job_listing_id");



CREATE INDEX "job_listings_slug_idx" ON "public"."job_listings" USING "btree" ("slug");



CREATE INDEX "job_listings_title_idx" ON "public"."job_listings" USING "btree" ("title");



CREATE INDEX "job_listings_user_id_idx" ON "public"."job_listings" USING "btree" ("user_id");



CREATE INDEX "jobs_department_idx" ON "public"."jobs" USING "btree" ("department");



CREATE INDEX "jobs_title_idx" ON "public"."jobs" USING "btree" ("title");



CREATE INDEX "jobs_user_id_idx" ON "public"."jobs" USING "btree" ("user_id");



CREATE INDEX "offices_name_idx" ON "public"."offices" USING "btree" ("name");



CREATE INDEX "offices_user_id_idx" ON "public"."offices" USING "btree" ("user_id");



CREATE INDEX "products_name_idx" ON "public"."products" USING "btree" ("name");



CREATE INDEX "products_sku_idx" ON "public"."products" USING "btree" ("sku");



CREATE INDEX "products_user_id_idx" ON "public"."products" USING "btree" ("user_id");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_enterprise_id_idx" ON "public"."profiles" USING "btree" ("enterprise_id");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "quote_items_quote_id_idx" ON "public"."quote_items" USING "btree" ("quote_id");



CREATE INDEX "quotes_client_id_idx" ON "public"."quotes" USING "btree" ("client_id");



CREATE INDEX "quotes_status_idx" ON "public"."quotes" USING "btree" ("status");



CREATE INDEX "quotes_user_id_idx" ON "public"."quotes" USING "btree" ("user_id");



CREATE INDEX "salaries_employee_id_idx" ON "public"."salaries" USING "btree" ("employee_id");



CREATE INDEX "salaries_user_id_idx" ON "public"."salaries" USING "btree" ("user_id");



CREATE INDEX "templates_name_idx" ON "public"."templates" USING "btree" ("name");



CREATE INDEX "templates_type_idx" ON "public"."templates" USING "btree" ("type");



CREATE INDEX "templates_user_id_idx" ON "public"."templates" USING "btree" ("user_id");



CREATE INDEX "vendors_email_idx" ON "public"."vendors" USING "btree" ("email");



CREATE INDEX "vendors_name_idx" ON "public"."vendors" USING "btree" ("name");



CREATE INDEX "vendors_user_id_idx" ON "public"."vendors" USING "btree" ("user_id");



CREATE INDEX "warehouses_code_idx" ON "public"."warehouses" USING "btree" ("code");



CREATE INDEX "warehouses_name_idx" ON "public"."warehouses" USING "btree" ("name");



CREATE INDEX "warehouses_user_id_idx" ON "public"."warehouses" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "validate_department_location_trigger" BEFORE INSERT OR UPDATE ON "public"."department_locations" FOR EACH ROW EXECUTE FUNCTION "public"."validate_department_location"();



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_company_fkey" FOREIGN KEY ("company") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."department_locations"
    ADD CONSTRAINT "department_locations_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."department_locations"
    ADD CONSTRAINT "department_locations_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."employee_requests"
    ADD CONSTRAINT "employee_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employee_requests"
    ADD CONSTRAINT "employee_requests_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."job_listing_jobs"
    ADD CONSTRAINT "job_listing_jobs_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."job_listing_jobs"
    ADD CONSTRAINT "job_listing_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_listing_jobs"
    ADD CONSTRAINT "job_listing_jobs_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."offices"
    ADD CONSTRAINT "offices_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."salaries"
    ADD CONSTRAINT "salaries_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



ALTER TABLE ONLY "public"."warehouses"
    ADD CONSTRAINT "warehouses_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id");



CREATE POLICY "ADMIN FULL ACCESS" ON "public"."profiles" TO "service_role" USING (true);



CREATE POLICY "Enable delete for admins" ON "public"."enterprises" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."enterprise_id" = "ur"."id") AND ("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"public"."app_role")))));



CREATE POLICY "Enable insert for authenticated users" ON "public"."enterprises" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for service role" ON "public"."enterprises" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable read access for users" ON "public"."enterprises" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for admins" ON "public"."enterprises" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."enterprise_id" = "ur"."id") AND ("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"public"."app_role")))));



CREATE POLICY "PUBLIC PROFILES ARE VIEWABLE" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "USERS CAN ADD JOBS TO THEIR LISTINGS" ON "public"."job_listing_jobs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."job_listings"
  WHERE (("job_listings"."id" = "job_listing_jobs"."job_listing_id") AND ("job_listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN CREATE JOB LISTINGS" ON "public"."job_listings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN CREATE THEIR OWN PROFILE" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "USERS CAN CREATE THEIR OWN TEMPLATES" ON "public"."templates" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE DEPARTMENT LOCATIONS THROUGH DEPARTMENTS" ON "public"."department_locations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."departments"
  WHERE (("departments"."id" = "department_locations"."department_id") AND ("departments"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN DELETE INVOICE ITEMS THROUGH INVOICES" ON "public"."invoice_items" FOR DELETE TO "authenticated" USING (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN DELETE QUOTE ITEMS THROUGH QUOTES" ON "public"."quote_items" FOR DELETE TO "authenticated" USING (("quote_id" IN ( SELECT "quotes"."id"
   FROM "public"."quotes"
  WHERE ("quotes"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN DELETE THEIR OWN BRANCHES" ON "public"."branches" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN CLIENTS" ON "public"."clients" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN COMPANIES" ON "public"."companies" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN DEPARTMENTS" ON "public"."departments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN EMPLOYEE REQUESTS" ON "public"."employee_requests" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN EMPLOYEES" ON "public"."employees" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN EXPENSES" ON "public"."expenses" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN INVOICES" ON "public"."invoices" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN JOB LISTINGS" ON "public"."job_listings" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN JOBS" ON "public"."jobs" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN OFFICES" ON "public"."offices" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN PRODUCTS" ON "public"."products" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN PROFILE" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN QUOTES" ON "public"."quotes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN SALARY RECORDS" ON "public"."salaries" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN TEMPLATES" ON "public"."templates" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN VENDORS" ON "public"."vendors" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN DELETE THEIR OWN WAREHOUSES" ON "public"."warehouses" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT DEPARTMENT LOCATIONS THROUGH DEPARTMENTS" ON "public"."department_locations" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."departments"
  WHERE (("departments"."id" = "department_locations"."department_id") AND ("departments"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN INSERT INVOICE ITEMS THROUGH INVOICES" ON "public"."invoice_items" FOR INSERT TO "authenticated" WITH CHECK (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN INSERT QUOTE ITEMS THROUGH QUOTES" ON "public"."quote_items" FOR INSERT TO "authenticated" WITH CHECK (("quote_id" IN ( SELECT "quotes"."id"
   FROM "public"."quotes"
  WHERE ("quotes"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN INSERT THEIR OWN BRANCHES" ON "public"."branches" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN CLIENTS" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN COMPANIES" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN DEPARTMENTS" ON "public"."departments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN EMPLOYEE REQUESTS" ON "public"."employee_requests" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN EMPLOYEES" ON "public"."employees" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN EXPENSES" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN INVOICES" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN JOBS" ON "public"."jobs" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN OFFICES" ON "public"."offices" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN PRODUCTS" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN QUOTES" ON "public"."quotes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN SALARY RECORDS" ON "public"."salaries" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN VENDORS" ON "public"."vendors" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN INSERT THEIR OWN WAREHOUSES" ON "public"."warehouses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ DEPARTMENT LOCATIONS THROUGH DEPARTMENTS" ON "public"."department_locations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."departments"
  WHERE (("departments"."id" = "department_locations"."department_id") AND ("departments"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN READ EMPLOYEES" ON "public"."employees" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "USERS CAN READ INVOICE ITEMS THROUGH INVOICES" ON "public"."invoice_items" FOR SELECT TO "authenticated" USING (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN READ QUOTE ITEMS THROUGH QUOTES" ON "public"."quote_items" FOR SELECT TO "authenticated" USING (("quote_id" IN ( SELECT "quotes"."id"
   FROM "public"."quotes"
  WHERE ("quotes"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN READ THEIR OWN BRANCHES" ON "public"."branches" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN CLIENTS" ON "public"."clients" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN COMPANIES" ON "public"."companies" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN DEPARTMENTS" ON "public"."departments" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN EMPLOYEE REQUESTS" ON "public"."employee_requests" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN EXPENSES" ON "public"."expenses" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN INVOICES" ON "public"."invoices" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN JOBS" ON "public"."jobs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN OFFICES" ON "public"."offices" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN PRODUCTS" ON "public"."products" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN QUOTES" ON "public"."quotes" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN SALARY RECORDS" ON "public"."salaries" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN VENDORS" ON "public"."vendors" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN READ THEIR OWN WAREHOUSES" ON "public"."warehouses" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN REMOVE JOBS FROM THEIR LISTINGS" ON "public"."job_listing_jobs" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."job_listings"
  WHERE (("job_listings"."id" = "job_listing_jobs"."job_listing_id") AND ("job_listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN UPDATE DEPARTMENT LOCATIONS THROUGH DEPARTMENTS" ON "public"."department_locations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."departments"
  WHERE (("departments"."id" = "department_locations"."department_id") AND ("departments"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."departments"
  WHERE (("departments"."id" = "department_locations"."department_id") AND ("departments"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN UPDATE INVOICE ITEMS THROUGH INVOICES" ON "public"."invoice_items" FOR UPDATE TO "authenticated" USING (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."user_id" = "auth"."uid"())))) WITH CHECK (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN UPDATE JOBS IN THEIR LISTINGS" ON "public"."job_listing_jobs" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."job_listings"
  WHERE (("job_listings"."id" = "job_listing_jobs"."job_listing_id") AND ("job_listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN UPDATE QUOTE ITEMS THROUGH QUOTES" ON "public"."quote_items" FOR UPDATE TO "authenticated" USING (("quote_id" IN ( SELECT "quotes"."id"
   FROM "public"."quotes"
  WHERE ("quotes"."user_id" = "auth"."uid"())))) WITH CHECK (("quote_id" IN ( SELECT "quotes"."id"
   FROM "public"."quotes"
  WHERE ("quotes"."user_id" = "auth"."uid"()))));



CREATE POLICY "USERS CAN UPDATE THEIR OWN BRANCHES" ON "public"."branches" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN CLIENTS" ON "public"."clients" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN COMPANIES" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN DEPARTMENTS" ON "public"."departments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN EMPLOYEE REQUESTS" ON "public"."employee_requests" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN EMPLOYEES" ON "public"."employees" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN EXPENSES" ON "public"."expenses" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN INVOICES" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN JOB LISTINGS" ON "public"."job_listings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN JOBS" ON "public"."jobs" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN OFFICES" ON "public"."offices" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN PRODUCTS" ON "public"."products" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN PROFILE" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN QUOTES" ON "public"."quotes" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN SALARY RECORDS" ON "public"."salaries" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN TEMPLATES" ON "public"."templates" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN VENDORS" ON "public"."vendors" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN UPDATE THEIR OWN WAREHOUSES" ON "public"."warehouses" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "USERS CAN VIEW JOB LISTING JOBS FOR THEIR LISTINGS" ON "public"."job_listing_jobs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."job_listings"
  WHERE (("job_listings"."id" = "job_listing_jobs"."job_listing_id") AND ("job_listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "USERS CAN VIEW THEIR OWN JOB LISTINGS AND PUBLIC ONES" ON "public"."job_listings" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("is_active" = true)));



CREATE POLICY "USERS CAN VIEW THEIR OWN PROFILE" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "USERS CAN VIEW THEIR OWN TEMPLATES" ON "public"."templates" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can access employees through departments" ON "public"."employees" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."departments" "d"
  WHERE (("d"."id" = "employees"."department_id") AND ("d"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create documents for their entities" ON "public"."documents" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND
CASE "entity_type"
    WHEN 'company'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."companies"
      WHERE (("companies"."id" = "documents"."entity_id") AND ("companies"."user_id" = "auth"."uid"()))))
    WHEN 'expense'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."expenses"
      WHERE (("expenses"."id" = "documents"."entity_id") AND ("expenses"."user_id" = "auth"."uid"()))))
    WHEN 'salary'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."salaries"
      WHERE (("salaries"."id" = "documents"."entity_id") AND ("salaries"."user_id" = "auth"."uid"()))))
    WHEN 'employee'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."employees"
      WHERE (("employees"."id" = "documents"."entity_id") AND ("employees"."user_id" = "auth"."uid"()))))
    WHEN 'invoice'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."invoices"
      WHERE (("invoices"."id" = "documents"."entity_id") AND ("invoices"."user_id" = "auth"."uid"()))))
    WHEN 'quote'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."quotes"
      WHERE (("quotes"."id" = "documents"."entity_id") AND ("quotes"."user_id" = "auth"."uid"()))))
    WHEN 'vendor'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."vendors"
      WHERE (("vendors"."id" = "documents"."entity_id") AND ("vendors"."user_id" = "auth"."uid"()))))
    WHEN 'warehouse'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."warehouses"
      WHERE (("warehouses"."id" = "documents"."entity_id") AND ("warehouses"."user_id" = "auth"."uid"()))))
    WHEN 'branch'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."branches"
      WHERE (("branches"."id" = "documents"."entity_id") AND ("branches"."user_id" = "auth"."uid"()))))
    WHEN 'office'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."offices"
      WHERE (("offices"."id" = "documents"."entity_id") AND ("offices"."user_id" = "auth"."uid"()))))
    WHEN 'department'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."departments"
      WHERE (("departments"."id" = "documents"."entity_id") AND ("departments"."user_id" = "auth"."uid"()))))
    ELSE false
END));



CREATE POLICY "Users can create enterprises" ON "public"."enterprises" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can create initial role" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ((NOT (EXISTS ( SELECT 1
   FROM "public"."user_roles" "user_roles_1"
  WHERE ("user_roles_1"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"public"."app_role")))))));



CREATE POLICY "Users can delete their own documents" ON "public"."documents" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own documents" ON "public"."documents" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view enterprises" ON "public"."enterprises" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."enterprise_id" = "enterprises"."id")))) OR (NOT (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ("user_roles"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their own documents and documents of their entit" ON "public"."documents" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR
CASE "entity_type"
    WHEN 'company'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."companies"
      WHERE (("companies"."id" = "documents"."entity_id") AND ("companies"."user_id" = "auth"."uid"()))))
    WHEN 'expense'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."expenses"
      WHERE (("expenses"."id" = "documents"."entity_id") AND ("expenses"."user_id" = "auth"."uid"()))))
    WHEN 'salary'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."salaries"
      WHERE (("salaries"."id" = "documents"."entity_id") AND ("salaries"."user_id" = "auth"."uid"()))))
    WHEN 'employee'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."employees"
      WHERE (("employees"."id" = "documents"."entity_id") AND ("employees"."user_id" = "auth"."uid"()))))
    WHEN 'invoice'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."invoices"
      WHERE (("invoices"."id" = "documents"."entity_id") AND ("invoices"."user_id" = "auth"."uid"()))))
    WHEN 'quote'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."quotes"
      WHERE (("quotes"."id" = "documents"."entity_id") AND ("quotes"."user_id" = "auth"."uid"()))))
    WHEN 'vendor'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."vendors"
      WHERE (("vendors"."id" = "documents"."entity_id") AND ("vendors"."user_id" = "auth"."uid"()))))
    WHEN 'warehouse'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."warehouses"
      WHERE (("warehouses"."id" = "documents"."entity_id") AND ("warehouses"."user_id" = "auth"."uid"()))))
    WHEN 'branch'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."branches"
      WHERE (("branches"."id" = "documents"."entity_id") AND ("branches"."user_id" = "auth"."uid"()))))
    WHEN 'office'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."offices"
      WHERE (("offices"."id" = "documents"."entity_id") AND ("offices"."user_id" = "auth"."uid"()))))
    WHEN 'department'::"text" THEN (EXISTS ( SELECT 1
       FROM "public"."departments"
      WHERE (("departments"."id" = "documents"."entity_id") AND ("departments"."user_id" = "auth"."uid"()))))
    ELSE false
END));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."branches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."department_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enterprises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_listing_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quote_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."salaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."warehouses" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";




















































































































































































REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text", "enterprise_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text", "enterprise_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text", "enterprise_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect_all"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect_all"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect_all"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgres_fdw_disconnect_all"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgres_fdw_get_connections"(OUT "server_name" "text", OUT "valid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgres_fdw_get_connections"(OUT "server_name" "text", OUT "valid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."postgres_fdw_get_connections"(OUT "server_name" "text", OUT "valid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgres_fdw_get_connections"(OUT "server_name" "text", OUT "valid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgres_fdw_handler"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgres_fdw_handler"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgres_fdw_handler"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgres_fdw_handler"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgres_fdw_validator"("text"[], "oid") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgres_fdw_validator"("text"[], "oid") TO "anon";
GRANT ALL ON FUNCTION "public"."postgres_fdw_validator"("text"[], "oid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgres_fdw_validator"("text"[], "oid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_department_location"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_department_location"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_department_location"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_role_permission"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_role_permission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_role_permission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_user_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."department_locations" TO "anon";
GRANT ALL ON TABLE "public"."department_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."department_locations" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."employee_requests" TO "anon";
GRANT ALL ON TABLE "public"."employee_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_requests" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."enterprises" TO "anon";
GRANT ALL ON TABLE "public"."enterprises" TO "authenticated";
GRANT ALL ON TABLE "public"."enterprises" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."job_listing_jobs" TO "anon";
GRANT ALL ON TABLE "public"."job_listing_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."job_listing_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."job_listings" TO "anon";
GRANT ALL ON TABLE "public"."job_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."job_listings" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."offices" TO "anon";
GRANT ALL ON TABLE "public"."offices" TO "authenticated";
GRANT ALL ON TABLE "public"."offices" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quote_items" TO "anon";
GRANT ALL ON TABLE "public"."quote_items" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_items" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."salaries" TO "anon";
GRANT ALL ON TABLE "public"."salaries" TO "authenticated";
GRANT ALL ON TABLE "public"."salaries" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON TABLE "public"."trigger_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."trigger_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."trigger_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."warehouses" TO "anon";
GRANT ALL ON TABLE "public"."warehouses" TO "authenticated";
GRANT ALL ON TABLE "public"."warehouses" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

PGDMP                          }            postgres    15.8    15.12 (Homebrew) d   �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    5    postgres    DATABASE     t   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
    DROP DATABASE postgres;
                postgres    false            �           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    5118                        0    0    postgres    DATABASE PROPERTIES     >   ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
                     postgres    false                        2615    16388 
   extensions    SCHEMA        CREATE SCHEMA extensions;
    DROP SCHEMA extensions;
                postgres    false                        3079    22445    timescaledb 	   EXTENSION     C   CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA extensions;
    DROP EXTENSION timescaledb;
                   false    17                       0    0    EXTENSION timescaledb    COMMENT     |   COMMENT ON EXTENSION timescaledb IS 'Enables scalable inserts and complex queries for time-series data (Apache 2 Edition)';
                        false    2                        2615    16488    auth    SCHEMA        CREATE SCHEMA auth;
    DROP SCHEMA auth;
                supabase_admin    false                        2615    20536    drizzle    SCHEMA        CREATE SCHEMA drizzle;
    DROP SCHEMA drizzle;
                postgres    false                        2615    16618    graphql    SCHEMA        CREATE SCHEMA graphql;
    DROP SCHEMA graphql;
                supabase_admin    false                        2615    16607    graphql_public    SCHEMA        CREATE SCHEMA graphql_public;
    DROP SCHEMA graphql_public;
                supabase_admin    false                        2615    16386 	   pgbouncer    SCHEMA        CREATE SCHEMA pgbouncer;
    DROP SCHEMA pgbouncer;
             	   pgbouncer    false                        2615    16599    realtime    SCHEMA        CREATE SCHEMA realtime;
    DROP SCHEMA realtime;
                supabase_admin    false                        2615    16536    storage    SCHEMA        CREATE SCHEMA storage;
    DROP SCHEMA storage;
                supabase_admin    false                         2615    19099    supabase_migrations    SCHEMA     #   CREATE SCHEMA supabase_migrations;
 !   DROP SCHEMA supabase_migrations;
                postgres    false                        2615    16645    vault    SCHEMA        CREATE SCHEMA vault;
    DROP SCHEMA vault;
                supabase_admin    false                        3079    16673 
   pg_graphql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;
    DROP EXTENSION pg_graphql;
                   false    28                       0    0    EXTENSION pg_graphql    COMMENT     B   COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';
                        false    8                        3079    16389    pg_stat_statements 	   EXTENSION     J   CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
 #   DROP EXTENSION pg_stat_statements;
                   false    17                       0    0    EXTENSION pg_stat_statements    COMMENT     u   COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';
                        false    6                        3079    16434    pgcrypto 	   EXTENSION     @   CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
    DROP EXTENSION pgcrypto;
                   false    17                       0    0    EXTENSION pgcrypto    COMMENT     <   COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
                        false    4                        3079    16471    pgjwt 	   EXTENSION     =   CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;
    DROP EXTENSION pgjwt;
                   false    17    4                       0    0    EXTENSION pgjwt    COMMENT     C   COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';
                        false    3            	            3079    19737    postgres_fdw 	   EXTENSION     @   CREATE EXTENSION IF NOT EXISTS postgres_fdw WITH SCHEMA public;
    DROP EXTENSION postgres_fdw;
                   false                       0    0    EXTENSION postgres_fdw    COMMENT     [   COMMENT ON EXTENSION postgres_fdw IS 'foreign-data wrapper for remote PostgreSQL servers';
                        false    9                        3079    16646    supabase_vault 	   EXTENSION     A   CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
    DROP EXTENSION supabase_vault;
                   false    25                       0    0    EXTENSION supabase_vault    COMMENT     C   COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';
                        false    7                        3079    16423 	   uuid-ossp 	   EXTENSION     C   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
    DROP EXTENSION "uuid-ossp";
                   false    17                       0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                        false    5            �           1247    16762 	   aal_level    TYPE     K   CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);
    DROP TYPE auth.aal_level;
       auth          supabase_auth_admin    false    19            �           1247    16903    code_challenge_method    TYPE     L   CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);
 &   DROP TYPE auth.code_challenge_method;
       auth          supabase_auth_admin    false    19            �           1247    16756    factor_status    TYPE     M   CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);
    DROP TYPE auth.factor_status;
       auth          supabase_auth_admin    false    19            �           1247    16750    factor_type    TYPE     R   CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);
    DROP TYPE auth.factor_type;
       auth          supabase_auth_admin    false    19            �           1247    16945    one_time_token_type    TYPE     �   CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);
 $   DROP TYPE auth.one_time_token_type;
       auth          supabase_auth_admin    false    19                       1247    23311    activity_log_action_type    TYPE     �   CREATE TYPE public.activity_log_action_type AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATED',
    'UPDATED',
    'DELETED'
);
 +   DROP TYPE public.activity_log_action_type;
       public          postgres    false                        1247    23284    activity_log_target_type    TYPE     �   CREATE TYPE public.activity_log_target_type AS ENUM (
    'ENTERPRISE',
    'USER',
    'EMPLOYEE',
    'ROLE',
    'PERMISSION',
    'INVOICE',
    'EXPENSE',
    'SETTING',
    'NOTIFICATION',
    'SYSTEM'
);
 +   DROP TYPE public.activity_log_target_type;
       public          postgres    false            �           1247    23190    activity_target_type    TYPE     �  CREATE TYPE public.activity_target_type AS ENUM (
    'USER',
    'ROLE',
    'COMPANY',
    'CLIENT',
    'INVOICE',
    'EXPENSE',
    'QUOTE',
    'BRANCH',
    'VENDOR',
    'OFFICE',
    'WAREHOUSE',
    'PURCHASE',
    'PRODUCT',
    'EMPLOYEE',
    'DEPARTMENT',
    'SALARY',
    'JOB_LISTING',
    'APPLICANT',
    'JOB',
    'TEMPLATE',
    'DOCUMENT',
    'ENTERPRISE_SETTINGS',
    'EMPLOYEE_REQUEST',
    'DOMAIN'
);
 '   DROP TYPE public.activity_target_type;
       public          postgres    false            a           1247    21019    app_permission    TYPE     �  CREATE TYPE public.app_permission AS ENUM (
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.export',
    'users.invite',
    'roles.create',
    'roles.read',
    'roles.update',
    'roles.delete',
    'roles.export',
    'roles.assign',
    'companies.create',
    'companies.read',
    'companies.update',
    'companies.delete',
    'companies.export',
    'companies.duplicate',
    'branches.create',
    'branches.read',
    'branches.update',
    'branches.delete',
    'branches.export',
    'branches.duplicate',
    'clients.create',
    'clients.read',
    'clients.update',
    'clients.delete',
    'clients.export',
    'clients.duplicate',
    'vendors.create',
    'vendors.read',
    'vendors.update',
    'vendors.delete',
    'vendors.export',
    'vendors.duplicate',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'products.export',
    'products.duplicate',
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'invoices.delete',
    'invoices.export',
    'invoices.duplicate',
    'expenses.create',
    'expenses.read',
    'expenses.update',
    'expenses.delete',
    'expenses.export',
    'expenses.duplicate',
    'settings.read',
    'settings.update',
    'users.duplicate',
    'roles.duplicate',
    'jobs.read',
    'jobs.create',
    'jobs.delete',
    'jobs.update',
    'jobs.duplicate',
    'jobs.export',
    'job_listings.read',
    'job_listings.create',
    'job_listings.delete',
    'job_listings.update',
    'job_listings.duplicate',
    'job_listings.export',
    'departments.read',
    'departments.create',
    'departments.delete',
    'departments.update',
    'departments.duplicate',
    'departments.export',
    'salaries.read',
    'salaries.create',
    'salaries.delete',
    'salaries.update',
    'salaries.duplicate',
    'salaries.export',
    'offices.read',
    'offices.create',
    'offices.delete',
    'offices.update',
    'offices.duplicate',
    'offices.export',
    'warehouses.read',
    'warehouses.create',
    'warehouses.delete',
    'warehouses.update',
    'warehouses.duplicate',
    'warehouses.export',
    'employees.read',
    'employees.create',
    'employees.delete',
    'employees.update',
    'employees.duplicate',
    'employees.export',
    'employee_requests.read',
    'employee_requests.create',
    'employee_requests.delete',
    'employee_requests.update',
    'employee_requests.duplicate',
    'employee_requests.export',
    'quotes.read',
    'quotes.create',
    'quotes.delete',
    'quotes.update',
    'quotes.duplicate',
    'quotes.export',
    'activity_logs.read',
    'activity_logs.delete',
    'activity_logs.export',
    'domains.read',
    'domains.create',
    'domains.delete',
    'domains.update',
    'domains.export',
    'servers.read',
    'servers.create',
    'servers.delete',
    'servers.update',
    'servers.export',
    'servers.duplicate'
);
 !   DROP TYPE public.app_permission;
       public          postgres    false            U           1247    19771    app_role    TYPE     c   CREATE TYPE public.app_role AS ENUM (
    'superadmin',
    'admin',
    'accounting',
    'hr'
);
    DROP TYPE public.app_role;
       public          postgres    false            �           1247    29705    common_status    TYPE     h   CREATE TYPE public.common_status AS ENUM (
    'active',
    'inactive',
    'draft',
    'archived'
);
     DROP TYPE public.common_status;
       public          postgres    false            �           1247    29714    employee_status    TYPE        CREATE TYPE public.employee_status AS ENUM (
    'active',
    'inactive',
    'terminated',
    'on_leave',
    'resigned'
);
 "   DROP TYPE public.employee_status;
       public          postgres    false            m           1247    25929    payment_cycle    TYPE     J   CREATE TYPE public.payment_cycle AS ENUM (
    'monthly',
    'annual'
);
     DROP TYPE public.payment_cycle;
       public          postgres    false            �           1247    17112    action    TYPE     o   CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);
    DROP TYPE realtime.action;
       realtime          supabase_admin    false    31            �           1247    17072    equality_op    TYPE     v   CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);
     DROP TYPE realtime.equality_op;
       realtime          supabase_admin    false    31            �           1247    17087    user_defined_filter    TYPE     j   CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);
 (   DROP TYPE realtime.user_defined_filter;
       realtime          supabase_admin    false    31    1516            �           1247    17154 
   wal_column    TYPE     �   CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);
    DROP TYPE realtime.wal_column;
       realtime          supabase_admin    false    31            �           1247    17125    wal_rls    TYPE     s   CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);
    DROP TYPE realtime.wal_rls;
       realtime          supabase_admin    false    31            �           1255    16534    email()    FUNCTION       CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;
    DROP FUNCTION auth.email();
       auth          supabase_auth_admin    false    19            	           0    0    FUNCTION email()    COMMENT     X   COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';
          auth          supabase_auth_admin    false    459            r           1255    16732    jwt()    FUNCTION     �   CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;
    DROP FUNCTION auth.jwt();
       auth          supabase_auth_admin    false    19            �           1255    16533    role()    FUNCTION        CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;
    DROP FUNCTION auth.role();
       auth          supabase_auth_admin    false    19            
           0    0    FUNCTION role()    COMMENT     V   COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';
          auth          supabase_auth_admin    false    458            �           1255    16532    uid()    FUNCTION     �   CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
    DROP FUNCTION auth.uid();
       auth          supabase_auth_admin    false    19                       0    0    FUNCTION uid()    COMMENT     T   COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';
          auth          supabase_auth_admin    false    457            q           1255    16591    grant_pg_cron_access()    FUNCTION     �  CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;
 1   DROP FUNCTION extensions.grant_pg_cron_access();
    
   extensions          postgres    false    17                       0    0    FUNCTION grant_pg_cron_access()    COMMENT     U   COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';
       
   extensions          postgres    false    625            '           1255    16612    grant_pg_graphql_access()    FUNCTION     i	  CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;
 4   DROP FUNCTION extensions.grant_pg_graphql_access();
    
   extensions          supabase_admin    false    17                       0    0 "   FUNCTION grant_pg_graphql_access()    COMMENT     [   COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';
       
   extensions          supabase_admin    false    551            g           1255    16593    grant_pg_net_access()    FUNCTION     6  CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;
 0   DROP FUNCTION extensions.grant_pg_net_access();
    
   extensions          postgres    false    17                       0    0    FUNCTION grant_pg_net_access()    COMMENT     S   COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';
       
   extensions          postgres    false    615            -           1255    16603    pgrst_ddl_watch()    FUNCTION     >  CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;
 ,   DROP FUNCTION extensions.pgrst_ddl_watch();
    
   extensions          supabase_admin    false    17            $           1255    16604    pgrst_drop_watch()    FUNCTION       CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;
 -   DROP FUNCTION extensions.pgrst_drop_watch();
    
   extensions          supabase_admin    false    17            a           1255    16614    set_graphql_placeholder()    FUNCTION     r  CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;
 4   DROP FUNCTION extensions.set_graphql_placeholder();
    
   extensions          supabase_admin    false    17                       0    0 "   FUNCTION set_graphql_placeholder()    COMMENT     |   COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';
       
   extensions          supabase_admin    false    609            �           1255    16387    get_auth(text)    FUNCTION     �  CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;
 2   DROP FUNCTION pgbouncer.get_auth(p_usename text);
    	   pgbouncer          supabase_admin    false    15            b           1255    20546 )   create_enterprise(text, text, text, text)    FUNCTION     �  CREATE FUNCTION public.create_enterprise(enterprise_name text, enterprise_email text, enterprise_industry text, enterprise_size text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    new_enterprise_id uuid;
    admin_role_id uuid;
    current_user_id uuid := auth.uid(); -- Get the ID of the currently authenticated user
BEGIN
    -- Find the 'superadmin' role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'superadmin' LIMIT 1;

    -- Raise an exception if the 'superadmin' role is not found
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Superadmin role not found. Cannot create enterprise.';
    END IF;

    -- Insert the new enterprise
    INSERT INTO enterprises (name, email, industry, size)
    VALUES (enterprise_name, enterprise_email, enterprise_industry, enterprise_size)
    RETURNING id INTO new_enterprise_id;

    -- Insert the membership record linking the creator as superadmin
    INSERT INTO memberships (profile_id, enterprise_id, role_id)
    VALUES (current_user_id, new_enterprise_id, admin_role_id);

    -- Return the new enterprise's ID
    RETURN new_enterprise_id;
END;
$$;
 �   DROP FUNCTION public.create_enterprise(enterprise_name text, enterprise_email text, enterprise_industry text, enterprise_size text);
       public          postgres    false            �           1255    19715    custom_access_token_hook(jsonb)    FUNCTION     U  CREATE FUNCTION public.custom_access_token_hook(event jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
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
 <   DROP FUNCTION public.custom_access_token_hook(event jsonb);
       public          postgres    false                       1255    24445 '   get_activity_logs_with_user_email(uuid)    FUNCTION     I  CREATE FUNCTION public.get_activity_logs_with_user_email(p_enterprise_id uuid) RETURNS TABLE(id uuid, enterprise_id uuid, user_id uuid, action_type public.activity_log_action_type, target_type public.activity_target_type, target_id uuid, target_name text, details jsonb, created_at timestamp with time zone, user_email text, user_full_name text)
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT
    al.id,
    al.enterprise_id,
    al.user_id,
    al.action_type,
    al.target_type,
    al.target_id,
    al.target_name,
    al.details,
    al.created_at,
    p.email AS user_email,
    p.full_name AS user_full_name
  FROM
    public.activity_logs al
  LEFT JOIN auth.users u ON al.user_id = u.id
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE
    al.enterprise_id = p_enterprise_id
  ORDER BY
    al.created_at DESC;
$$;
 N   DROP FUNCTION public.get_activity_logs_with_user_email(p_enterprise_id uuid);
       public          postgres    false    1786    1795                       1255    25909 S   get_daily_activity_counts(uuid, timestamp with time zone, timestamp with time zone)    FUNCTION     /  CREATE FUNCTION public.get_daily_activity_counts(p_enterprise_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone) RETURNS TABLE(activity_date date, activity_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at AT TIME ZONE 'UTC') AS activity_date,
    COUNT(*) AS activity_count
  FROM
    activity_logs
  WHERE
    enterprise_id = p_enterprise_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date
  GROUP BY
    activity_date
  ORDER BY
    activity_date;
END;
$$;
 �   DROP FUNCTION public.get_daily_activity_counts(p_enterprise_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone);
       public          postgres    false            �           1255    20075    get_or_create_role(text, uuid)    FUNCTION     7  CREATE FUNCTION public.get_or_create_role(role_name text, enterprise_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Try to find existing role with table alias
  SELECT r.id INTO role_id
  FROM roles r
  WHERE r.name = role_name 
  AND r.enterprise_id = get_or_create_role.enterprise_id;
  
  -- If role doesn't exist, create it
  IF role_id IS NULL THEN
    INSERT INTO roles (name, enterprise_id)
    VALUES (role_name, get_or_create_role.enterprise_id)
    RETURNING id INTO role_id;
  END IF;
  
  RETURN role_id;
END;
$$;
 M   DROP FUNCTION public.get_or_create_role(role_name text, enterprise_id uuid);
       public          postgres    false            �           1255    21317    get_user_id_by_email(text)    FUNCTION     �   CREATE FUNCTION public.get_user_id_by_email(user_email text) RETURNS TABLE(id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT au.id FROM auth.users au WHERE au.email = user_email;
END;
$$;
 <   DROP FUNCTION public.get_user_id_by_email(user_email text);
       public          postgres    false            %           1255    20477     get_user_permissions(uuid, uuid)    FUNCTION     �  CREATE FUNCTION public.get_user_permissions(enterprise_id uuid, user_id uuid) RETURNS TABLE(permission text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT rp.permission::TEXT
  FROM user_roles ur
  INNER JOIN roles r ON r.id = ur.role_id
  INNER JOIN role_permissions rp ON rp.role_id = r.id
  WHERE ur.enterprise_id = get_user_permissions.enterprise_id
  AND ur.user_id = get_user_permissions.user_id;
END;
$$;
 M   DROP FUNCTION public.get_user_permissions(enterprise_id uuid, user_id uuid);
       public          postgres    false            �           1255    20018    handle_new_user()    FUNCTION     �  CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_enterprise_id uuid;
  new_role_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Extract email
  user_email := NEW.email;
  user_first_name := split_part(user_email, '@', 1); -- Use part before '@' as first name
  user_last_name := 'User'; -- Default last name

  -- Check if user is an enterprise owner
  IF (NEW.raw_user_meta_data->>'enterprise_owner')::boolean = true THEN
    -- Create a new enterprise for enterprise owners
    INSERT INTO public.enterprises (name, email, is_active)
    VALUES (user_first_name || '''s Enterprise', user_email, true)
    RETURNING id INTO new_enterprise_id;

    -- Get or create the superadmin role
    new_role_id := get_or_create_role('superadmin', new_enterprise_id);

    -- Create the user's profile
    INSERT INTO public.profiles (
      id,
      user_id,
      enterprise_id,
      email,
      first_name,
      last_name,
      role
    )
    VALUES (
      NEW.id,
      NEW.id,
      new_enterprise_id,
      user_email,
      user_first_name,
      user_last_name,
      'superadmin'
    );

    -- Add the user to user_roles with both role_id and deprecated_role
    INSERT INTO public.user_roles (user_id, role_id, enterprise_id, deprecated_role)
    VALUES (NEW.id, new_role_id, new_enterprise_id, 'superadmin');
  END IF;

  RETURN NEW;
END;
$$;
 (   DROP FUNCTION public.handle_new_user();
       public          postgres    false            �           1255    19730    handle_new_user_profile()    FUNCTION     Y  CREATE FUNCTION public.handle_new_user_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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
 0   DROP FUNCTION public.handle_new_user_profile();
       public          postgres    false            C           1255    20482    handle_new_user_role()    FUNCTION     [  CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  default_role_id uuid;
  user_metadata jsonb;
  enterprise_id uuid;
BEGIN
  -- Get user metadata from the JWT
  user_metadata := (auth.jwt() ->> 'user_metadata')::jsonb;
  
  -- Extract enterprise_id from metadata if it exists
  enterprise_id := (user_metadata ->> 'enterprise_id')::uuid;

  -- Get or create the default admin role for the user's enterprise
  IF enterprise_id IS NOT NULL THEN
    WITH enterprise_role AS (
      INSERT INTO public.roles (name, description, enterprise_id)
      VALUES (
        'Admin',
        'Default administrator role',
        enterprise_id
      )
      ON CONFLICT (name, enterprise_id) DO UPDATE SET updated_at = now()
      RETURNING id
    )
    SELECT id INTO default_role_id FROM enterprise_role;

    -- Create the user role assignment
    IF default_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id, enterprise_id)
      VALUES (NEW.id, default_role_id, enterprise_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.handle_new_user_role();
       public          postgres    false            �           1255    24682    is_member_of_enterprise(uuid)    FUNCTION     *  CREATE FUNCTION public.is_member_of_enterprise(p_enterprise_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships
    WHERE enterprise_id = p_enterprise_id
      AND profile_id = auth.uid()
  );
$$;
 D   DROP FUNCTION public.is_member_of_enterprise(p_enterprise_id uuid);
       public          postgres    false                       1255    23309    log_employee_activity()    FUNCTION     !  CREATE FUNCTION public.log_employee_activity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_old_data jsonb := null;
  v_new_data jsonb := null;
begin
  if TG_OP = 'INSERT' then
    v_new_data := to_jsonb(new);
  elsif TG_OP = 'UPDATE' then
    v_old_data := to_jsonb(old);
    v_new_data := to_jsonb(new);
  elsif TG_OP = 'DELETE' then
    v_old_data := to_jsonb(old);
  end if;

  insert into public.activity_logs (
    user_id,
    enterprise_id,
    action_type,
    table_name,
    record_id,
    old_record,
    new_record
  )
  values (
    auth.uid(),
    new.enterprise_id, 
    TG_OP::public.activity_log_action_type, -- Explicitly qualify the enum
    TG_TABLE_NAME::text,
    new.id,
    v_old_data,
    v_new_data
  );

  return coalesce(new, old);
end;
$$;
 .   DROP FUNCTION public.log_employee_activity();
       public          postgres    false                       1255    24696    module_log_branch()    FUNCTION       CREATE FUNCTION public.module_log_branch() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'BRANCH',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    -- Only raise a warning, do not re-raise the exception
    raise warning 'Error in module_log_branch trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;
$$;
 *   DROP FUNCTION public.module_log_branch();
       public          postgres    false                        1255    24688    module_log_client()    FUNCTION     i  CREATE FUNCTION public.module_log_client() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'CLIENT',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_client trigger: %', sqlerrm;
    raise exception 'Trigger module_log_client failed: %', sqlerrm;

end;
$$;
 *   DROP FUNCTION public.module_log_client();
       public          postgres    false                       1255    24446    module_log_company()    FUNCTION     U  CREATE FUNCTION public.module_log_company() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    -- Capture both old and new data for updates if desired
    -- log_details := jsonb_build_object('old_data', row_to_json(OLD), 'updated_data', row_to_json(NEW));
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
  elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'COMPANY', -- Set target_type to COMPANY
    record_data.id,
    record_data.name, -- Use company name as target_name
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_company trigger: %', sqlerrm;
    raise exception 'Trigger module_log_company failed: %', sqlerrm;

end;
$$;
 +   DROP FUNCTION public.module_log_company();
       public          postgres    false                       1255    23305    module_log_employee()    FUNCTION     2  CREATE FUNCTION public.module_log_employee() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW)); 
  elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  -- Use a known placeholder for easier debugging
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid); 

  -- Insert into activity_logs using the potentially placeholder user_id
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log, -- Use the variable here
    log_action_type,
    'EMPLOYEE', 
    record_data.id,
    coalesce(record_data.first_name, '') || ' ' || coalesce(record_data.last_name, ''),
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception 
  when others then
    -- Log any error during trigger execution (optional but helpful for debugging)
    raise warning 'Error in module_log_employee trigger: %', sqlerrm;
    -- Depending on requirements, you might want to still allow the original operation
    -- return NEW; -- or OLD for DELETE
    -- Or re-raise the error to halt the operation
    raise exception 'Trigger module_log_employee failed: %', sqlerrm;

end;
$$;
 ,   DROP FUNCTION public.module_log_employee();
       public          postgres    false                       1255    24667    module_log_employee_request()    FUNCTION     �  CREATE FUNCTION public.module_log_employee_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'EMPLOYEE_REQUEST', -- Set target_type to employee request
    record_data.id,
    record_data.title, -- Use employee request name as target_name
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_employee_request trigger: %', sqlerrm;
    raise exception 'Trigger module_log_employee_request failed: %', sqlerrm;

end;
$$;
 4   DROP FUNCTION public.module_log_employee_request();
       public          postgres    false            $           1255    24698    module_log_expense()    FUNCTION     m  CREATE FUNCTION public.module_log_expense() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'EXPENSE',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_expense trigger: %', sqlerrm;
    raise exception 'Trigger module_log_expense failed: %', sqlerrm;

end;
$$;
 +   DROP FUNCTION public.module_log_expense();
       public          postgres    false            "           1255    24692    module_log_office()    FUNCTION     i  CREATE FUNCTION public.module_log_office() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'OFFICE',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_office trigger: %', sqlerrm;
    raise exception 'Trigger module_log_office failed: %', sqlerrm;

end;
$$;
 *   DROP FUNCTION public.module_log_office();
       public          postgres    false            !           1255    24690    module_log_vendor()    FUNCTION     i  CREATE FUNCTION public.module_log_vendor() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'VENDOR',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_vendor trigger: %', sqlerrm;
    raise exception 'Trigger module_log_vendor failed: %', sqlerrm;

end;
$$;
 *   DROP FUNCTION public.module_log_vendor();
       public          postgres    false            #           1255    24694    module_log_warehouse()    FUNCTION     u  CREATE FUNCTION public.module_log_warehouse() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'WAREHOUSE',
    record_data.id,
    record_data.name,
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    raise warning 'Error in module_log_warehouse trigger: %', sqlerrm;
    raise exception 'Trigger module_log_warehouse failed: %', sqlerrm;

end;
$$;
 -   DROP FUNCTION public.module_log_warehouse();
       public          postgres    false            �           1255    19469    set_updated_at()    FUNCTION     �   CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;
 '   DROP FUNCTION public.set_updated_at();
       public          postgres    false                       1255    20257    sync_user_role_permissions()    FUNCTION     �  CREATE FUNCTION public.sync_user_role_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Clear existing entries that might be affected
    DELETE FROM public.user_role_permissions
    WHERE role_id IN (
        SELECT DISTINCT r.id 
        FROM public.roles r
        WHERE r.id IN (
            SELECT ur.role_id FROM public.user_roles ur
            UNION
            SELECT rp.role_id FROM public.role_permissions rp
        )
    );

    -- Insert fresh data
    INSERT INTO public.user_role_permissions (
        user_id,
        enterprise_id,
        role_id,
        role_name,
        permission_id,
        permission
    )
    SELECT DISTINCT
        ur.user_id,
        ur.enterprise_id,
        ur.role_id,
        r.name,
        rp.id,
        rp.permission
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id;

    RETURN NULL;
END;
$$;
 3   DROP FUNCTION public.sync_user_role_permissions();
       public          postgres    false            %           1255    25884 -   update_profile_subscription(uuid, text, text)    FUNCTION     �  CREATE FUNCTION public.update_profile_subscription(user_id_param uuid, subscription_param text, price_id_param text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Update profile with the subscription information
  UPDATE public.profiles
  SET 
    subscribed_to = subscription_param,
    price_id = price_id_param,
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$;
 t   DROP FUNCTION public.update_profile_subscription(user_id_param uuid, subscription_param text, price_id_param text);
       public          postgres    false            Q           1255    20504    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$;
 1   DROP FUNCTION public.update_updated_at_column();
       public          postgres    false            .           1255    20478    validate_user_role()    FUNCTION     �  CREATE FUNCTION public.validate_user_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  -- Check if the role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id = NEW.role_id) THEN
    RAISE EXCEPTION 'Invalid role_id';
  END IF;

  -- Check if the enterprise exists
  IF NEW.enterprise_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM enterprises WHERE id = NEW.enterprise_id) THEN
    RAISE EXCEPTION 'Invalid enterprise_id';
  END IF;

  -- Check if the user is already assigned this role in this enterprise
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role_id = NEW.role_id 
    AND enterprise_id = NEW.enterprise_id
  ) THEN
    RAISE EXCEPTION 'User already has this role in this enterprise';
  END IF;

  RETURN NEW;
END;
$$;
 +   DROP FUNCTION public.validate_user_role();
       public          postgres    false            �           1255    17147    apply_rls(jsonb, integer)    FUNCTION     �(  CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;
 G   DROP FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer);
       realtime          supabase_admin    false    1528    31            �           1255    17225 E   broadcast_changes(text, text, text, text, text, record, record, text)    FUNCTION       CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;
 �   DROP FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
       realtime          supabase_admin    false    31            �           1255    17159 C   build_prepared_statement_sql(text, regclass, realtime.wal_column[])    FUNCTION     �  CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;
 �   DROP FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
       realtime          supabase_admin    false    1531    31            �           1255    17109    cast(text, regtype)    FUNCTION       CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;
 8   DROP FUNCTION realtime."cast"(val text, type_ regtype);
       realtime          supabase_admin    false    31            �           1255    17104 <   check_equality_op(realtime.equality_op, regtype, text, text)    FUNCTION     U  CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;
 j   DROP FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
       realtime          supabase_admin    false    31    1516            �           1255    17155 Q   is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[])    FUNCTION     �  CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;
 z   DROP FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
       realtime          supabase_admin    false    31    1519    1531            �           1255    17166 *   list_changes(name, name, integer, integer)    FUNCTION     �  CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;
 v   DROP FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
       realtime          supabase_admin    false    1528    31            �           1255    17103    quote_wal2json(regclass)    FUNCTION     �  CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;
 8   DROP FUNCTION realtime.quote_wal2json(entity regclass);
       realtime          supabase_admin    false    31            �           1255    17224     send(jsonb, text, text, boolean)    FUNCTION       CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;
 U   DROP FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean);
       realtime          supabase_admin    false    31            �           1255    17101    subscription_check_filters()    FUNCTION     <
  CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;
 5   DROP FUNCTION realtime.subscription_check_filters();
       realtime          supabase_admin    false    31            �           1255    17136    to_regrole(text)    FUNCTION     �   CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;
 3   DROP FUNCTION realtime.to_regrole(role_name text);
       realtime          supabase_admin    false    31            �           1255    17218    topic()    FUNCTION     �   CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;
     DROP FUNCTION realtime.topic();
       realtime          supabase_realtime_admin    false    31            |           1255    17010 *   can_insert_object(text, text, uuid, jsonb)    FUNCTION     �  CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;
 _   DROP FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
       storage          supabase_storage_admin    false    18            u           1255    16984    extension(text)    FUNCTION     Z  CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;
 ,   DROP FUNCTION storage.extension(name text);
       storage          supabase_storage_admin    false    18            t           1255    16983    filename(text)    FUNCTION     �   CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;
 +   DROP FUNCTION storage.filename(name text);
       storage          supabase_storage_admin    false    18            s           1255    16982    foldername(text)    FUNCTION     �   CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;
 -   DROP FUNCTION storage.foldername(name text);
       storage          supabase_storage_admin    false    18            y           1255    16996    get_size_by_bucket()    FUNCTION        CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;
 ,   DROP FUNCTION storage.get_size_by_bucket();
       storage          supabase_storage_admin    false    18            }           1255    17049 L   list_multipart_uploads_with_delimiter(text, text, text, integer, text, text)    FUNCTION     9  CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;
 �   DROP FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
       storage          supabase_storage_admin    false    18            w           1255    17012 B   list_objects_with_delimiter(text, text, text, integer, text, text)    FUNCTION     �  CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;
 �   DROP FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
       storage          supabase_storage_admin    false    18                       1255    17065    operation()    FUNCTION     �   CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;
 #   DROP FUNCTION storage.operation();
       storage          supabase_storage_admin    false    18            ~           1255    16999 ?   search(text, text, integer, integer, integer, text, text, text)    FUNCTION       CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;
 �   DROP FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
       storage          supabase_storage_admin    false    18            {           1255    17000    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;
 2   DROP FUNCTION storage.update_updated_at_column();
       storage          supabase_storage_admin    false    18                       1259    16519    audit_log_entries    TABLE     �   CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT NULL::character varying
);
 #   DROP TABLE auth.audit_log_entries;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE audit_log_entries    COMMENT     R   COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';
          auth          supabase_auth_admin    false    274            #           1259    16907 
   flow_state    TABLE     �  CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);
    DROP TABLE auth.flow_state;
       auth         heap    supabase_auth_admin    false    1495    19                       0    0    TABLE flow_state    COMMENT     G   COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';
          auth          supabase_auth_admin    false    291                       1259    16704 
   identities    TABLE     �  CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
    DROP TABLE auth.identities;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE identities    COMMENT     U   COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';
          auth          supabase_auth_admin    false    282                       0    0    COLUMN identities.email    COMMENT     �   COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';
          auth          supabase_auth_admin    false    282                       1259    16512 	   instances    TABLE     �   CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
    DROP TABLE auth.instances;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE instances    COMMENT     Q   COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';
          auth          supabase_auth_admin    false    273                       1259    16794    mfa_amr_claims    TABLE     �   CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);
     DROP TABLE auth.mfa_amr_claims;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE mfa_amr_claims    COMMENT     ~   COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';
          auth          supabase_auth_admin    false    286                       1259    16782    mfa_challenges    TABLE       CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);
     DROP TABLE auth.mfa_challenges;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE mfa_challenges    COMMENT     _   COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';
          auth          supabase_auth_admin    false    285                       1259    16769    mfa_factors    TABLE     �  CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);
    DROP TABLE auth.mfa_factors;
       auth         heap    supabase_auth_admin    false    1465    19    1468                       0    0    TABLE mfa_factors    COMMENT     L   COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';
          auth          supabase_auth_admin    false    284            $           1259    16957    one_time_tokens    TABLE     �  CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);
 !   DROP TABLE auth.one_time_tokens;
       auth         heap    supabase_auth_admin    false    1501    19                       1259    16501    refresh_tokens    TABLE     8  CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);
     DROP TABLE auth.refresh_tokens;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE refresh_tokens    COMMENT     n   COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';
          auth          supabase_auth_admin    false    272                       1259    16500    refresh_tokens_id_seq    SEQUENCE     |   CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE auth.refresh_tokens_id_seq;
       auth          supabase_auth_admin    false    272    19                       0    0    refresh_tokens_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;
          auth          supabase_auth_admin    false    271            !           1259    16836    saml_providers    TABLE     H  CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);
     DROP TABLE auth.saml_providers;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE saml_providers    COMMENT     ]   COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';
          auth          supabase_auth_admin    false    289            "           1259    16854    saml_relay_states    TABLE     `  CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);
 #   DROP TABLE auth.saml_relay_states;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE saml_relay_states    COMMENT     �   COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';
          auth          supabase_auth_admin    false    290                       1259    16527    schema_migrations    TABLE     U   CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);
 #   DROP TABLE auth.schema_migrations;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE schema_migrations    COMMENT     X   COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';
          auth          supabase_auth_admin    false    275                       1259    16734    sessions    TABLE     T  CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);
    DROP TABLE auth.sessions;
       auth         heap    supabase_auth_admin    false    19    1471                       0    0    TABLE sessions    COMMENT     U   COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';
          auth          supabase_auth_admin    false    283                       0    0    COLUMN sessions.not_after    COMMENT     �   COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';
          auth          supabase_auth_admin    false    283                        1259    16821    sso_domains    TABLE       CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);
    DROP TABLE auth.sso_domains;
       auth         heap    supabase_auth_admin    false    19                       0    0    TABLE sso_domains    COMMENT     t   COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';
          auth          supabase_auth_admin    false    288                       1259    16812    sso_providers    TABLE       CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);
    DROP TABLE auth.sso_providers;
       auth         heap    supabase_auth_admin    false    19                        0    0    TABLE sso_providers    COMMENT     x   COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';
          auth          supabase_auth_admin    false    287            !           0    0     COLUMN sso_providers.resource_id    COMMENT     �   COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';
          auth          supabase_auth_admin    false    287                       1259    16489    users    TABLE       CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text,
    phone_change_token character varying(255) DEFAULT NULL::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT NULL::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT NULL::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);
    DROP TABLE auth.users;
       auth         heap    supabase_auth_admin    false    19            "           0    0    TABLE users    COMMENT     W   COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';
          auth          supabase_auth_admin    false    270            #           0    0    COLUMN users.is_sso_user    COMMENT     �   COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';
          auth          supabase_auth_admin    false    270            L           1259    20538    __drizzle_migrations    TABLE     v   CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);
 )   DROP TABLE drizzle.__drizzle_migrations;
       drizzle         heap    postgres    false    12            K           1259    20537    __drizzle_migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE drizzle.__drizzle_migrations_id_seq;
       drizzle          postgres    false    332    12            $           0    0    __drizzle_migrations_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;
          drizzle          postgres    false    331            �           1259    23235    activity_logs    TABLE     �  CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enterprise_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action_type public.activity_log_action_type NOT NULL,
    target_type public.activity_target_type NOT NULL,
    target_id uuid NOT NULL,
    target_name text,
    details jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
 !   DROP TABLE public.activity_logs;
       public         heap    postgres    false    1786    1795            .           1259    18599    branches    TABLE     A  CREATE TABLE public.branches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    code text,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    phone text,
    email text,
    manager uuid,
    status public.common_status DEFAULT 'active'::public.common_status,
    notes text,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL
);
    DROP TABLE public.branches;
       public         heap    postgres    false    5    17    1417    1417            /           1259    18611    clients    TABLE     �  CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    notes text,
    user_id uuid NOT NULL,
    company uuid,
    enterprise_id uuid NOT NULL
);
    DROP TABLE public.clients;
       public         heap    postgres    false            0           1259    18620 	   companies    TABLE     ^  CREATE TABLE public.companies (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    website text,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    industry text,
    size text,
    notes text,
    status public.common_status DEFAULT 'active'::public.common_status,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL
);
    DROP TABLE public.companies;
       public         heap    postgres    false    5    17    1417    1417            1           1259    18630    department_locations    TABLE     �  CREATE TABLE public.department_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    location_type text NOT NULL,
    location_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    CONSTRAINT location_type_check CHECK ((location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text])))
);
 (   DROP TABLE public.department_locations;
       public         heap    postgres    false            2           1259    18642    departments    TABLE     �  CREATE TABLE public.departments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    description text,
    user_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    status public.common_status DEFAULT 'active'::public.common_status,
    enterprise_id uuid NOT NULL
);
    DROP TABLE public.departments;
       public         heap    postgres    false    5    17    1417    1417            3           1259    18653 	   documents    TABLE     $  CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    url text NOT NULL,
    file_path text NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    CONSTRAINT documents_entity_type_check CHECK ((entity_type = ANY (ARRAY['company'::text, 'expense'::text])))
);
    DROP TABLE public.documents;
       public         heap    postgres    false            �           1259    25935    domains    TABLE     �  CREATE TABLE public.domains (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    domain_name text NOT NULL,
    registrar text,
    monthly_cost numeric(10,2),
    annual_cost numeric(10,2),
    payment_cycle public.payment_cycle,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    notes text
);
    DROP TABLE public.domains;
       public         heap    postgres    false    5    17    1645            4           1259    18664    employee_requests    TABLE     +  CREATE TABLE public.employee_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    title text NOT NULL,
    description text,
    start_date date,
    end_date date,
    amount numeric(10,2),
    attachments jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL
);
 %   DROP TABLE public.employee_requests;
       public         heap    postgres    false            5           1259    18676 	   employees    TABLE     �  CREATE TABLE public.employees (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    hire_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    termination_date date,
    department_id uuid,
    "position" text,
    salary jsonb DEFAULT '[]'::jsonb,
    notes text,
    status public.employee_status DEFAULT 'active'::public.employee_status,
    updated_at timestamp with time zone
);
    DROP TABLE public.employees;
       public         heap    postgres    false    5    17    1420    1420            %           0    0    COLUMN employees.salary    COMMENT     �   COMMENT ON COLUMN public.employees.salary IS 'Stores salary components as a JSON array, e.g., [{ "type": "base", "amount": 5000 }, { "type": "housing", "amount": 1000 }]';
          public          postgres    false    309            6           1259    18686    enterprises    TABLE     �   CREATE TABLE public.enterprises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    email text,
    industry text,
    size text
);
    DROP TABLE public.enterprises;
       public         heap    postgres    false            7           1259    18695    expenses    TABLE     �  CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enterprise_id uuid NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    incurred_at date DEFAULT CURRENT_DATE,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    category text NOT NULL,
    due_date date,
    issue_date date DEFAULT CURRENT_DATE,
    notes text,
    expense_number text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    user_id uuid NOT NULL
);
    DROP TABLE public.expenses;
       public         heap    postgres    false            8           1259    18705    invoice_items    TABLE     �  CREATE TABLE public.invoice_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    description text NOT NULL,
    quantity numeric(10,2) DEFAULT '1'::numeric NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    amount numeric(10,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    invoice_id uuid NOT NULL,
    product_id uuid
);
 !   DROP TABLE public.invoice_items;
       public         heap    postgres    false    5    17            9           1259    18716    invoices    TABLE     �  CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enterprise_id uuid,
    invoice_number text NOT NULL,
    issue_date date DEFAULT CURRENT_DATE,
    due_date date,
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    tax_amount numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END) STORED,
    total numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END) STORED,
    notes text,
    client_id uuid NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'partially_paid'::text, 'overdue'::text, 'void'::text])))
);
    DROP TABLE public.invoices;
       public         heap    postgres    false            :           1259    18732    job_listing_jobs    TABLE       CREATE TABLE public.job_listing_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_listing_id uuid NOT NULL,
    job_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL
);
 $   DROP TABLE public.job_listing_jobs;
       public         heap    postgres    false            ;           1259    18739    job_listings    TABLE     �  CREATE TABLE public.job_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status public.common_status DEFAULT 'active'::public.common_status,
    slug character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    currency text,
    locations jsonb DEFAULT '[]'::jsonb,
    departments jsonb DEFAULT '[]'::jsonb,
    enable_search_filtering boolean DEFAULT true
);
     DROP TABLE public.job_listings;
       public         heap    postgres    false    1417    1417            <           1259    18753    jobs    TABLE     �  CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    requirements text,
    location character varying(255),
    department character varying(255),
    type character varying(50) NOT NULL,
    salary numeric(10,2),
    status public.common_status DEFAULT 'active'::public.common_status,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    responsibilities text,
    benefits text
);
    DROP TABLE public.jobs;
       public         heap    postgres    false    1417    1417            =           1259    18764    memberships    TABLE     �   CREATE TABLE public.memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    enterprise_id uuid,
    role_id uuid,
    created_at timestamp with time zone DEFAULT now()
);
    DROP TABLE public.memberships;
       public         heap    postgres    false            >           1259    18773    offices    TABLE     @  CREATE TABLE public.offices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    phone text,
    email text,
    status public.common_status DEFAULT 'active'::public.common_status,
    user_id uuid NOT NULL,
    notes text,
    enterprise_id uuid NOT NULL,
    code text,
    manager uuid
);
    DROP TABLE public.offices;
       public         heap    postgres    false    5    17    1417    1417            O           1259    21154    permissions    TABLE       CREATE TABLE public.permissions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    role_id uuid,
    permission public.app_permission NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
    DROP TABLE public.permissions;
       public         heap    postgres    false    5    17    1633            ?           1259    18791    products    TABLE       CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    sku text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    cost numeric(10,2),
    stock_quantity numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    unit text,
    status public.common_status DEFAULT 'active'::public.common_status,
    notes text
);
    DROP TABLE public.products;
       public         heap    postgres    false    5    17    1417    1417            @           1259    18802    profiles    TABLE     �  CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    created_at timestamp with time zone DEFAULT now(),
    user_settings jsonb,
    role text DEFAULT 'user'::text NOT NULL,
    username text,
    enterprise_id uuid,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    stripe_customer_id text,
    subscribed_to text,
    price_id text
);
    DROP TABLE public.profiles;
       public         heap    postgres    false            A           1259    18812    quote_items    TABLE     �  CREATE TABLE public.quote_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    description text NOT NULL,
    quantity numeric(10,2) DEFAULT '1'::numeric NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    amount numeric(10,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    quote_id uuid NOT NULL,
    product_id uuid
);
    DROP TABLE public.quote_items;
       public         heap    postgres    false    5    17            B           1259    18823    quotes    TABLE     �  CREATE TABLE public.quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    quote_number text NOT NULL,
    issue_date date NOT NULL,
    expiry_date date NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    notes text,
    client_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tax_amount numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END) STORED,
    total numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END) STORED,
    enterprise_id uuid NOT NULL,
    CONSTRAINT quotes_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])))
);
    DROP TABLE public.quotes;
       public         heap    postgres    false    5    17            N           1259    21131    roles    TABLE     3  CREATE TABLE public.roles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    enterprise_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
    DROP TABLE public.roles;
       public         heap    postgres    false    5    17            C           1259    18850    salaries    TABLE       CREATE TABLE public.salaries (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    notes text,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    payment_frequency text DEFAULT 'monthly'::text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    deductions jsonb DEFAULT '[]'::jsonb,
    payment_date date
);
    DROP TABLE public.salaries;
       public         heap    postgres    false    5    17            �           1259    25969    servers    TABLE     �  CREATE TABLE public.servers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    ip_address inet,
    location text,
    provider text,
    os text,
    status public.common_status DEFAULT 'active'::public.common_status,
    tags jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    monthly_cost numeric(10,2),
    annual_cost numeric(10,2),
    payment_cycle public.payment_cycle
);
    DROP TABLE public.servers;
       public         heap    postgres    false    5    17    1417    1645    1417            D           1259    18861 	   templates    TABLE     �  CREATE TABLE public.templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    type text NOT NULL,
    content jsonb NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    CONSTRAINT templates_type_check CHECK ((type = ANY (ARRAY['invoice'::text, 'quote'::text])))
);
    DROP TABLE public.templates;
       public         heap    postgres    false    5    17            E           1259    18872    user_enterprise_roles    TABLE     ]  CREATE TABLE public.user_enterprise_roles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
 )   DROP TABLE public.user_enterprise_roles;
       public         heap    postgres    false    5    17            M           1259    20856    user_enterprises    VIEW     x   CREATE VIEW public.user_enterprises AS
 SELECT DISTINCT p.id AS user_id,
    p.enterprise_id
   FROM public.profiles p;
 #   DROP VIEW public.user_enterprises;
       public          postgres    false    320    320            P           1259    21185    user_permissions_view    VIEW     u  CREATE VIEW public.user_permissions_view AS
 SELECT DISTINCT m.profile_id AS user_id,
    p.id AS permission_id,
    (p.permission)::text AS permission_name,
    m.role_id,
    r.name AS role_name,
    m.enterprise_id,
    r.is_system
   FROM ((public.memberships m
     JOIN public.roles r ON ((m.role_id = r.id)))
     JOIN public.permissions p ON ((r.id = p.role_id)));
 (   DROP VIEW public.user_permissions_view;
       public          postgres    false    334    317    317    334    335    335    317    335    334            J           1259    20438 
   user_roles    TABLE     �   CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
    DROP TABLE public.user_roles;
       public         heap    postgres    false            F           1259    18888    vendors    TABLE     I  CREATE TABLE public.vendors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company text,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    notes text,
    user_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    enterprise_id uuid NOT NULL
);
    DROP TABLE public.vendors;
       public         heap    postgres    false    5    17            G           1259    18898 
   warehouses    TABLE     O  CREATE TABLE public.warehouses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    code text,
    short_address text,
    additional_number text,
    building_number text,
    street_name text,
    city text,
    region text,
    country text,
    zip_code text,
    capacity numeric(10,2),
    status public.common_status DEFAULT 'active'::public.common_status,
    notes text,
    user_id uuid NOT NULL,
    enterprise_id uuid NOT NULL,
    phone text,
    manager uuid
);
    DROP TABLE public.warehouses;
       public         heap    postgres    false    5    17    1417    1417            -           1259    17228    messages    TABLE     w  CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);
    DROP TABLE realtime.messages;
       realtime            supabase_realtime_admin    false    31            '           1259    17066    schema_migrations    TABLE     y   CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);
 '   DROP TABLE realtime.schema_migrations;
       realtime         heap    supabase_admin    false    31            *           1259    17089    subscription    TABLE     �  CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
 "   DROP TABLE realtime.subscription;
       realtime         heap    supabase_admin    false    1519    659    31    1519            )           1259    17088    subscription_id_seq    SEQUENCE     �   ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            realtime          supabase_admin    false    298    31                       1259    16540    buckets    TABLE     k  CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);
    DROP TABLE storage.buckets;
       storage         heap    supabase_storage_admin    false    18            &           0    0    COLUMN buckets.owner    COMMENT     X   COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';
          storage          supabase_storage_admin    false    276                       1259    16582 
   migrations    TABLE     �   CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE storage.migrations;
       storage         heap    supabase_storage_admin    false    18                       1259    16555    objects    TABLE     �  CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);
    DROP TABLE storage.objects;
       storage         heap    supabase_storage_admin    false    18            '           0    0    COLUMN objects.owner    COMMENT     X   COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';
          storage          supabase_storage_admin    false    277            %           1259    17014    s3_multipart_uploads    TABLE     j  CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);
 )   DROP TABLE storage.s3_multipart_uploads;
       storage         heap    supabase_storage_admin    false    18            &           1259    17028    s3_multipart_uploads_parts    TABLE     �  CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
 /   DROP TABLE storage.s3_multipart_uploads_parts;
       storage         heap    supabase_storage_admin    false    18            H           1259    19100    schema_migrations    TABLE     �   CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);
 2   DROP TABLE supabase_migrations.schema_migrations;
       supabase_migrations         heap    postgres    false    32            I           1259    19107 
   seed_files    TABLE     `   CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);
 +   DROP TABLE supabase_migrations.seed_files;
       supabase_migrations         heap    postgres    false    32            �           2604    16504    refresh_tokens id    DEFAULT     r   ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);
 >   ALTER TABLE auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
       auth          supabase_auth_admin    false    272    271    272                       2604    20541    __drizzle_migrations id    DEFAULT     �   ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);
 G   ALTER TABLE drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
       drizzle          postgres    false    332    331    332            d          0    22465 
   hypertable 
   TABLE DATA           
  COPY _timescaledb_catalog.hypertable (id, schema_name, table_name, associated_schema_name, associated_table_prefix, num_dimensions, chunk_sizing_func_schema, chunk_sizing_func_name, chunk_target_size, compression_state, compressed_hypertable_id, status) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    338   �B      j          0    22535    chunk 
   TABLE DATA           �   COPY _timescaledb_catalog.chunk (id, hypertable_id, schema_name, table_name, compressed_chunk_id, dropped, status, osm_chunk, creation_time) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    346   �B      o          0    22594    chunk_column_stats 
   TABLE DATA           �   COPY _timescaledb_catalog.chunk_column_stats (id, hypertable_id, chunk_id, column_name, range_start, range_end, valid) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    351   �B      f          0    22501 	   dimension 
   TABLE DATA           �   COPY _timescaledb_catalog.dimension (id, hypertable_id, column_name, column_type, aligned, num_slices, partitioning_func_schema, partitioning_func, interval_length, compress_interval_length, integer_now_func_schema, integer_now_func) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    342    C      h          0    22520    dimension_slice 
   TABLE DATA           a   COPY _timescaledb_catalog.dimension_slice (id, dimension_id, range_start, range_end) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    344   C      l          0    22560    chunk_constraint 
   TABLE DATA           �   COPY _timescaledb_catalog.chunk_constraint (chunk_id, dimension_slice_id, constraint_name, hypertable_constraint_name) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    347   :C      n          0    22577    chunk_index 
   TABLE DATA           o   COPY _timescaledb_catalog.chunk_index (chunk_id, index_name, hypertable_id, hypertable_index_name) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    349   WC      {          0    22773    compression_chunk_size 
   TABLE DATA           :  COPY _timescaledb_catalog.compression_chunk_size (chunk_id, compressed_chunk_id, uncompressed_heap_size, uncompressed_toast_size, uncompressed_index_size, compressed_heap_size, compressed_toast_size, compressed_index_size, numrows_pre_compression, numrows_post_compression, numrows_frozen_immediately) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    368   tC      z          0    22763    compression_settings 
   TABLE DATA           y   COPY _timescaledb_catalog.compression_settings (relid, segmentby, orderby, orderby_desc, orderby_nullsfirst) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    367   �C      t          0    22683    continuous_agg 
   TABLE DATA             COPY _timescaledb_catalog.continuous_agg (mat_hypertable_id, raw_hypertable_id, parent_mat_hypertable_id, user_view_schema, user_view_name, partial_view_schema, partial_view_name, direct_view_schema, direct_view_name, materialized_only, finalized) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    360   �C      |          0    22788    continuous_agg_migrate_plan 
   TABLE DATA           ~   COPY _timescaledb_catalog.continuous_agg_migrate_plan (mat_hypertable_id, start_ts, end_ts, user_view_definition) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    369   �C      }          0    22797     continuous_agg_migrate_plan_step 
   TABLE DATA           �   COPY _timescaledb_catalog.continuous_agg_migrate_plan_step (mat_hypertable_id, step_id, status, start_ts, end_ts, type, config) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    371   �C      u          0    22710    continuous_aggs_bucket_function 
   TABLE DATA           �   COPY _timescaledb_catalog.continuous_aggs_bucket_function (mat_hypertable_id, bucket_func, bucket_width, bucket_origin, bucket_offset, bucket_timezone, bucket_fixed_width) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    361   D      x          0    22743 +   continuous_aggs_hypertable_invalidation_log 
   TABLE DATA           �   COPY _timescaledb_catalog.continuous_aggs_hypertable_invalidation_log (hypertable_id, lowest_modified_value, greatest_modified_value) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    364   "D      v          0    22723 &   continuous_aggs_invalidation_threshold 
   TABLE DATA           h   COPY _timescaledb_catalog.continuous_aggs_invalidation_threshold (hypertable_id, watermark) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    362   ?D      y          0    22747 0   continuous_aggs_materialization_invalidation_log 
   TABLE DATA           �   COPY _timescaledb_catalog.continuous_aggs_materialization_invalidation_log (materialization_id, lowest_modified_value, greatest_modified_value) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    365   \D      w          0    22733    continuous_aggs_watermark 
   TABLE DATA           _   COPY _timescaledb_catalog.continuous_aggs_watermark (mat_hypertable_id, watermark) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    363   yD      s          0    22670    metadata 
   TABLE DATA           R   COPY _timescaledb_catalog.metadata (key, value, include_in_telemetry) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    358   �D      e          0    22487 
   tablespace 
   TABLE DATA           V   COPY _timescaledb_catalog.tablespace (id, hypertable_id, tablespace_name) FROM stdin;
    _timescaledb_catalog          supabase_admin    false    340   �D      r          0    22614    bgw_job 
   TABLE DATA             COPY _timescaledb_config.bgw_job (id, application_name, schedule_interval, max_runtime, max_retries, retry_period, proc_schema, proc_name, owner, scheduled, fixed_schedule, initial_start, hypertable_id, config, check_schema, check_name, timezone) FROM stdin;
    _timescaledb_config          supabase_admin    false    353   E      �          0    16519    audit_log_entries 
   TABLE DATA           [   COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
    auth          supabase_auth_admin    false    274   4E      �          0    16907 
   flow_state 
   TABLE DATA           �   COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
    auth          supabase_auth_admin    false    291   Iw      �          0    16704 
   identities 
   TABLE DATA           ~   COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
    auth          supabase_auth_admin    false    282   fw      �          0    16512 	   instances 
   TABLE DATA           T   COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    273   ��      �          0    16794    mfa_amr_claims 
   TABLE DATA           e   COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
    auth          supabase_auth_admin    false    286   ��      �          0    16782    mfa_challenges 
   TABLE DATA           |   COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
    auth          supabase_auth_admin    false    285   ��      �          0    16769    mfa_factors 
   TABLE DATA           �   COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
    auth          supabase_auth_admin    false    284   ��      �          0    16957    one_time_tokens 
   TABLE DATA           p   COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    292   ׉      �          0    16501    refresh_tokens 
   TABLE DATA           |   COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
    auth          supabase_auth_admin    false    272   �      �          0    16836    saml_providers 
   TABLE DATA           �   COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
    auth          supabase_auth_admin    false    289   �      �          0    16854    saml_relay_states 
   TABLE DATA           �   COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
    auth          supabase_auth_admin    false    290   :�      �          0    16527    schema_migrations 
   TABLE DATA           2   COPY auth.schema_migrations (version) FROM stdin;
    auth          supabase_auth_admin    false    275   W�      �          0    16734    sessions 
   TABLE DATA           �   COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
    auth          supabase_auth_admin    false    283   ��      �          0    16821    sso_domains 
   TABLE DATA           X   COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    288   מ      �          0    16812    sso_providers 
   TABLE DATA           N   COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    287   ��      �          0    16489    users 
   TABLE DATA           O  COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
    auth          supabase_auth_admin    false    270   �      �          0    20538    __drizzle_migrations 
   TABLE DATA           E   COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
    drizzle          postgres    false    332   t�      �          0    23235    activity_logs 
   TABLE DATA           �   COPY public.activity_logs (id, enterprise_id, user_id, action_type, target_type, target_id, target_name, details, created_at) FROM stdin;
    public          postgres    false    389   ��      �          0    18599    branches 
   TABLE DATA           �   COPY public.branches (id, created_at, name, code, short_address, additional_number, building_number, street_name, city, region, country, zip_code, phone, email, manager, status, notes, user_id, enterprise_id) FROM stdin;
    public          postgres    false    302   �      �          0    18611    clients 
   TABLE DATA           �   COPY public.clients (id, created_at, name, email, phone, short_address, additional_number, building_number, street_name, city, region, country, zip_code, notes, user_id, company, enterprise_id) FROM stdin;
    public          postgres    false    303   �       �          0    18620 	   companies 
   TABLE DATA           �   COPY public.companies (id, created_at, name, email, phone, website, short_address, additional_number, building_number, street_name, city, region, country, zip_code, industry, size, notes, status, user_id, enterprise_id) FROM stdin;
    public          postgres    false    304   B"      �          0    18630    department_locations 
   TABLE DATA           �   COPY public.department_locations (id, department_id, location_type, location_id, created_at, user_id, enterprise_id) FROM stdin;
    public          postgres    false    305   �#      �          0    18642    departments 
   TABLE DATA           t   COPY public.departments (id, created_at, name, description, user_id, updated_at, status, enterprise_id) FROM stdin;
    public          postgres    false    306   I%      �          0    18653 	   documents 
   TABLE DATA           �   COPY public.documents (id, created_at, updated_at, name, url, file_path, entity_id, entity_type, user_id, enterprise_id) FROM stdin;
    public          postgres    false    307   �&      �          0    25935    domains 
   TABLE DATA           �   COPY public.domains (id, domain_name, registrar, monthly_cost, annual_cost, payment_cycle, created_at, updated_at, user_id, enterprise_id, notes) FROM stdin;
    public          postgres    false    390   �&      �          0    18664    employee_requests 
   TABLE DATA           �   COPY public.employee_requests (id, employee_id, type, status, title, description, start_date, end_date, amount, attachments, notes, created_at, updated_at, user_id, enterprise_id) FROM stdin;
    public          postgres    false    308   Z'      �          0    18676 	   employees 
   TABLE DATA           ,  COPY public.employees (id, first_name, last_name, email, phone, hire_date, created_at, user_id, enterprise_id, short_address, additional_number, building_number, street_name, city, region, country, zip_code, termination_date, department_id, "position", salary, notes, status, updated_at) FROM stdin;
    public          postgres    false    309   �*      �          0    18686    enterprises 
   TABLE DATA           R   COPY public.enterprises (id, name, created_at, email, industry, size) FROM stdin;
    public          postgres    false    310   m3      �          0    18695    expenses 
   TABLE DATA           �   COPY public.expenses (id, enterprise_id, description, amount, incurred_at, created_by, created_at, category, due_date, issue_date, notes, expense_number, status, user_id) FROM stdin;
    public          postgres    false    311   q9      �          0    18705    invoice_items 
   TABLE DATA           r   COPY public.invoice_items (id, created_at, description, quantity, unit_price, invoice_id, product_id) FROM stdin;
    public          postgres    false    312   H:      �          0    18716    invoices 
   TABLE DATA           �   COPY public.invoices (id, enterprise_id, invoice_number, issue_date, due_date, status, subtotal, tax_rate, notes, client_id, created_by, created_at, user_id) FROM stdin;
    public          postgres    false    313   %=      �          0    18732    job_listing_jobs 
   TABLE DATA           j   COPY public.job_listing_jobs (id, job_listing_id, job_id, created_at, user_id, enterprise_id) FROM stdin;
    public          postgres    false    314   �=      �          0    18739    job_listings 
   TABLE DATA           �   COPY public.job_listings (id, title, description, status, slug, created_at, updated_at, user_id, enterprise_id, is_public, currency, locations, departments, enable_search_filtering) FROM stdin;
    public          postgres    false    315   �@      �          0    18753    jobs 
   TABLE DATA           �   COPY public.jobs (id, title, description, requirements, location, department, type, salary, status, start_date, end_date, created_at, updated_at, user_id, enterprise_id, responsibilities, benefits) FROM stdin;
    public          postgres    false    316   �A      �          0    18764    memberships 
   TABLE DATA           Y   COPY public.memberships (id, profile_id, enterprise_id, role_id, created_at) FROM stdin;
    public          postgres    false    317   F      �          0    18773    offices 
   TABLE DATA           �   COPY public.offices (id, created_at, name, short_address, additional_number, building_number, street_name, city, region, country, zip_code, phone, email, status, user_id, notes, enterprise_id, code, manager) FROM stdin;
    public          postgres    false    318   tO      �          0    21154    permissions 
   TABLE DATA           V   COPY public.permissions (id, role_id, permission, created_at, updated_at) FROM stdin;
    public          postgres    false    335   �P      �          0    18791    products 
   TABLE DATA           �   COPY public.products (id, name, description, price, sku, created_at, user_id, enterprise_id, cost, stock_quantity, unit, status, notes) FROM stdin;
    public          postgres    false    319   (a      �          0    18802    profiles 
   TABLE DATA           �   COPY public.profiles (id, email, full_name, created_at, user_settings, role, username, enterprise_id, updated_at, stripe_customer_id, subscribed_to, price_id) FROM stdin;
    public          postgres    false    320   �b      �          0    18812    quote_items 
   TABLE DATA           n   COPY public.quote_items (id, created_at, description, quantity, unit_price, quote_id, product_id) FROM stdin;
    public          postgres    false    321   &n      �          0    18823    quotes 
   TABLE DATA           �   COPY public.quotes (id, created_at, quote_number, issue_date, expiry_date, status, subtotal, tax_rate, notes, client_id, user_id, enterprise_id) FROM stdin;
    public          postgres    false    322   Cn      �          0    21131    roles 
   TABLE DATA           h   COPY public.roles (id, name, description, is_system, enterprise_id, created_at, updated_at) FROM stdin;
    public          postgres    false    334   `n      �          0    18850    salaries 
   TABLE DATA           �   COPY public.salaries (id, created_at, notes, user_id, enterprise_id, employee_id, amount, currency, payment_frequency, start_date, end_date, deductions, payment_date) FROM stdin;
    public          postgres    false    323   [o      �          0    25969    servers 
   TABLE DATA           �   COPY public.servers (id, name, ip_address, location, provider, os, status, tags, notes, created_at, updated_at, user_id, enterprise_id, monthly_cost, annual_cost, payment_cycle) FROM stdin;
    public          postgres    false    391   q      �          0    18861 	   templates 
   TABLE DATA           l   COPY public.templates (id, created_at, name, type, content, is_default, user_id, enterprise_id) FROM stdin;
    public          postgres    false    324   �r      �          0    18872    user_enterprise_roles 
   TABLE DATA           l   COPY public.user_enterprise_roles (id, user_id, enterprise_id, role_id, created_at, updated_at) FROM stdin;
    public          postgres    false    325   �r      �          0    20438 
   user_roles 
   TABLE DATA           Q   COPY public.user_roles (user_id, role_id, enterprise_id, created_at) FROM stdin;
    public          postgres    false    330   �r      �          0    18888    vendors 
   TABLE DATA           �   COPY public.vendors (id, created_at, name, email, phone, company, short_address, additional_number, building_number, street_name, city, region, country, zip_code, notes, user_id, updated_at, enterprise_id) FROM stdin;
    public          postgres    false    326   	s      �          0    18898 
   warehouses 
   TABLE DATA           �   COPY public.warehouses (id, created_at, name, code, short_address, additional_number, building_number, street_name, city, region, country, zip_code, capacity, status, notes, user_id, enterprise_id, phone, manager) FROM stdin;
    public          postgres    false    327   &s      �          0    17066    schema_migrations 
   TABLE DATA           C   COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
    realtime          supabase_admin    false    295   �t      �          0    17089    subscription 
   TABLE DATA           b   COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
    realtime          supabase_admin    false    298   �v      �          0    16540    buckets 
   TABLE DATA           �   COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
    storage          supabase_storage_admin    false    276   �v      �          0    16582 
   migrations 
   TABLE DATA           B   COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
    storage          supabase_storage_admin    false    278   �v      �          0    16555    objects 
   TABLE DATA           �   COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
    storage          supabase_storage_admin    false    277   �{      �          0    17014    s3_multipart_uploads 
   TABLE DATA           �   COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
    storage          supabase_storage_admin    false    293   �{      �          0    17028    s3_multipart_uploads_parts 
   TABLE DATA           �   COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
    storage          supabase_storage_admin    false    294   �{      �          0    19100    schema_migrations 
   TABLE DATA           p   COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key) FROM stdin;
    supabase_migrations          postgres    false    328   �{      �          0    19107 
   seed_files 
   TABLE DATA           =   COPY supabase_migrations.seed_files (path, hash) FROM stdin;
    supabase_migrations          postgres    false    329   �
                0    16650    secrets 
   TABLE DATA           f   COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
    vault          supabase_admin    false    279   �
      (           0    0    chunk_column_stats_id_seq    SEQUENCE SET     V   SELECT pg_catalog.setval('_timescaledb_catalog.chunk_column_stats_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    350            )           0    0    chunk_constraint_name    SEQUENCE SET     R   SELECT pg_catalog.setval('_timescaledb_catalog.chunk_constraint_name', 1, false);
          _timescaledb_catalog          supabase_admin    false    348            *           0    0    chunk_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('_timescaledb_catalog.chunk_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    345            +           0    0 ,   continuous_agg_migrate_plan_step_step_id_seq    SEQUENCE SET     i   SELECT pg_catalog.setval('_timescaledb_catalog.continuous_agg_migrate_plan_step_step_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    370            ,           0    0    dimension_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('_timescaledb_catalog.dimension_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    341            -           0    0    dimension_slice_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('_timescaledb_catalog.dimension_slice_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    343            .           0    0    hypertable_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('_timescaledb_catalog.hypertable_id_seq', 1, false);
          _timescaledb_catalog          supabase_admin    false    337            /           0    0    bgw_job_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('_timescaledb_config.bgw_job_id_seq', 1000, false);
          _timescaledb_config          supabase_admin    false    352            0           0    0    refresh_tokens_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 137, true);
          auth          supabase_auth_admin    false    271            1           0    0    __drizzle_migrations_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);
          drizzle          postgres    false    331            2           0    0    subscription_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);
          realtime          supabase_admin    false    297            �           2606    16807    mfa_amr_claims amr_id_pk 
   CONSTRAINT     T   ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);
 @   ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT amr_id_pk;
       auth            supabase_auth_admin    false    286            m           2606    16525 (   audit_log_entries audit_log_entries_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY auth.audit_log_entries DROP CONSTRAINT audit_log_entries_pkey;
       auth            supabase_auth_admin    false    274            �           2606    16913    flow_state flow_state_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY auth.flow_state DROP CONSTRAINT flow_state_pkey;
       auth            supabase_auth_admin    false    291            �           2606    16931    identities identities_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_pkey;
       auth            supabase_auth_admin    false    282            �           2606    16941 1   identities identities_provider_id_provider_unique 
   CONSTRAINT     {   ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);
 Y   ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_provider_id_provider_unique;
       auth            supabase_auth_admin    false    282    282            k           2606    16518    instances instances_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY auth.instances DROP CONSTRAINT instances_pkey;
       auth            supabase_auth_admin    false    273            �           2606    16800 C   mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);
 k   ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey;
       auth            supabase_auth_admin    false    286    286            �           2606    16788 "   mfa_challenges mfa_challenges_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_pkey;
       auth            supabase_auth_admin    false    285            �           2606    16981 .   mfa_factors mfa_factors_last_challenged_at_key 
   CONSTRAINT     u   ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);
 V   ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_last_challenged_at_key;
       auth            supabase_auth_admin    false    284            �           2606    16775    mfa_factors mfa_factors_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_pkey;
       auth            supabase_auth_admin    false    284            �           2606    16966 $   one_time_tokens one_time_tokens_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_pkey;
       auth            supabase_auth_admin    false    292            e           2606    16508 "   refresh_tokens refresh_tokens_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
       auth            supabase_auth_admin    false    272            h           2606    16717 *   refresh_tokens refresh_tokens_token_unique 
   CONSTRAINT     d   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);
 R   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_token_unique;
       auth            supabase_auth_admin    false    272            �           2606    16847 +   saml_providers saml_providers_entity_id_key 
   CONSTRAINT     i   ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);
 S   ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_entity_id_key;
       auth            supabase_auth_admin    false    289            �           2606    16845 "   saml_providers saml_providers_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_pkey;
       auth            supabase_auth_admin    false    289            �           2606    16861 (   saml_relay_states saml_relay_states_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_pkey;
       auth            supabase_auth_admin    false    290            p           2606    16531 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 P   ALTER TABLE ONLY auth.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       auth            supabase_auth_admin    false    275            �           2606    16738    sessions sessions_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_pkey;
       auth            supabase_auth_admin    false    283            �           2606    16828    sso_domains sso_domains_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_pkey;
       auth            supabase_auth_admin    false    288            �           2606    16819     sso_providers sso_providers_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY auth.sso_providers DROP CONSTRAINT sso_providers_pkey;
       auth            supabase_auth_admin    false    287            ^           2606    16901    users users_phone_key 
   CONSTRAINT     O   ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);
 =   ALTER TABLE ONLY auth.users DROP CONSTRAINT users_phone_key;
       auth            supabase_auth_admin    false    270            `           2606    16495    users users_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
       auth            supabase_auth_admin    false    270            [           2606    20545 .   __drizzle_migrations __drizzle_migrations_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);
 Y   ALTER TABLE ONLY drizzle.__drizzle_migrations DROP CONSTRAINT __drizzle_migrations_pkey;
       drizzle            postgres    false    332            �           2606    23243 ,   activity_logs activity_logs_id_created_at_pk 
   CONSTRAINT     v   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_id_created_at_pk PRIMARY KEY (id, created_at);
 V   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_id_created_at_pk;
       public            postgres    false    389    389            �           2606    18610    branches branches_code_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);
 D   ALTER TABLE ONLY public.branches DROP CONSTRAINT branches_code_key;
       public            postgres    false    302            �           2606    18608    branches branches_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.branches DROP CONSTRAINT branches_pkey;
       public            postgres    false    302            �           2606    18619    clients clients_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.clients DROP CONSTRAINT clients_pkey;
       public            postgres    false    303            �           2606    18629    companies companies_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.companies DROP CONSTRAINT companies_pkey;
       public            postgres    false    304            �           2606    18639 .   department_locations department_locations_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.department_locations
    ADD CONSTRAINT department_locations_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.department_locations DROP CONSTRAINT department_locations_pkey;
       public            postgres    false    305            �           2606    18652    departments departments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
       public            postgres    false    306            �           2606    18663    documents documents_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.documents DROP CONSTRAINT documents_pkey;
       public            postgres    false    307            �           2606    25946 0   domains domains_enterprise_id_domain_name_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_enterprise_id_domain_name_unique UNIQUE (enterprise_id, domain_name);
 Z   ALTER TABLE ONLY public.domains DROP CONSTRAINT domains_enterprise_id_domain_name_unique;
       public            postgres    false    390    390            �           2606    25944    domains domains_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.domains DROP CONSTRAINT domains_pkey;
       public            postgres    false    390            �           2606    18675 (   employee_requests employee_requests_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.employee_requests DROP CONSTRAINT employee_requests_pkey;
       public            postgres    false    308            �           2606    18685    employees employees_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public            postgres    false    309            �           2606    18694    enterprises enterprises_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.enterprises
    ADD CONSTRAINT enterprises_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.enterprises DROP CONSTRAINT enterprises_pkey;
       public            postgres    false    310            �           2606    18704    expenses expenses_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_pkey;
       public            postgres    false    311            �           2606    18715     invoice_items invoice_items_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.invoice_items DROP CONSTRAINT invoice_items_pkey;
       public            postgres    false    312            �           2606    18731    invoices invoices_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_pkey;
       public            postgres    false    313                       2606    18738 &   job_listing_jobs job_listing_jobs_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.job_listing_jobs
    ADD CONSTRAINT job_listing_jobs_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.job_listing_jobs DROP CONSTRAINT job_listing_jobs_pkey;
       public            postgres    false    314                       2606    18750    job_listings job_listings_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.job_listings
    ADD CONSTRAINT job_listings_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.job_listings DROP CONSTRAINT job_listings_pkey;
       public            postgres    false    315            	           2606    18752 %   job_listings job_listings_slug_unique 
   CONSTRAINT     `   ALTER TABLE ONLY public.job_listings
    ADD CONSTRAINT job_listings_slug_unique UNIQUE (slug);
 O   ALTER TABLE ONLY public.job_listings DROP CONSTRAINT job_listings_slug_unique;
       public            postgres    false    315                       2606    18763    jobs jobs_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pkey;
       public            postgres    false    316                       2606    18770    memberships memberships_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_pkey;
       public            postgres    false    317                       2606    18772 4   memberships memberships_profile_id_enterprise_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_profile_id_enterprise_id_key UNIQUE (profile_id, enterprise_id);
 ^   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_profile_id_enterprise_id_key;
       public            postgres    false    317    317                       2606    18782    offices offices_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.offices DROP CONSTRAINT offices_pkey;
       public            postgres    false    318            a           2606    21161    permissions permissions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public            postgres    false    335            c           2606    21163 .   permissions permissions_role_id_permission_key 
   CONSTRAINT     x   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_permission_key UNIQUE (role_id, permission);
 X   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_role_id_permission_key;
       public            postgres    false    335    335                        2606    18801    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public            postgres    false    319            %           2606    18811    profiles profiles_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_email_key;
       public            postgres    false    320            (           2606    18809    profiles profiles_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
       public            postgres    false    320            ,           2606    18822    quote_items quote_items_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.quote_items DROP CONSTRAINT quote_items_pkey;
       public            postgres    false    321            0           2606    18837    quotes quotes_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.quotes DROP CONSTRAINT quotes_pkey;
       public            postgres    false    322            ]           2606    21143 "   roles roles_name_enterprise_id_key 
   CONSTRAINT     l   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_enterprise_id_key UNIQUE (name, enterprise_id);
 L   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_enterprise_id_key;
       public            postgres    false    334    334            _           2606    21141    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            postgres    false    334            5           2606    18860    salaries salaries_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.salaries DROP CONSTRAINT salaries_pkey;
       public            postgres    false    323            �           2606    25980    servers servers_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.servers DROP CONSTRAINT servers_pkey;
       public            postgres    false    391            9           2606    18871    templates templates_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.templates DROP CONSTRAINT templates_pkey;
       public            postgres    false    324            �           2606    18641 /   department_locations unique_department_location 
   CONSTRAINT     �   ALTER TABLE ONLY public.department_locations
    ADD CONSTRAINT unique_department_location UNIQUE (department_id, location_type, location_id);
 Y   ALTER TABLE ONLY public.department_locations DROP CONSTRAINT unique_department_location;
       public            postgres    false    305    305    305            =           2606    18879 0   user_enterprise_roles user_enterprise_roles_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.user_enterprise_roles
    ADD CONSTRAINT user_enterprise_roles_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.user_enterprise_roles DROP CONSTRAINT user_enterprise_roles_pkey;
       public            postgres    false    325            ?           2606    18881 E   user_enterprise_roles user_enterprise_roles_user_id_enterprise_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_enterprise_roles
    ADD CONSTRAINT user_enterprise_roles_user_id_enterprise_id_key UNIQUE (user_id, enterprise_id);
 o   ALTER TABLE ONLY public.user_enterprise_roles DROP CONSTRAINT user_enterprise_roles_user_id_enterprise_id_key;
       public            postgres    false    325    325            W           2606    20443    user_roles user_roles_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, enterprise_id);
 D   ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_pkey;
       public            postgres    false    330    330    330            D           2606    18897    vendors vendors_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.vendors DROP CONSTRAINT vendors_pkey;
       public            postgres    false    326            J           2606    18909    warehouses warehouses_code_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_code_key UNIQUE (code);
 H   ALTER TABLE ONLY public.warehouses DROP CONSTRAINT warehouses_code_key;
       public            postgres    false    327            M           2606    18907    warehouses warehouses_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.warehouses DROP CONSTRAINT warehouses_pkey;
       public            postgres    false    327            �           2606    17242    messages messages_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);
 B   ALTER TABLE ONLY realtime.messages DROP CONSTRAINT messages_pkey;
       realtime            supabase_realtime_admin    false    301    301            �           2606    17097    subscription pk_subscription 
   CONSTRAINT     \   ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);
 H   ALTER TABLE ONLY realtime.subscription DROP CONSTRAINT pk_subscription;
       realtime            supabase_admin    false    298            �           2606    17070 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 T   ALTER TABLE ONLY realtime.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       realtime            supabase_admin    false    295            s           2606    16548    buckets buckets_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);
 ?   ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_pkey;
       storage            supabase_storage_admin    false    276            z           2606    16589    migrations migrations_name_key 
   CONSTRAINT     Z   ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);
 I   ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_name_key;
       storage            supabase_storage_admin    false    278            |           2606    16587    migrations migrations_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
 E   ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_pkey;
       storage            supabase_storage_admin    false    278            x           2606    16565    objects objects_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);
 ?   ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_pkey;
       storage            supabase_storage_admin    false    277            �           2606    17037 :   s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);
 e   ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_pkey;
       storage            supabase_storage_admin    false    294            �           2606    17022 .   s3_multipart_uploads s3_multipart_uploads_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);
 Y   ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_pkey;
       storage            supabase_storage_admin    false    293            P           2606    23333 7   schema_migrations schema_migrations_idempotency_key_key 
   CONSTRAINT     �   ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);
 n   ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_idempotency_key_key;
       supabase_migrations            postgres    false    328            R           2606    19106 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 _   ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       supabase_migrations            postgres    false    328            T           2606    19113    seed_files seed_files_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);
 Q   ALTER TABLE ONLY supabase_migrations.seed_files DROP CONSTRAINT seed_files_pkey;
       supabase_migrations            postgres    false    329            n           1259    16526    audit_logs_instance_id_idx    INDEX     ]   CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);
 ,   DROP INDEX auth.audit_logs_instance_id_idx;
       auth            supabase_auth_admin    false    274            T           1259    16727    confirmation_token_idx    INDEX     �   CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);
 (   DROP INDEX auth.confirmation_token_idx;
       auth            supabase_auth_admin    false    270    270            U           1259    16729    email_change_token_current_idx    INDEX     �   CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);
 0   DROP INDEX auth.email_change_token_current_idx;
       auth            supabase_auth_admin    false    270    270            V           1259    16730    email_change_token_new_idx    INDEX     �   CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);
 ,   DROP INDEX auth.email_change_token_new_idx;
       auth            supabase_auth_admin    false    270    270            �           1259    16809    factor_id_created_at_idx    INDEX     ]   CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);
 *   DROP INDEX auth.factor_id_created_at_idx;
       auth            supabase_auth_admin    false    284    284            �           1259    16917    flow_state_created_at_idx    INDEX     Y   CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);
 +   DROP INDEX auth.flow_state_created_at_idx;
       auth            supabase_auth_admin    false    291            �           1259    16897    identities_email_idx    INDEX     [   CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);
 &   DROP INDEX auth.identities_email_idx;
       auth            supabase_auth_admin    false    282            3           0    0    INDEX identities_email_idx    COMMENT     c   COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';
          auth          supabase_auth_admin    false    4480            �           1259    16724    identities_user_id_idx    INDEX     N   CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);
 (   DROP INDEX auth.identities_user_id_idx;
       auth            supabase_auth_admin    false    282            �           1259    16914    idx_auth_code    INDEX     G   CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);
    DROP INDEX auth.idx_auth_code;
       auth            supabase_auth_admin    false    291            �           1259    16915    idx_user_id_auth_method    INDEX     f   CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);
 )   DROP INDEX auth.idx_user_id_auth_method;
       auth            supabase_auth_admin    false    291    291            �           1259    16920    mfa_challenge_created_at_idx    INDEX     `   CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);
 .   DROP INDEX auth.mfa_challenge_created_at_idx;
       auth            supabase_auth_admin    false    285            �           1259    16781 %   mfa_factors_user_friendly_name_unique    INDEX     �   CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);
 7   DROP INDEX auth.mfa_factors_user_friendly_name_unique;
       auth            supabase_auth_admin    false    284    284    284            �           1259    16926    mfa_factors_user_id_idx    INDEX     P   CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);
 )   DROP INDEX auth.mfa_factors_user_id_idx;
       auth            supabase_auth_admin    false    284            �           1259    16973 #   one_time_tokens_relates_to_hash_idx    INDEX     b   CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);
 5   DROP INDEX auth.one_time_tokens_relates_to_hash_idx;
       auth            supabase_auth_admin    false    292            �           1259    16972 #   one_time_tokens_token_hash_hash_idx    INDEX     b   CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);
 5   DROP INDEX auth.one_time_tokens_token_hash_hash_idx;
       auth            supabase_auth_admin    false    292            �           1259    16974 &   one_time_tokens_user_id_token_type_key    INDEX     v   CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);
 8   DROP INDEX auth.one_time_tokens_user_id_token_type_key;
       auth            supabase_auth_admin    false    292    292            W           1259    16731    reauthentication_token_idx    INDEX     �   CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);
 ,   DROP INDEX auth.reauthentication_token_idx;
       auth            supabase_auth_admin    false    270    270            X           1259    16728    recovery_token_idx    INDEX     �   CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);
 $   DROP INDEX auth.recovery_token_idx;
       auth            supabase_auth_admin    false    270    270            a           1259    16509    refresh_tokens_instance_id_idx    INDEX     ^   CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
 0   DROP INDEX auth.refresh_tokens_instance_id_idx;
       auth            supabase_auth_admin    false    272            b           1259    16510 &   refresh_tokens_instance_id_user_id_idx    INDEX     o   CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
 8   DROP INDEX auth.refresh_tokens_instance_id_user_id_idx;
       auth            supabase_auth_admin    false    272    272            c           1259    16723    refresh_tokens_parent_idx    INDEX     T   CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);
 +   DROP INDEX auth.refresh_tokens_parent_idx;
       auth            supabase_auth_admin    false    272            f           1259    16811 %   refresh_tokens_session_id_revoked_idx    INDEX     m   CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);
 7   DROP INDEX auth.refresh_tokens_session_id_revoked_idx;
       auth            supabase_auth_admin    false    272    272            i           1259    16916    refresh_tokens_updated_at_idx    INDEX     a   CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);
 /   DROP INDEX auth.refresh_tokens_updated_at_idx;
       auth            supabase_auth_admin    false    272            �           1259    16853 "   saml_providers_sso_provider_id_idx    INDEX     f   CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);
 4   DROP INDEX auth.saml_providers_sso_provider_id_idx;
       auth            supabase_auth_admin    false    289            �           1259    16918     saml_relay_states_created_at_idx    INDEX     g   CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);
 2   DROP INDEX auth.saml_relay_states_created_at_idx;
       auth            supabase_auth_admin    false    290            �           1259    16868    saml_relay_states_for_email_idx    INDEX     `   CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);
 1   DROP INDEX auth.saml_relay_states_for_email_idx;
       auth            supabase_auth_admin    false    290            �           1259    16867 %   saml_relay_states_sso_provider_id_idx    INDEX     l   CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);
 7   DROP INDEX auth.saml_relay_states_sso_provider_id_idx;
       auth            supabase_auth_admin    false    290            �           1259    16919    sessions_not_after_idx    INDEX     S   CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);
 (   DROP INDEX auth.sessions_not_after_idx;
       auth            supabase_auth_admin    false    283            �           1259    16810    sessions_user_id_idx    INDEX     J   CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);
 &   DROP INDEX auth.sessions_user_id_idx;
       auth            supabase_auth_admin    false    283            �           1259    16835    sso_domains_domain_idx    INDEX     \   CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));
 (   DROP INDEX auth.sso_domains_domain_idx;
       auth            supabase_auth_admin    false    288    288            �           1259    16834    sso_domains_sso_provider_id_idx    INDEX     `   CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);
 1   DROP INDEX auth.sso_domains_sso_provider_id_idx;
       auth            supabase_auth_admin    false    288            �           1259    16820    sso_providers_resource_id_idx    INDEX     j   CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));
 /   DROP INDEX auth.sso_providers_resource_id_idx;
       auth            supabase_auth_admin    false    287    287            �           1259    16979    unique_phone_factor_per_user    INDEX     c   CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);
 .   DROP INDEX auth.unique_phone_factor_per_user;
       auth            supabase_auth_admin    false    284    284            �           1259    16808    user_id_created_at_idx    INDEX     X   CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);
 (   DROP INDEX auth.user_id_created_at_idx;
       auth            supabase_auth_admin    false    283    283            Y           1259    16888    users_email_partial_key    INDEX     k   CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);
 )   DROP INDEX auth.users_email_partial_key;
       auth            supabase_auth_admin    false    270    270            4           0    0    INDEX users_email_partial_key    COMMENT     }   COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';
          auth          supabase_auth_admin    false    4441            Z           1259    16725    users_instance_id_email_idx    INDEX     h   CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));
 -   DROP INDEX auth.users_instance_id_email_idx;
       auth            supabase_auth_admin    false    270    270            [           1259    16499    users_instance_id_idx    INDEX     L   CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);
 '   DROP INDEX auth.users_instance_id_idx;
       auth            supabase_auth_admin    false    270            \           1259    16943    users_is_anonymous_idx    INDEX     N   CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);
 (   DROP INDEX auth.users_is_anonymous_idx;
       auth            supabase_auth_admin    false    270            �           1259    23254    activity_logs_enterprise_idx    INDEX     _   CREATE INDEX activity_logs_enterprise_idx ON public.activity_logs USING btree (enterprise_id);
 0   DROP INDEX public.activity_logs_enterprise_idx;
       public            postgres    false    389            �           1259    23256    activity_logs_target_idx    INDEX     d   CREATE INDEX activity_logs_target_idx ON public.activity_logs USING btree (target_type, target_id);
 ,   DROP INDEX public.activity_logs_target_idx;
       public            postgres    false    389    389            �           1259    23255    activity_logs_user_idx    INDEX     S   CREATE INDEX activity_logs_user_idx ON public.activity_logs USING btree (user_id);
 *   DROP INDEX public.activity_logs_user_idx;
       public            postgres    false    389            �           1259    19034    branches_code_idx    INDEX     F   CREATE INDEX branches_code_idx ON public.branches USING btree (code);
 %   DROP INDEX public.branches_code_idx;
       public            postgres    false    302            �           1259    19035    branches_name_idx    INDEX     F   CREATE INDEX branches_name_idx ON public.branches USING btree (name);
 %   DROP INDEX public.branches_name_idx;
       public            postgres    false    302            �           1259    19036    branches_user_id_idx    INDEX     L   CREATE INDEX branches_user_id_idx ON public.branches USING btree (user_id);
 (   DROP INDEX public.branches_user_id_idx;
       public            postgres    false    302            �           1259    19037    clients_email_idx    INDEX     F   CREATE INDEX clients_email_idx ON public.clients USING btree (email);
 %   DROP INDEX public.clients_email_idx;
       public            postgres    false    303            �           1259    19038    clients_name_idx    INDEX     D   CREATE INDEX clients_name_idx ON public.clients USING btree (name);
 $   DROP INDEX public.clients_name_idx;
       public            postgres    false    303            �           1259    19039    clients_user_id_idx    INDEX     J   CREATE INDEX clients_user_id_idx ON public.clients USING btree (user_id);
 '   DROP INDEX public.clients_user_id_idx;
       public            postgres    false    303            �           1259    19040    companies_email_idx    INDEX     J   CREATE INDEX companies_email_idx ON public.companies USING btree (email);
 '   DROP INDEX public.companies_email_idx;
       public            postgres    false    304            �           1259    29741    companies_is_active_idx    INDEX     O   CREATE INDEX companies_is_active_idx ON public.companies USING btree (status);
 +   DROP INDEX public.companies_is_active_idx;
       public            postgres    false    304            �           1259    19042    companies_name_idx    INDEX     H   CREATE INDEX companies_name_idx ON public.companies USING btree (name);
 &   DROP INDEX public.companies_name_idx;
       public            postgres    false    304            �           1259    19043    departments_name_idx    INDEX     L   CREATE INDEX departments_name_idx ON public.departments USING btree (name);
 (   DROP INDEX public.departments_name_idx;
       public            postgres    false    306            �           1259    19044    departments_user_id_idx    INDEX     R   CREATE INDEX departments_user_id_idx ON public.departments USING btree (user_id);
 +   DROP INDEX public.departments_user_id_idx;
       public            postgres    false    306            �           1259    19045    documents_entity_id_idx    INDEX     R   CREATE INDEX documents_entity_id_idx ON public.documents USING btree (entity_id);
 +   DROP INDEX public.documents_entity_id_idx;
       public            postgres    false    307            �           1259    19046    documents_entity_type_idx    INDEX     V   CREATE INDEX documents_entity_type_idx ON public.documents USING btree (entity_type);
 -   DROP INDEX public.documents_entity_type_idx;
       public            postgres    false    307            �           1259    19047    documents_user_id_idx    INDEX     N   CREATE INDEX documents_user_id_idx ON public.documents USING btree (user_id);
 )   DROP INDEX public.documents_user_id_idx;
       public            postgres    false    307            �           1259    25959    domains_domain_name_idx    INDEX     R   CREATE INDEX domains_domain_name_idx ON public.domains USING btree (domain_name);
 +   DROP INDEX public.domains_domain_name_idx;
       public            postgres    false    390            �           1259    25957    domains_enterprise_id_idx    INDEX     V   CREATE INDEX domains_enterprise_id_idx ON public.domains USING btree (enterprise_id);
 -   DROP INDEX public.domains_enterprise_id_idx;
       public            postgres    false    390            �           1259    25958    domains_user_id_idx    INDEX     J   CREATE INDEX domains_user_id_idx ON public.domains USING btree (user_id);
 '   DROP INDEX public.domains_user_id_idx;
       public            postgres    false    390            �           1259    19048     employee_requests_created_at_idx    INDEX     d   CREATE INDEX employee_requests_created_at_idx ON public.employee_requests USING btree (created_at);
 4   DROP INDEX public.employee_requests_created_at_idx;
       public            postgres    false    308            �           1259    19049 !   employee_requests_employee_id_idx    INDEX     f   CREATE INDEX employee_requests_employee_id_idx ON public.employee_requests USING btree (employee_id);
 5   DROP INDEX public.employee_requests_employee_id_idx;
       public            postgres    false    308            �           1259    19050    employee_requests_status_idx    INDEX     \   CREATE INDEX employee_requests_status_idx ON public.employee_requests USING btree (status);
 0   DROP INDEX public.employee_requests_status_idx;
       public            postgres    false    308            �           1259    19051    employee_requests_type_idx    INDEX     X   CREATE INDEX employee_requests_type_idx ON public.employee_requests USING btree (type);
 .   DROP INDEX public.employee_requests_type_idx;
       public            postgres    false    308            �           1259    19052    employee_requests_user_id_idx    INDEX     ^   CREATE INDEX employee_requests_user_id_idx ON public.employee_requests USING btree (user_id);
 1   DROP INDEX public.employee_requests_user_id_idx;
       public            postgres    false    308            �           1259    19053    employees_department_id_idx    INDEX     Z   CREATE INDEX employees_department_id_idx ON public.employees USING btree (department_id);
 /   DROP INDEX public.employees_department_id_idx;
       public            postgres    false    309            �           1259    19054    employees_email_idx    INDEX     J   CREATE INDEX employees_email_idx ON public.employees USING btree (email);
 '   DROP INDEX public.employees_email_idx;
       public            postgres    false    309            �           1259    19055    employees_user_id_idx    INDEX     N   CREATE INDEX employees_user_id_idx ON public.employees USING btree (user_id);
 )   DROP INDEX public.employees_user_id_idx;
       public            postgres    false    309            �           1259    19242    enterprises_email_idx    INDEX     N   CREATE INDEX enterprises_email_idx ON public.enterprises USING btree (email);
 )   DROP INDEX public.enterprises_email_idx;
       public            postgres    false    310            �           1259    19243    enterprises_name_idx    INDEX     L   CREATE INDEX enterprises_name_idx ON public.enterprises USING btree (name);
 (   DROP INDEX public.enterprises_name_idx;
       public            postgres    false    310            �           1259    24710    idx_branches_enterprise_id    INDEX     X   CREATE INDEX idx_branches_enterprise_id ON public.branches USING btree (enterprise_id);
 .   DROP INDEX public.idx_branches_enterprise_id;
       public            postgres    false    302            �           1259    27241    idx_branches_manager    INDEX     L   CREATE INDEX idx_branches_manager ON public.branches USING btree (manager);
 (   DROP INDEX public.idx_branches_manager;
       public            postgres    false    302            �           1259    24705    idx_clients_enterprise_id    INDEX     V   CREATE INDEX idx_clients_enterprise_id ON public.clients USING btree (enterprise_id);
 -   DROP INDEX public.idx_clients_enterprise_id;
       public            postgres    false    303            �           1259    24706    idx_companies_enterprise_id    INDEX     Z   CREATE INDEX idx_companies_enterprise_id ON public.companies USING btree (enterprise_id);
 /   DROP INDEX public.idx_companies_enterprise_id;
       public            postgres    false    304            �           1259    24703    idx_departments_enterprise_id    INDEX     ^   CREATE INDEX idx_departments_enterprise_id ON public.departments USING btree (enterprise_id);
 1   DROP INDEX public.idx_departments_enterprise_id;
       public            postgres    false    306            �           1259    24702    idx_employees_enterprise_id    INDEX     Z   CREATE INDEX idx_employees_enterprise_id ON public.employees USING btree (enterprise_id);
 /   DROP INDEX public.idx_employees_enterprise_id;
       public            postgres    false    309            �           1259    24700    idx_invoices_enterprise_id    INDEX     X   CREATE INDEX idx_invoices_enterprise_id ON public.invoices USING btree (enterprise_id);
 .   DROP INDEX public.idx_invoices_enterprise_id;
       public            postgres    false    313                       1259    24704    idx_jobs_enterprise_id    INDEX     P   CREATE INDEX idx_jobs_enterprise_id ON public.jobs USING btree (enterprise_id);
 *   DROP INDEX public.idx_jobs_enterprise_id;
       public            postgres    false    316                       1259    21200    idx_memberships_role_id    INDEX     R   CREATE INDEX idx_memberships_role_id ON public.memberships USING btree (role_id);
 +   DROP INDEX public.idx_memberships_role_id;
       public            postgres    false    317                       1259    24708    idx_offices_enterprise_id    INDEX     V   CREATE INDEX idx_offices_enterprise_id ON public.offices USING btree (enterprise_id);
 -   DROP INDEX public.idx_offices_enterprise_id;
       public            postgres    false    318                       1259    28451    idx_offices_manager    INDEX     J   CREATE INDEX idx_offices_manager ON public.offices USING btree (manager);
 '   DROP INDEX public.idx_offices_manager;
       public            postgres    false    318                       1259    24701    idx_products_enterprise_id    INDEX     X   CREATE INDEX idx_products_enterprise_id ON public.products USING btree (enterprise_id);
 .   DROP INDEX public.idx_products_enterprise_id;
       public            postgres    false    319            @           1259    24707    idx_vendors_enterprise_id    INDEX     V   CREATE INDEX idx_vendors_enterprise_id ON public.vendors USING btree (enterprise_id);
 -   DROP INDEX public.idx_vendors_enterprise_id;
       public            postgres    false    326            F           1259    24709    idx_warehouses_enterprise_id    INDEX     \   CREATE INDEX idx_warehouses_enterprise_id ON public.warehouses USING btree (enterprise_id);
 0   DROP INDEX public.idx_warehouses_enterprise_id;
       public            postgres    false    327            G           1259    28457    idx_warehouses_manager    INDEX     P   CREATE INDEX idx_warehouses_manager ON public.warehouses USING btree (manager);
 *   DROP INDEX public.idx_warehouses_manager;
       public            postgres    false    327            �           1259    19056    invoice_items_invoice_id_idx    INDEX     \   CREATE INDEX invoice_items_invoice_id_idx ON public.invoice_items USING btree (invoice_id);
 0   DROP INDEX public.invoice_items_invoice_id_idx;
       public            postgres    false    312            �           1259    19057    invoices_client_id_idx    INDEX     P   CREATE INDEX invoices_client_id_idx ON public.invoices USING btree (client_id);
 *   DROP INDEX public.invoices_client_id_idx;
       public            postgres    false    313            �           1259    19059    invoices_invoice_number_idx    INDEX     Z   CREATE INDEX invoices_invoice_number_idx ON public.invoices USING btree (invoice_number);
 /   DROP INDEX public.invoices_invoice_number_idx;
       public            postgres    false    313                        1259    19058    invoices_status_idx    INDEX     J   CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);
 '   DROP INDEX public.invoices_status_idx;
       public            postgres    false    313                       1259    19060    job_listing_jobs_job_id_idx    INDEX     Z   CREATE INDEX job_listing_jobs_job_id_idx ON public.job_listing_jobs USING btree (job_id);
 /   DROP INDEX public.job_listing_jobs_job_id_idx;
       public            postgres    false    314                       1259    19061 #   job_listing_jobs_job_listing_id_idx    INDEX     j   CREATE INDEX job_listing_jobs_job_listing_id_idx ON public.job_listing_jobs USING btree (job_listing_id);
 7   DROP INDEX public.job_listing_jobs_job_listing_id_idx;
       public            postgres    false    314                       1259    19062    job_listings_slug_idx    INDEX     N   CREATE INDEX job_listings_slug_idx ON public.job_listings USING btree (slug);
 )   DROP INDEX public.job_listings_slug_idx;
       public            postgres    false    315            
           1259    19063    job_listings_title_idx    INDEX     P   CREATE INDEX job_listings_title_idx ON public.job_listings USING btree (title);
 *   DROP INDEX public.job_listings_title_idx;
       public            postgres    false    315                       1259    19064    job_listings_user_id_idx    INDEX     T   CREATE INDEX job_listings_user_id_idx ON public.job_listings USING btree (user_id);
 ,   DROP INDEX public.job_listings_user_id_idx;
       public            postgres    false    315                       1259    19065    jobs_department_idx    INDEX     J   CREATE INDEX jobs_department_idx ON public.jobs USING btree (department);
 '   DROP INDEX public.jobs_department_idx;
       public            postgres    false    316                       1259    19066    jobs_title_idx    INDEX     @   CREATE INDEX jobs_title_idx ON public.jobs USING btree (title);
 "   DROP INDEX public.jobs_title_idx;
       public            postgres    false    316                       1259    19067    jobs_user_id_idx    INDEX     D   CREATE INDEX jobs_user_id_idx ON public.jobs USING btree (user_id);
 $   DROP INDEX public.jobs_user_id_idx;
       public            postgres    false    316                       1259    19068    offices_name_idx    INDEX     D   CREATE INDEX offices_name_idx ON public.offices USING btree (name);
 $   DROP INDEX public.offices_name_idx;
       public            postgres    false    318                       1259    19069    offices_user_id_idx    INDEX     J   CREATE INDEX offices_user_id_idx ON public.offices USING btree (user_id);
 '   DROP INDEX public.offices_user_id_idx;
       public            postgres    false    318                       1259    19071    products_name_idx    INDEX     F   CREATE INDEX products_name_idx ON public.products USING btree (name);
 %   DROP INDEX public.products_name_idx;
       public            postgres    false    319            !           1259    19072    products_sku_idx    INDEX     D   CREATE INDEX products_sku_idx ON public.products USING btree (sku);
 $   DROP INDEX public.products_sku_idx;
       public            postgres    false    319            "           1259    19073    products_user_id_idx    INDEX     L   CREATE INDEX products_user_id_idx ON public.products USING btree (user_id);
 (   DROP INDEX public.products_user_id_idx;
       public            postgres    false    319            #           1259    19465    profiles_email_idx    INDEX     H   CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);
 &   DROP INDEX public.profiles_email_idx;
       public            postgres    false    320            &           1259    19467    profiles_enterprise_id_idx    INDEX     X   CREATE INDEX profiles_enterprise_id_idx ON public.profiles USING btree (enterprise_id);
 .   DROP INDEX public.profiles_enterprise_id_idx;
       public            postgres    false    320            )           1259    19468    profiles_user_id_idx    INDEX     G   CREATE INDEX profiles_user_id_idx ON public.profiles USING btree (id);
 (   DROP INDEX public.profiles_user_id_idx;
       public            postgres    false    320            *           1259    19466    profiles_username_idx    INDEX     N   CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);
 )   DROP INDEX public.profiles_username_idx;
       public            postgres    false    320            -           1259    19074    quote_items_quote_id_idx    INDEX     T   CREATE INDEX quote_items_quote_id_idx ON public.quote_items USING btree (quote_id);
 ,   DROP INDEX public.quote_items_quote_id_idx;
       public            postgres    false    321            .           1259    19075    quotes_client_id_idx    INDEX     L   CREATE INDEX quotes_client_id_idx ON public.quotes USING btree (client_id);
 (   DROP INDEX public.quotes_client_id_idx;
       public            postgres    false    322            1           1259    19076    quotes_status_idx    INDEX     F   CREATE INDEX quotes_status_idx ON public.quotes USING btree (status);
 %   DROP INDEX public.quotes_status_idx;
       public            postgres    false    322            2           1259    19077    quotes_user_id_idx    INDEX     H   CREATE INDEX quotes_user_id_idx ON public.quotes USING btree (user_id);
 &   DROP INDEX public.quotes_user_id_idx;
       public            postgres    false    322            3           1259    19079    salaries_employee_id_idx    INDEX     T   CREATE INDEX salaries_employee_id_idx ON public.salaries USING btree (employee_id);
 ,   DROP INDEX public.salaries_employee_id_idx;
       public            postgres    false    323            6           1259    19080    salaries_user_id_idx    INDEX     L   CREATE INDEX salaries_user_id_idx ON public.salaries USING btree (user_id);
 (   DROP INDEX public.salaries_user_id_idx;
       public            postgres    false    323            �           1259    25991    servers_enterprise_id_idx    INDEX     V   CREATE INDEX servers_enterprise_id_idx ON public.servers USING btree (enterprise_id);
 -   DROP INDEX public.servers_enterprise_id_idx;
       public            postgres    false    391            �           1259    25994    servers_ip_address_idx    INDEX     P   CREATE INDEX servers_ip_address_idx ON public.servers USING btree (ip_address);
 *   DROP INDEX public.servers_ip_address_idx;
       public            postgres    false    391            �           1259    25993    servers_name_idx    INDEX     D   CREATE INDEX servers_name_idx ON public.servers USING btree (name);
 $   DROP INDEX public.servers_name_idx;
       public            postgres    false    391            �           1259    29846    servers_status_idx    INDEX     H   CREATE INDEX servers_status_idx ON public.servers USING btree (status);
 &   DROP INDEX public.servers_status_idx;
       public            postgres    false    391            �           1259    25992    servers_user_id_idx    INDEX     J   CREATE INDEX servers_user_id_idx ON public.servers USING btree (user_id);
 '   DROP INDEX public.servers_user_id_idx;
       public            postgres    false    391            7           1259    19081    templates_name_idx    INDEX     H   CREATE INDEX templates_name_idx ON public.templates USING btree (name);
 &   DROP INDEX public.templates_name_idx;
       public            postgres    false    324            :           1259    19082    templates_type_idx    INDEX     H   CREATE INDEX templates_type_idx ON public.templates USING btree (type);
 &   DROP INDEX public.templates_type_idx;
       public            postgres    false    324            ;           1259    19083    templates_user_id_idx    INDEX     N   CREATE INDEX templates_user_id_idx ON public.templates USING btree (user_id);
 )   DROP INDEX public.templates_user_id_idx;
       public            postgres    false    324            U           1259    20446    user_roles_enterprise_id_idx    INDEX     \   CREATE INDEX user_roles_enterprise_id_idx ON public.user_roles USING btree (enterprise_id);
 0   DROP INDEX public.user_roles_enterprise_id_idx;
       public            postgres    false    330            X           1259    20445    user_roles_role_id_idx    INDEX     P   CREATE INDEX user_roles_role_id_idx ON public.user_roles USING btree (role_id);
 *   DROP INDEX public.user_roles_role_id_idx;
       public            postgres    false    330            Y           1259    20444    user_roles_user_id_idx    INDEX     P   CREATE INDEX user_roles_user_id_idx ON public.user_roles USING btree (user_id);
 *   DROP INDEX public.user_roles_user_id_idx;
       public            postgres    false    330            A           1259    19087    vendors_email_idx    INDEX     F   CREATE INDEX vendors_email_idx ON public.vendors USING btree (email);
 %   DROP INDEX public.vendors_email_idx;
       public            postgres    false    326            B           1259    19088    vendors_name_idx    INDEX     D   CREATE INDEX vendors_name_idx ON public.vendors USING btree (name);
 $   DROP INDEX public.vendors_name_idx;
       public            postgres    false    326            E           1259    19089    vendors_user_id_idx    INDEX     J   CREATE INDEX vendors_user_id_idx ON public.vendors USING btree (user_id);
 '   DROP INDEX public.vendors_user_id_idx;
       public            postgres    false    326            H           1259    19090    warehouses_code_idx    INDEX     J   CREATE INDEX warehouses_code_idx ON public.warehouses USING btree (code);
 '   DROP INDEX public.warehouses_code_idx;
       public            postgres    false    327            K           1259    19091    warehouses_name_idx    INDEX     J   CREATE INDEX warehouses_name_idx ON public.warehouses USING btree (name);
 '   DROP INDEX public.warehouses_name_idx;
       public            postgres    false    327            N           1259    19094    warehouses_user_id_idx    INDEX     P   CREATE INDEX warehouses_user_id_idx ON public.warehouses USING btree (user_id);
 *   DROP INDEX public.warehouses_user_id_idx;
       public            postgres    false    327            �           1259    17243    ix_realtime_subscription_entity    INDEX     \   CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);
 5   DROP INDEX realtime.ix_realtime_subscription_entity;
       realtime            supabase_admin    false    298            �           1259    17146 /   subscription_subscription_id_entity_filters_key    INDEX     �   CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);
 E   DROP INDEX realtime.subscription_subscription_id_entity_filters_key;
       realtime            supabase_admin    false    298    298    298            q           1259    16554    bname    INDEX     A   CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);
    DROP INDEX storage.bname;
       storage            supabase_storage_admin    false    276            t           1259    16576    bucketid_objname    INDEX     W   CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);
 %   DROP INDEX storage.bucketid_objname;
       storage            supabase_storage_admin    false    277    277            �           1259    17048    idx_multipart_uploads_list    INDEX     r   CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);
 /   DROP INDEX storage.idx_multipart_uploads_list;
       storage            supabase_storage_admin    false    293    293    293            u           1259    17013    idx_objects_bucket_id_name    INDEX     f   CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");
 /   DROP INDEX storage.idx_objects_bucket_id_name;
       storage            supabase_storage_admin    false    277    277            v           1259    16577    name_prefix_search    INDEX     X   CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);
 '   DROP INDEX storage.name_prefix_search;
       storage            supabase_storage_admin    false    277            �           2620    20483    users on_auth_user_created    TRIGGER     |   CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
 1   DROP TRIGGER on_auth_user_created ON auth.users;
       auth          supabase_auth_admin    false    270    579            �           2620    24697    branches log_branch_changes    TRIGGER     �   CREATE TRIGGER log_branch_changes AFTER INSERT OR DELETE OR UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.module_log_branch();
 4   DROP TRIGGER log_branch_changes ON public.branches;
       public          postgres    false    794    302            �           2620    24689    clients log_client_changes    TRIGGER     �   CREATE TRIGGER log_client_changes AFTER INSERT OR DELETE OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.module_log_client();
 3   DROP TRIGGER log_client_changes ON public.clients;
       public          postgres    false    800    303            �           2620    24447    companies log_company_changes    TRIGGER     �   CREATE TRIGGER log_company_changes AFTER INSERT OR DELETE OR UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.module_log_company();
 6   DROP TRIGGER log_company_changes ON public.companies;
       public          postgres    false    304    796            �           2620    23308 %   employees log_employee_delete_trigger    TRIGGER     �   CREATE TRIGGER log_employee_delete_trigger AFTER DELETE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.module_log_employee();
 >   DROP TRIGGER log_employee_delete_trigger ON public.employees;
       public          postgres    false    797    309            �           2620    23306 %   employees log_employee_insert_trigger    TRIGGER     �   CREATE TRIGGER log_employee_insert_trigger AFTER INSERT ON public.employees FOR EACH ROW EXECUTE FUNCTION public.module_log_employee();
 >   DROP TRIGGER log_employee_insert_trigger ON public.employees;
       public          postgres    false    797    309            �           2620    24668 .   employee_requests log_employee_request_changes    TRIGGER     �   CREATE TRIGGER log_employee_request_changes AFTER INSERT OR DELETE OR UPDATE ON public.employee_requests FOR EACH ROW EXECUTE FUNCTION public.module_log_employee_request();
 G   DROP TRIGGER log_employee_request_changes ON public.employee_requests;
       public          postgres    false    308    799            �           2620    23307 %   employees log_employee_update_trigger    TRIGGER     �   CREATE TRIGGER log_employee_update_trigger AFTER UPDATE ON public.employees FOR EACH ROW WHEN ((old.* IS DISTINCT FROM new.*)) EXECUTE FUNCTION public.module_log_employee();
 >   DROP TRIGGER log_employee_update_trigger ON public.employees;
       public          postgres    false    309    797            �           2620    24699    expenses log_expense_changes    TRIGGER     �   CREATE TRIGGER log_expense_changes AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.module_log_expense();
 5   DROP TRIGGER log_expense_changes ON public.expenses;
       public          postgres    false    311    804            �           2620    24693    offices log_office_changes    TRIGGER     �   CREATE TRIGGER log_office_changes AFTER INSERT OR DELETE OR UPDATE ON public.offices FOR EACH ROW EXECUTE FUNCTION public.module_log_office();
 3   DROP TRIGGER log_office_changes ON public.offices;
       public          postgres    false    318    802            �           2620    24691    vendors log_vendor_changes    TRIGGER     �   CREATE TRIGGER log_vendor_changes AFTER INSERT OR DELETE OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.module_log_vendor();
 3   DROP TRIGGER log_vendor_changes ON public.vendors;
       public          postgres    false    326    801            �           2620    24695     warehouses log_warehouse_changes    TRIGGER     �   CREATE TRIGGER log_warehouse_changes AFTER INSERT OR DELETE OR UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.module_log_warehouse();
 9   DROP TRIGGER log_warehouse_changes ON public.warehouses;
       public          postgres    false    327    803            �           2620    19472    departments set_updated_at    TRIGGER     y   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
 3   DROP TRIGGER set_updated_at ON public.departments;
       public          postgres    false    306    393            �           2620    19473    employees set_updated_at    TRIGGER     w   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
 1   DROP TRIGGER set_updated_at ON public.employees;
       public          postgres    false    309    393            �           2620    19470    profiles set_updated_at    TRIGGER     v   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
 0   DROP TRIGGER set_updated_at ON public.profiles;
       public          postgres    false    393    320            �           2620    20512 $   user_enterprise_roles set_updated_at    TRIGGER     �   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_enterprise_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 =   DROP TRIGGER set_updated_at ON public.user_enterprise_roles;
       public          postgres    false    325    593            �           2620    20479 %   user_roles validate_user_role_trigger    TRIGGER     �   CREATE TRIGGER validate_user_role_trigger BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.validate_user_role();
 >   DROP TRIGGER validate_user_role_trigger ON public.user_roles;
       public          postgres    false    558    330            �           2620    17102    subscription tr_check_filters    TRIGGER     �   CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();
 8   DROP TRIGGER tr_check_filters ON realtime.subscription;
       realtime          supabase_admin    false    298    676            �           2620    17001 !   objects update_objects_updated_at    TRIGGER     �   CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();
 ;   DROP TRIGGER update_objects_updated_at ON storage.objects;
       storage          supabase_storage_admin    false    277    635            �           2606    16711 "   identities identities_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_user_id_fkey;
       auth          supabase_auth_admin    false    282    270    4448            �           2606    16801 -   mfa_amr_claims mfa_amr_claims_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_fkey;
       auth          supabase_auth_admin    false    283    4488    286            �           2606    16789 1   mfa_challenges mfa_challenges_auth_factor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_auth_factor_id_fkey;
       auth          supabase_auth_admin    false    285    4495    284            �           2606    16776 $   mfa_factors mfa_factors_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_user_id_fkey;
       auth          supabase_auth_admin    false    270    284    4448            �           2606    16967 ,   one_time_tokens one_time_tokens_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_user_id_fkey;
       auth          supabase_auth_admin    false    4448    270    292            �           2606    16744 -   refresh_tokens refresh_tokens_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_session_id_fkey;
       auth          supabase_auth_admin    false    272    4488    283            �           2606    16848 2   saml_providers saml_providers_sso_provider_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
 Z   ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_sso_provider_id_fkey;
       auth          supabase_auth_admin    false    4507    289    287            �           2606    16921 6   saml_relay_states saml_relay_states_flow_state_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_flow_state_id_fkey;
       auth          supabase_auth_admin    false    4525    291    290            �           2606    16862 8   saml_relay_states saml_relay_states_sso_provider_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_sso_provider_id_fkey;
       auth          supabase_auth_admin    false    287    4507    290            �           2606    16739    sessions sessions_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_user_id_fkey;
       auth          supabase_auth_admin    false    270    4448    283            �           2606    16829 ,   sso_domains sso_domains_sso_provider_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_sso_provider_id_fkey;
       auth          supabase_auth_admin    false    288    287    4507            �           2606    23244 ;   activity_logs activity_logs_enterprise_id_enterprises_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_enterprise_id_enterprises_id_fk FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_enterprise_id_enterprises_id_fk;
       public          postgres    false    4597    389    310            �           2606    23249 /   activity_logs activity_logs_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
 Y   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_user_id_users_id_fk;
       public          postgres    false    389    270    4448            �           2606    18914    clients clients_company_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_fkey FOREIGN KEY (company) REFERENCES public.companies(id);
 F   ALTER TABLE ONLY public.clients DROP CONSTRAINT clients_company_fkey;
       public          postgres    false    304    4565    303            �           2606    18919 I   department_locations department_locations_department_id_departments_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.department_locations
    ADD CONSTRAINT department_locations_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;
 s   ALTER TABLE ONLY public.department_locations DROP CONSTRAINT department_locations_department_id_departments_id_fk;
       public          postgres    false    4573    305    306            �           2606    25952 /   domains domains_enterprise_id_enterprises_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_enterprise_id_enterprises_id_fk FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.domains DROP CONSTRAINT domains_enterprise_id_enterprises_id_fk;
       public          postgres    false    390    310    4597            �           2606    25947 #   domains domains_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);
 M   ALTER TABLE ONLY public.domains DROP CONSTRAINT domains_user_id_users_id_fk;
       public          postgres    false    270    4448    390            �           2606    18924 ?   employee_requests employee_requests_employee_id_employees_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);
 i   ALTER TABLE ONLY public.employee_requests DROP CONSTRAINT employee_requests_employee_id_employees_id_fk;
       public          postgres    false    4591    308    309            �           2606    18929 3   employees employees_department_id_departments_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
 ]   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_department_id_departments_id_fk;
       public          postgres    false    309    4573    306            �           2606    18934 !   expenses expenses_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
 K   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_created_by_fkey;
       public          postgres    false    320    4648    311            �           2606    18939 $   expenses expenses_enterprise_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_enterprise_id_fkey FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.expenses DROP CONSTRAINT expenses_enterprise_id_fkey;
       public          postgres    false    4597    310    311            �           2606    27236    branches fk_branch_manager    FK CONSTRAINT     �   ALTER TABLE ONLY public.branches
    ADD CONSTRAINT fk_branch_manager FOREIGN KEY (manager) REFERENCES public.employees(id) ON DELETE SET NULL;
 D   ALTER TABLE ONLY public.branches DROP CONSTRAINT fk_branch_manager;
       public          postgres    false    309    302    4591            �           2606    28446    offices fk_office_manager    FK CONSTRAINT     �   ALTER TABLE ONLY public.offices
    ADD CONSTRAINT fk_office_manager FOREIGN KEY (manager) REFERENCES public.employees(id) ON DELETE SET NULL;
 C   ALTER TABLE ONLY public.offices DROP CONSTRAINT fk_office_manager;
       public          postgres    false    4591    318    309            �           2606    28452    warehouses fk_warehouse_manager    FK CONSTRAINT     �   ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT fk_warehouse_manager FOREIGN KEY (manager) REFERENCES public.employees(id) ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.warehouses DROP CONSTRAINT fk_warehouse_manager;
       public          postgres    false    4591    309    327            �           2606    18944 +   invoice_items invoice_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 U   ALTER TABLE ONLY public.invoice_items DROP CONSTRAINT invoice_items_product_id_fkey;
       public          postgres    false    319    312    4640            �           2606    18949     invoices invoices_client_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_client_id_fkey;
       public          postgres    false    303    4558    313            �           2606    18954 !   invoices invoices_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
 K   ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_created_by_fkey;
       public          postgres    false    320    4648    313            �           2606    18959 $   invoices invoices_enterprise_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_enterprise_id_fkey FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_enterprise_id_fkey;
       public          postgres    false    313    310    4597            �           2606    18964 3   job_listing_jobs job_listing_jobs_job_id_jobs_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.job_listing_jobs
    ADD CONSTRAINT job_listing_jobs_job_id_jobs_id_fk FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.job_listing_jobs DROP CONSTRAINT job_listing_jobs_job_id_jobs_id_fk;
       public          postgres    false    4623    316    314            �           2606    18969 C   job_listing_jobs job_listing_jobs_job_listing_id_job_listings_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.job_listing_jobs
    ADD CONSTRAINT job_listing_jobs_job_listing_id_job_listings_id_fk FOREIGN KEY (job_listing_id) REFERENCES public.job_listings(id) ON DELETE CASCADE;
 m   ALTER TABLE ONLY public.job_listing_jobs DROP CONSTRAINT job_listing_jobs_job_listing_id_job_listings_id_fk;
       public          postgres    false    315    314    4614            �           2606    18974 *   memberships memberships_enterprise_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_enterprise_id_fkey FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_enterprise_id_fkey;
       public          postgres    false    317    4597    310            �           2606    18979 '   memberships memberships_profile_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_profile_id_fkey;
       public          postgres    false    317    4648    320            �           2606    21195 $   memberships memberships_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_role_id_fkey;
       public          postgres    false    4703    317    334            �           2606    21164 $   permissions permissions_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_role_id_fkey;
       public          postgres    false    4703    335    334            �           2606    18994    profiles profiles_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_id_fkey;
       public          postgres    false    320    270    4448            �           2606    18999 '   quote_items quote_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 Q   ALTER TABLE ONLY public.quote_items DROP CONSTRAINT quote_items_product_id_fkey;
       public          postgres    false    321    319    4640            �           2606    19004 %   quote_items quote_items_quote_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.quote_items DROP CONSTRAINT quote_items_quote_id_fkey;
       public          postgres    false    322    4656    321            �           2606    19009    quotes quotes_client_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.quotes DROP CONSTRAINT quotes_client_id_fkey;
       public          postgres    false    303    322    4558            �           2606    21144    roles roles_enterprise_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_enterprise_id_fkey FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_enterprise_id_fkey;
       public          postgres    false    310    4597    334            �           2606    19019 "   salaries salaries_employee_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.salaries DROP CONSTRAINT salaries_employee_id_fkey;
       public          postgres    false    4591    309    323            �           2606    25986 /   servers servers_enterprise_id_enterprises_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_enterprise_id_enterprises_id_fk FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.servers DROP CONSTRAINT servers_enterprise_id_enterprises_id_fk;
       public          postgres    false    4597    310    391            �           2606    25981 #   servers servers_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);
 M   ALTER TABLE ONLY public.servers DROP CONSTRAINT servers_user_id_users_id_fk;
       public          postgres    false    391    270    4448            �           2606    19024 8   user_enterprise_roles user_enterprise_roles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_enterprise_roles
    ADD CONSTRAINT user_enterprise_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
 b   ALTER TABLE ONLY public.user_enterprise_roles DROP CONSTRAINT user_enterprise_roles_user_id_fkey;
       public          postgres    false    4448    325    270            �           2606    20447 "   user_roles user_roles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
       public          postgres    false    330    270    4448            �           2606    16566    objects objects_bucketId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
 J   ALTER TABLE ONLY storage.objects DROP CONSTRAINT "objects_bucketId_fkey";
       storage          supabase_storage_admin    false    4467    276    277            �           2606    17023 8   s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
 c   ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_bucket_id_fkey;
       storage          supabase_storage_admin    false    293    4467    276            �           2606    17043 D   s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
 o   ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey;
       storage          supabase_storage_admin    false    4467    294    276            �           2606    17038 D   s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;
 o   ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey;
       storage          supabase_storage_admin    false    293    294    4535            �           3256    20525 (   users Users can view their own user data    POLICY     x   CREATE POLICY "Users can view their own user data" ON auth.users FOR SELECT TO authenticated USING ((auth.uid() = id));
 @   DROP POLICY "Users can view their own user data" ON auth.users;
       auth          supabase_auth_admin    false    270    270    457            �           3256    20530    enterprises Access if member    POLICY     �   CREATE POLICY "Access if member" ON public.enterprises FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.memberships
  WHERE ((memberships.enterprise_id = enterprises.id) AND (memberships.profile_id = auth.uid())))));
 6   DROP POLICY "Access if member" ON public.enterprises;
       public          postgres    false    310    457    317    310    317            �           3256    20531    memberships Access if same user    POLICY     h   CREATE POLICY "Access if same user" ON public.memberships FOR SELECT USING ((profile_id = auth.uid()));
 9   DROP POLICY "Access if same user" ON public.memberships;
       public          postgres    false    317    457    317            �           3256    24686 6   employee_requests Allow creator to delete own requests    POLICY     �   CREATE POLICY "Allow creator to delete own requests" ON public.employee_requests FOR DELETE USING (((user_id = auth.uid()) AND public.is_member_of_enterprise(enterprise_id)));
 P   DROP POLICY "Allow creator to delete own requests" ON public.employee_requests;
       public          postgres    false    308    308    426    308    457            �           3256    24687 =   employee_requests Allow enterprise members to update requests    POLICY     �   CREATE POLICY "Allow enterprise members to update requests" ON public.employee_requests FOR UPDATE USING (public.is_member_of_enterprise(enterprise_id)) WITH CHECK (public.is_member_of_enterprise(enterprise_id));
 W   DROP POLICY "Allow enterprise members to update requests" ON public.employee_requests;
       public          postgres    false    308    308    426    308    426            �           3256    24684 <   employee_requests Allow members to insert for own enterprise    POLICY       CREATE POLICY "Allow members to insert for own enterprise" ON public.employee_requests FOR INSERT WITH CHECK (((enterprise_id = ( SELECT memberships.enterprise_id
   FROM public.memberships
  WHERE (memberships.profile_id = auth.uid())
 LIMIT 1)) AND (user_id = auth.uid())));
 V   DROP POLICY "Allow members to insert for own enterprise" ON public.employee_requests;
       public          postgres    false    308    308    317    317    457    308            �           3256    24683 ?   employee_requests Allow members to view own enterprise requests    POLICY     �   CREATE POLICY "Allow members to view own enterprise requests" ON public.employee_requests FOR SELECT USING (public.is_member_of_enterprise(enterprise_id));
 Y   DROP POLICY "Allow members to view own enterprise requests" ON public.employee_requests;
       public          postgres    false    308    308    426            �           3256    20529 -   user_enterprise_roles Enable delete for users    POLICY     �   CREATE POLICY "Enable delete for users" ON public.user_enterprise_roles FOR DELETE TO authenticated USING ((auth.uid() = user_id));
 G   DROP POLICY "Enable delete for users" ON public.user_enterprise_roles;
       public          postgres    false    457    325    325            �           3256    20527 ;   user_enterprise_roles Enable insert for authenticated users    POLICY     �   CREATE POLICY "Enable insert for authenticated users" ON public.user_enterprise_roles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
 U   DROP POLICY "Enable insert for authenticated users" ON public.user_enterprise_roles;
       public          postgres    false    457    325    325            �           3256    20526 2   user_enterprise_roles Enable read access for users    POLICY     �   CREATE POLICY "Enable read access for users" ON public.user_enterprise_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));
 L   DROP POLICY "Enable read access for users" ON public.user_enterprise_roles;
       public          postgres    false    325    325    457            �           3256    20528 -   user_enterprise_roles Enable update for users    POLICY     �   CREATE POLICY "Enable update for users" ON public.user_enterprise_roles FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
 G   DROP POLICY "Enable update for users" ON public.user_enterprise_roles;
       public          postgres    false    457    325    457    325    325            �           3256    21150 0   roles Users can create roles in their enterprise    POLICY     �   CREATE POLICY "Users can create roles in their enterprise" ON public.roles FOR INSERT WITH CHECK ((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM public.user_enterprises
  WHERE (user_enterprises.user_id = auth.uid()))));
 J   DROP POLICY "Users can create roles in their enterprise" ON public.roles;
       public          postgres    false    333    334    334    333    457            �           3256    21153 0   roles Users can delete roles in their enterprise    POLICY     �   CREATE POLICY "Users can delete roles in their enterprise" ON public.roles FOR DELETE USING ((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM public.user_enterprises
  WHERE (user_enterprises.user_id = auth.uid()))));
 J   DROP POLICY "Users can delete roles in their enterprise" ON public.roles;
       public          postgres    false    457    333    334    333    334            �           3256    20533 %   profiles Users can insert own profile    POLICY     k   CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
 ?   DROP POLICY "Users can insert own profile" ON public.profiles;
       public          postgres    false    457    320    320            �           3256    21170 <   permissions Users can manage permissions in their enterprise    POLICY     +  CREATE POLICY "Users can manage permissions in their enterprise" ON public.permissions USING ((role_id IN ( SELECT roles.id
   FROM public.roles
  WHERE (roles.enterprise_id IN ( SELECT user_enterprises.enterprise_id
           FROM public.user_enterprises
          WHERE (user_enterprises.user_id = auth.uid())))))) WITH CHECK ((role_id IN ( SELECT roles.id
   FROM public.roles
  WHERE (roles.enterprise_id IN ( SELECT user_enterprises.enterprise_id
           FROM public.user_enterprises
          WHERE (user_enterprises.user_id = auth.uid()))))));
 V   DROP POLICY "Users can manage permissions in their enterprise" ON public.permissions;
       public          postgres    false    334    334    335    457    333    333    334    334    335    335    333    333    457            �           3256    20534 %   profiles Users can update own profile    POLICY     �   CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
 ?   DROP POLICY "Users can update own profile" ON public.profiles;
       public          postgres    false    457    320    320    320    457            �           3256    21151 0   roles Users can update roles in their enterprise    POLICY     �  CREATE POLICY "Users can update roles in their enterprise" ON public.roles FOR UPDATE USING ((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM public.user_enterprises
  WHERE (user_enterprises.user_id = auth.uid())))) WITH CHECK ((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM public.user_enterprises
  WHERE (user_enterprises.user_id = auth.uid()))));
 J   DROP POLICY "Users can update roles in their enterprise" ON public.roles;
       public          postgres    false    457    333    334    334    333    333    333    457    334            �           3256    20532 #   profiles Users can view own profile    POLICY     d   CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));
 =   DROP POLICY "Users can view own profile" ON public.profiles;
       public          postgres    false    320    320    457            �           3256    21169 :   permissions Users can view permissions in their enterprise    POLICY     f  CREATE POLICY "Users can view permissions in their enterprise" ON public.permissions FOR SELECT USING ((role_id IN ( SELECT roles.id
   FROM public.roles
  WHERE ((roles.enterprise_id IN ( SELECT user_enterprises.enterprise_id
           FROM public.user_enterprises
          WHERE (user_enterprises.user_id = auth.uid()))) OR (roles.is_system = true)))));
 T   DROP POLICY "Users can view permissions in their enterprise" ON public.permissions;
       public          postgres    false    334    333    457    334    333    335    335    334            �           3256    21149 .   roles Users can view roles in their enterprise    POLICY       CREATE POLICY "Users can view roles in their enterprise" ON public.roles FOR SELECT USING (((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM public.user_enterprises
  WHERE (user_enterprises.user_id = auth.uid()))) OR (is_system = true)));
 H   DROP POLICY "Users can view roles in their enterprise" ON public.roles;
       public          postgres    false    333    457    334    334    334    333            �           0    18664    employee_requests    ROW SECURITY     ?   ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;          public          postgres    false    308            �           0    21154    permissions    ROW SECURITY     9   ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;          public          postgres    false    335            �           0    21131    roles    ROW SECURITY     3   ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;          public          postgres    false    334            �           0    17228    messages    ROW SECURITY     8   ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;          realtime          supabase_realtime_admin    false    301            �           0    16540    buckets    ROW SECURITY     6   ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    276            �           0    16582 
   migrations    ROW SECURITY     9   ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    278            �           0    16555    objects    ROW SECURITY     6   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    277            �           0    17014    s3_multipart_uploads    ROW SECURITY     C   ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    293            �           0    17028    s3_multipart_uploads_parts    ROW SECURITY     I   ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    294            �           6104    16420    supabase_realtime    PUBLICATION     Z   CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');
 $   DROP PUBLICATION supabase_realtime;
                postgres    false            [           3466    16615    issue_graphql_placeholder    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();
 .   DROP EVENT TRIGGER issue_graphql_placeholder;
                supabase_admin    false    609            `           3466    16684    issue_pg_cron_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();
 )   DROP EVENT TRIGGER issue_pg_cron_access;
                supabase_admin    false    625            Z           3466    16613    issue_pg_graphql_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();
 ,   DROP EVENT TRIGGER issue_pg_graphql_access;
                supabase_admin    false    551            Y           3466    16594    issue_pg_net_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();
 (   DROP EVENT TRIGGER issue_pg_net_access;
                postgres    false    615            \           3466    16616    pgrst_ddl_watch    EVENT TRIGGER     j   CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();
 $   DROP EVENT TRIGGER pgrst_ddl_watch;
                supabase_admin    false    557            ]           3466    16617    pgrst_drop_watch    EVENT TRIGGER     e   CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();
 %   DROP EVENT TRIGGER pgrst_drop_watch;
                supabase_admin    false    548            d      x������ � �      j      x������ � �      o      x������ � �      f      x������ � �      h      x������ � �      l      x������ � �      n      x������ � �      {      x������ � �      z      x������ � �      t      x������ � �      |      x������ � �      }      x������ � �      u      x������ � �      x      x������ � �      v      x������ � �      y      x������ � �      w      x������ � �      s   T   x���+.I�ɉ/��M�r8��Lu��X�������,�L̴8K��*�sRS���R��3��8����9Ӹb���� 2��      e      x������ � �      r      x������ � �      �      x��뒜��%���)��wap�;��_� k&õU��JR�zl46�ǃd�Rh�̈�T�EY��N���/1��
������Z]��V-NA��PS�0J��$M��o��wm���������������������������~���oe]�i�`y� -���f�U�.��L����_���O��?ڏX��_~���v��������~��/?��i��~Y��w?��_�������_W��ܯk?����������������[j?������-Ť!�;�G�ObOB��L����-�Ȩ�R��c�J5�R�z�	�������f��1~����6d��j�#�k���!�U�
6'����(c�]�@������<��/�0����mn�32������´4u+ն�^c�j$�x�jA0�h��,��:�9黻M}�v�3�r`s�Mm�X��P��`x�PK�ӌq���5q�F�y�D�ē��J��r��E�6R�#�%|��챀î��:�Ц`ۢ�!$�k�!���COQ�H/D�ܸ���B��aOx��)le��u��/X�k��-��4���ۡѝ�"��tZu�)DJ-o#�nMի�$��
`��P�����}tz���O�V��6�u�?�ֲ��O�R3�Vz�ki���Ť� }�1�Ǩ�t��h���
1Od0p�`щM��DҊU_L�o	җ0��"�X�',&��˨
R:L�#o��B�m�&r�>�'�J�+t�9�6��A��g���/ӿ[��R��D�S�nǩ�(w
�7�E7�ƀ-�6ʊ9��\�-��6�� �;�Hbl�'H�x�2g�LP��l�)1�Mi��Դ�]'��;�Jt����1�=����o��-(�')8�z ��;dSX��Ӹ���Fv/�c6�V��|��|@Ɣ��Ҵ̂�����ɲ �1b�%
ۭ�0�A�&��/��*A���T���<�}w����邈Z� <��5�&e��=a4 ?�j���<^��ɷ�T��������~;��k�RG�� ܷ���+
\1��A'��LcGc�I�>�w�� �>q�Xˉ�,)�Ɗeݳ9���{�5W���ʋ��U�Fky�PNᅧ͜�(f #��!��*�T�F��h.�o�⥸×�F�KGX4z�j��s�|w�)�tQb���](�xL�b�3���D�W)�ʚ����"�f.@�U�K�Ҵ.� \> ��^F�It�Jc�W���y_6T=�S�H��ys~�����X8�Q2Jc/18R!0A��6;��-[�#��`^�o4����R�ew�	I4���
����@�&]%ӭ�����u�;�&B^BS�hrTH��,����\�I�R
i<8�bic��x4JiY�-(�4��:<�%��:�|���E��a�ܣ4���ҫ ^
lf����i��o4ȉ�ӊA#��$e�oHve򪖟�����Kz���E2�ˆ�0����� �&7�I)"Hm�^⺯ɷ�GT�Nd#�Ğ�!�v�3&�M�6��)VM��_�S�2,_>8�'���zv��7YZY��)����&�cn7z��ѶA6��30��x����c�����@�{�
�Q�0��e�<��f��"H[G�)�U(����+�ʷy�\4�\�C/%0|cĐK�	���kK$5��-��W�.O�\�E0���T�˾���a�#P ߔ�ӆι��aMD�-H�~(�BO3��:O���?���wwyb�h�b'��!)ȄHG,1��5��@���u�ka����|ER���, �@������K�"�%oym\�z��$��i�q�4�԰7<����kh=g�\s�r������
������A��J����g����������?��_~�����7�)�E ��(���	�V��6��=����Rw�/��7��]�BY�Xʶ�RnH�������9��f��#Yz�
�!��$OT/�y�$�4�xNq��;�I�!����I�Z;��5��������!���8��/[���o�{�`�F��$��^ժaus�&l#k�i����_��x-L��o>�R�aO�|"W�9��MO��b!��i/��k��Փ���2���Q�i�*�B�B�:_�#��yZ=e���ad`�� ? ��WB���iZ���ǟ��������� y/V��_�Pe�@�=�� �t���K)�a�F�y��֓k��Xï+1Toˉ[��5�+V� ����X�R�����!�(*�7.?{n4��y��Y�x��ɹ"� ր�ᥬ�i��h}6ݶ����}���`���{T��:�hA��H{��|�KeJ�\L/��*��3��zRޔv^3�J�QY���Y��eѰ2_L3���3�.�)�q�lO����ۦa�XC*�����K���m�.j���0�LuW0mM;"�Wi#�����;����	{�����1J�H���S�F���U���	��7�(�S��]�Iͩ4��a�X��c[4��U�*i�/#�=E}�x��'s����dIғ�
F0
�Hԇ��um�"�SC��/���s�Z�v��[-fI�3��r�Ͽ���[���3��f�6�0��'�L3/�88�и/@0j	�{
B+��!����� �o��>���;cm�z�xv�~]��p��(�Jb��t)�G)ct-�P�t/ËNK(�K�~��&�����/q�����|>�6t�aZǊ�Ϻ�Z@v&�R4��X�'���y���&��$Ύ�?�	| Np�*ɫ 'ޫ�+�$�V��,����@q�z���@؊�,� �{�+�X���ɤ�B��z� �F��B��eq���Z�R@���f�+���{�ɓad��<���1��,�L�4��L�I�Q�>�G��b�R:˧ِ6@��G��S�;��$r�'�'糱E*[�6��l��5E7�\x����Z�83�*XМ�}`�K��ש�X�=ˇ��(�D��x2b�R*������X ���MCc��>�@��|�S���@mxO��Zw�l�$�s���������M>�<I�l��'=J�7\��B����`��s�4"�ڞ�H�X��A!rr�R�������r�땊�0�扰����W�Ho�&�
����U9���q��<(�ń���r��u�H�����.�հ��x��Bӈ���b��L�<Ư�_��������/�L9���q��#]A79{�)X�N���ڴ^�o8s�+� �vH).&A��FѤ"�-cBl�!�#��k�@�����t��K�s�e�ezI���!��l���R� Ft�䜧6
M(֚*����ls��u=ȑKbP��\�@SO��:��%J��o�!�S�1�U�wg�P�N���%Dv��p����~��55��b�!|����q�������ʌ0@��2l����K�BTY[��> ������M-Ci�ed�"a Z�8�?�CH-����ȅ�Ɠ[|0�M)�h������1��ɔǘ�>�&p������<x�N(��Q���< wh�� �F/<�1���vP�>L	�r"��-�2�*�� �|2 ��U�����F���������Ql��\Y����ѫte#6j>�l�z
�k�@�ǈȵ�ʖr�\[X�[x�ϾI	�düx��(|ફ�]2�"�h�X �r��a�Y��VPB�VZ�p�� �N�p!���ի����]�+P�����c�n��� ?������~�i���_�)\��;����çh^�]�nj�NH�b^�4	j�7d�k7K��?��~���]�Ip�o�ʗK��Oj�Go�������rg�X��b2"�(|�+���i������e��ttJ�)] p�,o�K��%D�Zwo��[[��f����� JQ�r� "^E�{�fu��"�I��Z�L�'3�Y�8l��J)��$�n�Jw0���?�������������س��b�4�SI ��Eu�(��/��B)1��T���RH�`��*�j�j����A    �:O�z)��ɽ��V��֖��9^�(_'jr�}��=���� ��N��ϳ��]���P��S2SI������F��p�?�?�������&{�~<A[Co�r�A�2��mŋ�KB�?8�Qe���쒐����E��&�/k�i,�`4_4���!-�8�+��|z>�J����W��A��gF����7���'�K.��@/s���|l7�;�^w�1+�o��zpx7��T�:��*��pr�d4�DȢy���m�3����B&'������J`<^�C2�����=O_�.�F؞y��)�w�WXR�L"������>Es#\��q�~^ (q�x�@�u�)�̈�͎b]�/�\��M�iҺvZ��#�*}
@�3��_[���7��q��Y0XwoRpP��+r4����ň���](�u?U�K�n��Ct��\;:�,1j<I�����Ā44�>F�O�T������/���}{W�() �O��`�9h���E?���|�UKt�F����,>v<Ɠ*�%�F��QW	����Ӏv�RN�n�[����H�XMw�V�ЧS��@rh�9����`�-J��||N^h�AON.i?�!��U�T ߶��K˚
�t�߽bʫ���E�y�^ �7� (����+8}ϱ�0m�I
'�z�tJ(�����6�3ęw�޵�$5_�o`����G�9A&^7L�=h!$�f�&��3�g��>_!p��+�T�љ4BTBa�1�Z�M:^��JBà?ot��CF�@�[N: �ս�&��w�e�g��ǯ����H��/��y��R+��j��G9
�J����5*�?zx�ѕ�#d'��RI��`���?����g�K���j^�W��}���z�>���kАw#n�;����72*�,�	��[�+$�ͩ��|�a�v�a�)IK�ϊ���`���\��"��F�˓ٷ]}���a�� �^��7�^�����ׅ�ۜ�:�O�g��
�doA�@���f,�S�1f~���yn�Z�@�qZ}����B�4����;>���Rw��sĽ��"Id�U����O�,sN�2�k���@j�{��]noT�|d��PN�r�-�����[B��'��4��^F�`0���Y�w(���Dh��tC���kO��h��;�����Z��;��+բ�7�)_'����'V�Mk���U?�H��`"���&�ƝB�m&[�l�~���^���|ʳ�y�� W��}���E;��Þ��*�í&p�o��]�t�C�ѧF��#���{n�䤗��ҥ?r88ꕅ\Hx�Tc�����>�$�E����# F��:�3j+� �-��WL<N��X��᫢J9Z9Y�<�����o�	^{����3���h�������m�i��q$�@5_	a~���G��|��F{J�'T�� 7a/��������0�*Yk��=�FX} �$�=�����.u�`Y��V�SBA{IP�S��%W:��W�<�lح�Ti	ܤi�*1�G�� �)�Q(��]�<���qI����_(���T��Y
���[�Kh�c�Ʋ$K����>@`1��2��=�-l�bw�< .���2�T�k>D��'ϟ��e���6��6��t�l��Z���Gi'�AB"8��=������K2S��Qz_"R���N~�^�(�B��a�두!�B$��nM�@-'7���Kb/K����3��8�BN�c� �F������ʅ��ҸV���ށD�u7�H��l�����/�L��^�KM+��#�j�~V�k�\��e�.	�����dɖ�W3~w�և�`)�A�1�\��G�X�����	<�M^��A	��> NP3�Y#~ ���d���G�k��>\�j��9�JN�����Г�A$:E��������_��P3xq�����ƭý���s.'M˷כ/��e���/Q�m.���b{����+�?��]�I/^�t�!�{���9��&T�2<7�Rk~i�}��C��%���)4%�B]2�z� 7hKb�K�����^����qǁ�x����s5�����+���\{�j�v{p�',�?�2zG$��e�h�m@1x�ݦ��X�c2;���J>���l�֜#	����gE~￾k=�;�4^��$�(H�7;W�g����� �J�����^�o(Wx���ˈ�@a��� <e�ŇN�kT�B� �|��ɸ�$sT�\֧y=�"�V�y~+Ε'�(�5?���6Nߺb6 ~3}�ƀ���e�K%kw�n���o&̣��@u� ��bE �y!˔*6����ݛs���#�B��I?�j��5X����ҋ�}��oKV���S �b�_i�ȚB�j�
chi�9w%[���	׫'�gq�z7��z��D�;'���<�U����Y�j��r�-�]�`Y��5��h
1���}���^��h�𕩕�lF��_ q�B��*X�0ķH�Ɗ|ɾ�tT��V��^�� �k���d�e�s������'
m��+WC��]0p�6��";m,�d�Y�G���m�݇p-DI(Т*p�hR� f;�v�r�XH�w�^}l�B�{34�������.��x2�m�=Z��C+��%�dDuH����ҭ~w6� ;9��6M��|����7�h̡qO��� &P�@�c�D�#v4���ׂ0��j�_U�Ԩ[ۆW�7�~ �z S�D��4�����k����� R���$t��`3"z�ڦ԰C���d����s+�ݺt�`(|Ԏ�A�S�\*�k��G�%��N���C��:n����W*pȓiȽl1p%&eU�<�[��So�֋��i�X��3����V���Y ����-3�����Pb�$+v��po����4��$1Լ�����#D/-5~}t�O^>��N��Ȭ�[���^��ia�=�ةO�/9��!�%
��.��P����+�y!Ddh�s�5�JqVɷ���_�gJ��|]�sꑨg�}�7���������_���{���*䋦O)��t-F�5��`iE���\^�^��ͥރĜN&�R!��z�]���p�9�UrkM�x�$���*�k��^XO:OW/>����0���h#2���O9`Q�g�_O4{'Q��ɺeZ}��f���W��+�m��|� ���%���D]hJ9���u�|����,���]h��T�_�u}�V��B��i�g�!�m�:S����R9Ǔ�ˆ�Y�\v�-�y�Dv���T�} ���<�Y,Q�!�	fň�����Z�Q�������75P�5�u��,*����y����V�My���8���,'�
Ւ�y.����F�*c�Y?�K��Yfa�>S]�� �����4�K7�'7����_�?��)��Q���J��}N	�"�N�ȴ'7/9\^`�5���K�h�*�%}���|���z2���B{԰Z)�!,���O9��K�����}J�7>E���C�&!��4�fm�!�n�3�~��{@��;�6�Ӯ2IDjh�D����\o��s'��'������ݹުT� '��"��ޏQ7�	����A�]��%W�|"���o�8D���9wy�u��!��$K@3q�׈�;U�A-	�0T�i�C����Db'U�^���0c��\�G��{z�w��p�I�)mP��oI���wM���s�-��r�U��ҩgP�Ot�d�J�v���
��}��Vᬌ�p�V�����d��N�F�Ұ�H#O� c$^f3n�gi��Bva��_�|F��H~x��R-�2o��p)��߅yw��# UN�.H�i*�� �{Ҿ�Ǻ^w\K+>酓/=)��I�\/�ܓ}��WM	�P��y&*�o_^�>2T�E9#���qpl�V�1P�k����*3�&z{���<�B��oQ�KF*9ق�
.�CY	sxT���$��n�!�F�'^ӦI��4�m{s�&�[��DEFo�.銁\���doۜ��2�c�^Takx���kC���ӭ��� %����G�k��o��<��(���    f׃�0w��!{���]f��_�Gf__� ���x�z�sk��{r��N
�;�����
6�`�I>>�A���$}
 x��t���6M#���(�!��\d�)kh��k�a�1�+�d{��HiH�DA�Ϗ�2C^�s�i�G�) �����6)u�9}dF,���ӎ���ϟ� ���kGx��6�V�h	V�;rD[�N�j�T��<E���������Ɣ�6*�����M�[�����Ã��=�:P3^"��=�7��g'^���U�;�=���'�_8�L�[�EH��}����x�0�XG�&m�ϧ������ս*z��+�d; �hoQ�?�/s��~��w��K�)�oB��X'E���a��
V��	�y�Zr٫N{I��:8ߠ�?�G���p�e����+r��ڢ�0�����7�+��g���5�=#Dj(ۻ{��p��A%�λFۃn-�9��jA��Όpd�{�L\���g�eX ���[&�$͗X%�L/h2�ڤ��u�e:+'��խ�/��3�����=>�I�%���~����VF\+];C�K~�f }	�/��K,���!�P��BⳜ�Bݜ�*qv��K��4 �w��iM<)(P�d�C,�8�[�%�W��1|�An���x�/�)�؉m�Y+��{�TqE�5%-ͤ����# R�g�^�J1��T)�݊B��X��)�OL���)�(.�<��Q�5{�7 �CiÖ�*=����Ɠ<��ˇ!�.���'���a�F���r�����F�Op���HX'�X'mcq������-�;o{
K ��7�2-�F��7Rs�����8����樏�Q�����J�O	S2>9"�66S���pkh��-}%���֋7����q�� �|r�F<j�{��� }ؕ�1�SO��/����B_b��rD�x��s��ɷn /��SP��9������>�\��AK�.����������<��J��\���#�������Ԧy�b���'R��Yr��R����ʯ�ͷ��x�dcAV_N^r���\7!�RL�*e��!H�z/	�')��?�^���5N�}�s���BZ��,�� ��� `Q��(��aGl���Ej��I�ysQ}�10���VB��
��R�>��z�W{�r�>�V��|���>O��;]��'oU�^�қ�m���l��x������ ���DQ��k_ab������C�r�L|���(Nx��ݚ�pud?��ˆpy�
��~��s1I�&��tE$�+��h6��OR��&���Y$zo]�B'S:7J�7:_w��/u��喤�߀��[����N>��v��^�z�k#!K����~�bh�� ����=��8���w��� *�P�S�U���>� �Ɵ ��^��U�gFCth�Fy���_ԙo% �B��T/x�'��-[��"��뿎I��e;I!�+�8�����#�9cQ�d4��&XR�[!g�K�ޢA_&�t���O=4<���]�������4��E��S���2%P�����QsYB�U5Pj�J[q����D-,f���mXp+� O�z�%t�>��{��vʰ�����4z|��[僗����5[�x��j�c���2�œ񭵯���c���p�%�>~��gӺĚ٨�G9o(�|��IҘ����r������=�&�6W�qk7�� ��
<�`��1߉%���Bj�Bi�*���{���ː<6��%���}�R�ͱ��KT�Ej�n�Lp_ T�zp��N1��P���6"~�����lQo��,��U����W��y��u�X�
e9��a�ts�� PR����1��h�#�)	BÕ��i+��>�p�V��/� |B��.	�xo~�/SCAz��ךn^�{7Xփ�x��i�����1,�Z,%&�������"Dƛ8��-�?�N	D���
r��+X����2J��Vw/|ȹ��V��tU	��d���Yr�a����z��$�P9:��	2"��<I!pK��c��|j/�J�:8ߢ�?�S�I?v�B"��!���&4�7�}��(�m9�y��إP�':ch)��N��j3�k]>F�JK7W�� 5�ɴ��DM9d~^�${�4�:�%�CӋ o�$_A��� ���!��%�+}Pd��1�!��d�$7�R��"�����l�su$�:GL�a�|����}�X��}�jzb'eO'�t)����x�@��53-���������X�������S�MO��������BXH9[z���A��R���KR�ӓ9b�Ko^�:d��HC%#�uI[�Zz)��Qy�㐽�H���F!�{Ɋ׆��>��cѹ�t�u���92������pxy"�n�����������G��ǟ�oe�#U��$W��	����3������o�{~�l� ~��׷A���
R�B'K6�X,6EҦ-���-�ؑ}����U������O
�|�R龖ɛ�߭���-�tC�`��g <��>ȷ�#n�<��g$�1l�����O˟��o�&_��^��#8 )i��!jG���X��9�&;�@��(	�T/�8�>8<��ܸz��3���L��g�P	�_<<��$�/�YO��K�]w���yz�Q
	������%��H�����XO�Q�kL��� �z��V�P��3P��_:ԝ��NK�|2 �y��lsxN��[��\�����A��R���l��Q�b�2Guw!_=�\�����6[�� �x2K��$��y�%رB�F�aU���\I'r@2�;I���6�%M��ǛA9��� �E���@ߝ| @a�`����w@7J���@C��>�	l�Al y(d���'��ik5&����S��hc����,pIb�pX�-�WqP�I�4�h�д!NeZ�"��# �i^�{���exÙ���G	�K�c��{������"�a�'�.� ����,�!7pfc^ �>ĐF�^u@��!�w�h�!�s*Nb�y�l������~@���S< f�:Ԧo��"h'��Aܶ�C�@��P_�[/�QOZ��1n.��to����-)�I{��� P�6P��_��+��f�kpq�6��C@@Ob^�P}��I���Y9E� ������;�Ly�7b�	 DG�@����/e���8�Jb`�(6�|U�7�I���7X�{�v�>�B�Ѕ�b�� ��> ݁0`Z�������]Jإζ�V�1�6AM\OVbȄ���������)A�'����l��=C��On���.I|��X����1�[	��Q�@��y=I��'�aQ/�Mo�������W�P��H�<@��g ���⭁����@zO>�)M���(�C���E�R��#�^}�S������&���QF���> G�p���;�2�R�
kmT�����Cl����/���Ty���j(Od������k�5b����� ?�8s>9-
:�wM��aaD^(��(�(9�D��q�^ ��n��ba`N�T }\����
�g�x��ķ�T�B୭z�S>H���E3�}=#��t����,��F�;����'��! WM��|^F�~L�ИW��w\�+xӍyW4>%��f:�m�=$�Kw0��a��R��[S��`��PO�/�p�ix	 �@P��`PK�my��X<+&�p���_�s/F�D��{��}���O�`��g�/) Т���R�§���E�Ns�&�93�WKv�\b	���!ڠW��M�н��s ����n߳��
�_1���E�LS�@U�OևWL8w�@g��x>!������qYʧ 	��s�ec	�1 � &�Ǩ���Ђj�ϫ̻L*>��|SX9��,e�J����(͟���x�k��w�S>B��'s	s�����W�+bI�
�u[�hcܾ�-B�3X ��.c:�6���8�/|��w��G��}D�����C����v�^��
t��nQRʳH+��b=�FЯ@`����vr54�����@��f��&!��D3�s�N-Q �  �d�^���k:�ٲ�ś��Ţ��?��~��j���=��>`�N��*3�:�o����P��4��u�"�����Fߐv?���#�FOS���n¹��
Z��N4܋͂o��WH����"G�i�;�
���4��)�Za(Hx�mP���β,y�N�
 5��gKqv���g����?^�/�}���h'�é)X]�o���,P��'ט�%�zx�ѥ�#$�GŹE�����cG��Cc� �>����������� �V_�IO��ȶȰ�'�s�Z M,��4��,�_ͨoI��9b�g�]7��0���Z
�سX�?�x̿~���{{g/ȏxē���51��4���Vb�d1WC�zq���@�m^�%a:�&�h>�ց.�Cy %$��҂C�Q�%�zc��B듖KE�8ٚr��r�4��dhD��[����<��+ٓ��� -r2�}Ήϲ�Y���]�>@A����+�z�v?�(����/������ bg�      �      x������ � �      �   #  x��[�nG�|��
A����{��'{l���$�G6�0�*�͋DR�����F�nVuq:�[�diT��8q���]EJ��T�6��}f���N[�el���|���Ϟ�������"������r����fV�W[�O�����R�7����˲��p����0��|��Z��+%��?8��F5IgC4LS�V�y��ڋ+�lF=q�*#E��4��4�(͝�<t��b��ĔGP��ܭ��ur}���h)Ř`K�+��,a�JQ[詝-cM�W�s��+����9Ӟ�:*�4t��b���TO-�Xs�f%��r����A<*�%�
�"��0_|�59��h�ԙ�����0�%3'r�����E����D�p��U�_�������[�xs{uQ�;m�s|�ۛo��?\��_�7_�ߟ?� (IZ)�^�x�:���D�B�!8âLJR�t��Y����ҡ�yaѐe)�Xu��H��aOV��Mn�����U��Nr��W{d�\k���	'�5ޢR���>��ֹ�u�S`��ʲ�J:(#�%�u�!V)c�R�,���T�p5��.�vzؓ(���Z<��H��%)�^�k��=��XLPO�$!f6,���3zQR�<Z�'	���y�2#&�xȄY]���t�'b�#��ZɕQMh_�j���&K�
6�
.Mɀ�魢�j����]aҤȴTW��$R�^�(������=������r+�4�ނR�Q#�T���x�P�Ȩq=:r#��b�5s�C�>r�,���1"��Ċ�؄T��e�"mu�aOt<BN�e�2B�w��@�2Z4l�8L��ɂ@��`���\c��ՅYP;�H��,I�ު*;t�v&����h� �BlZqK�}�����RA�mmQ�B!	������F���aa�`�^B�
aе��H[{��t�k#V�z�t��z�Ѕ�(E[f��������_D��gc�1G	5<����T��һ�
��]���=�i�yr��`s�8a��Щ�z�G]�,�G�C�%b�`��&YϹ)E�A1T�Jѕ��Q7�⢓����I�<t��:��':�'��J
�6j���j�$�fI�9��.t��ɤQ���C�w��RC��ױ���:s�wL�(��d����؈r�"�,��=�r��AI�V~e<^{3���B��QNHs��p,��g! ����h]�1�A��02!i�Xh�d�#j
�c�"m��aO�|�)�~�d|������Euk.0�h�D��"sF	���-C�Ǝ���1��y�s>X?*#t�P^�vP�+�-� +:�\b�%�����<쉨��/O�ج�.���uf��h�c�I9��h��L��㼘������=#<.��[�
R�"QV:ء��U��=�L�<�*�g�tu�tb�v"筗���!��r�&��QUdNX���=���.�t,-XZK�E�YR+�z���]7��1Ci���	T�8�|��D:�kaWV���z�����}4an3�F���D���ѐx��ɂ?��x��Y��LYZǷLQ�=C�"����;K�`O��-7�o�ک��C����������OK�H�ʵ����������	��M&��R;���gH`<K�H�kr���1:1ű4��"�K2a��bc]����١���V�z��Z����U�O������E4 zrI�S��g�a�2�0K�e2��ɤ�
�lZ�$�6鈱
�5��q�.��^;�)O?���|q��}*{��͌n��~_�-H�F�sUy�+AŸ�.
BYORV�|I��1fՊ�ҢJ*� |��%�.Ү�w�'Z^�������+S�����y�̂^�Q��h����'�i=CVET���	�E��.mq������&r�a
@]	��]�ݝ����*����o�/��o��I����/���	�Vh���^K>��	��a4n8��8�P��lV�QXU	.��V�Q��LX�.!�/�XJ2�	:r�]���=�iRؽ�B9��!����7��[ dW�BPUbi���è�� �0���kP��+Ų$Ln/8U%1aX���#��m
�X ��Jz\i��:��[U���x��]������{�������0���|��hH$,<���}���23nM�(�֍^�(�+��ZI�V�����Δ�X����{�����=�zQ���=_|��������K�K�/�+A��� ���_@�
���蠮 �Q��l��Q��.�
,	�#��N-�g�t�E�:]��ic{"���ݞ�����3����`N���_?���Pz����T�)*Fc�	�Z1�<"�W���C�%�s�lԈ��kʕ�J��#6�wֲ�\W�u�"��:�S�/�p������{���_�*�_����G�������}�w�]X�9jJ����q�pR!����-w�G5Z�0x�E^0��j:��*�s�'D�����!���O8�»�Ż���
��~�͓Ps9'���c�o�3g�`�9�*'�do=ܦd���b^5HК;�=�`�0�·폙D�WCi�L;�9or���>b5�?޿���G������T�pe.ֆV\a���?A�8��D*(#	#���G�6�3t.��F��5+����"�ϱ�^0�G��2t�v���^��x���> �;��.7_�~��c���=�@s�x�ΏPQ�KJsX�Ѧ=��46�PL���H�.�5�W�|��{m±�b�&���1]�O�fϞ;+�����O��տ�/_�}�M{���䘔J��ճ{U��	�h�=��k�g�l=:f쀢�c��"d1�ܟsk�Ζ@�h��b�9]�]��`��'���4sL�O�y�櫗Q��Z��Dk�B��B��C�>�ڀJY�����a2�t-|(
)���,���>5�@jg|�tV�i.��H����q�j_�]^��q*��=]�_��m�������W���RP����>����H��)$r�0���sE�vr��pͨ]{X/���	𡋴���=3�ݿc�s�������۟�c���8MbI�-��pY�x4�LE�;��Z���p���@?�ڞ�ð`D)�!w7��6��0V]�����p��7�pv~D�����/��������{q����feINs��v��RM�Ӛv�P2 "�(�;��d�?���CFtˣ}E8RAa�t�b%���.���Dٓ58ߜm���{����E_^��� ���0m&5�"#O$���G�@Q��M4��H�ȀA�H% 	&��*�D<jL��ֈ��������^]���w����p��C��8;�}�2^���y�s�}����@�Z+�r
)��d~�"�Fyu�p
3�nw�"#��P�H�R
cv�K�%����c{���<V-y�F�:t�vF��������s�L�~�>��Ҥ�?� �=W|i��YZ����"��!c5�@H�9`6�sq�1�);4I�N�l���̒P2)r�'��E�e��t��,B��و�x���+��ކ�^ܨ�c�{!�Q_qAF�}����0���jh��"�3��qQESv���8�� 3�O      �      x������ � �      �   �  x���M�#7�שS�>`���d#Q�6Af��5�㲁 �2��O�{��4i-�P
���b)Q�����?�����@?�����?����_kH�O�\a 7��|�溼�U���/u��A:��au[{iH��IB���^}�xL�\fO&m0��szX����C1I�ԃ��d^{Q,�!�;���ӄ[i�8����X��VO�m#{����Z���E��&0,4<qdw�mss�e��Jy�����t��'N�nk5�푲���� K���Yw��o�/Ѕ
��/zٸ$�����!��jJ�s�>qv�T�z_%q�`o@؜�5���,<\�S�b�E���JL}ĭ�b��4Ɗ��s�>qt,�j�\מˊ��k��1�9�DH�3ł;6�e��=��B�o8�z=����t��'Κ{�=�3(rw�9�w�FǢ��y�RNOuz��.a>k�}o����&���Z|�̞#�\U�|lz���jP����[Gs�^�r��@���H�*�^���ۃ�Y��m�V����g�����॥`��`���>j�dir�9�3�`K�+�-�p$��'_����񖱂��c��C�C7U����i�R������JM�����i=ι\ʙ�l�yi���l��Lt��P��N���-5#N�R7���8[�����A*S�V0���tY.���L�>��4�ɵwJ��qޫO���%
J�f��13q�6^4ܦc.�>+���K29�ǆ2������P�(eZ�u����|�>qbd�4\y{8��s-2{'a�Qg�����ޖ��s^9I�̆@C�]Z�/k��Az:�~�y���W1Cg&�R��K�u�I5������c�}��/�&D��r�;0�o:�ƽa�_OI���W�D��<�$��$�_�`B�L����"[k?/�]��r�&��+C@ܿ��ϋT�Vs���X��NLw��e��k�Ĺ�%2w��y���yǿ2�      �      x������ � �      �      x������ � �      �      x������ � �      �     x��[ْ�:}f�"�Sr���1_0/)z_�����I۔�޲UJ:�J��� ����G��o0e�頚��;�a�0�]�t�����xU�J�"�$m�s��$�Xp���BN���� w���C_�RN�LAN��ƙ$���1�PMQ�%M(�*B!�GWc�K��;�K�����3�����:. �-�U�V�B��DP�HX|*(s>Un��s��d��(%���&%]s(T��p�w����{zo��>0]�~��4WT,�����pޑ�}����:����9�Q_L��
$�:��U�/%�Q�E���U�\CNR%/��6�
MD���Z��V��jy\����h����-��:�,g믰on�f9_ΙV \�-�סP���:QU
�}��k��B���i��,ѿ��"�J1�HL�[3���O�r�Xj	e0�qP
�,lY�BWVW����fH꯳q���b��k�H!p�$D�gVN�Y�TZ��C�=DIM)=A���>��RB�(]��]EHig�(J2��c-|��՛�2l��y�/N{���r��Q������+����gP=�A'Ƞ�G��0e3�׵��BO��-)�,d�)oj�M�þ���cu��k�#�e�B��<� Iy�f�#� �D�}�A~b���υ��&�H�b]p���G�AD��*T�=�ӸҧfVW�E`�>[qG	y�/�}Q�@�qu)m�S^q���S�WI�RR?hYY�n%%�V��T��"CFHQV�=�g�UuW��r9V�ʡVu��$��ZRTQ^r�s@���^N��F�?�ߑ&�k�,!�G*U��ª�+�@������Ky3���vjx�J�	�HeGYC=M�9N�R�(���Tj��P���HI�Z�QXI��k�T�������=�`|��鏖�W�㡼���j�]Yi֊*�5u���ԈR!�DB���0q\i�~hv*�DY���q����T7�P�$��Tx�xa��Pg�
ei �7+�baq�.�z�X�#�E����S$J�S�P�L�N*��:M������u���	IT�}b��m����DF���ެBض�o��ìڬ��D���y�Ĉ8N��+�I��}�8 �u��*�i��vd�]KD�
���z ��o#Zb��}���YY/��!�|���k���!~11Vq�Ҽ�s�Y"�@�.9���ǖP�"��5*�zUVMy;L@*��ň�K֘����f�v��5T<�;]�1I�� ��v�1E�6��<��7~���Ѳ����N��V�$�0<bL�]ʵ/�md���׉?�nL�4}�� Y�J3�h�b���R��yynp�%O]���8�I� ����]��]��;s��MQ�r���c���*��R�r¥���$C�1���}����m��ɷ�U�ވmɌT8iiѕa`DK4�.�bQ*}�� t=u���j/���f�N�'O2ύh�ap��3���x��X�䢷�<�I\]��3��x��dD���qݔfH�|g�.WT���'�N�v���rĘP?�g�`WR�_���t;#qJI��'4Z�C�a`<K@��n��.O>V��<u54u�)���~��-s܈�Rl#��nч�yH^�%�.�$r� @Z�Y��#"��P��NK\~��/NW4Sw&����i3����d�`�Tq���f������.<Ӕ�4������s#��v]�*��]�0\��Nl�.�!GA��N��+�1!�u���.�y�d^�?l�U*S�8�$��g��#Z�L�V7O��&|>]e��YB�dd'�%�]��<7"�4���կ���2���X�K��&�Dp#T��#�D��?�V7�?�ɷ�AX��k�T6Y���=��#Zb�yW�s<_p��<�3]ퟎ�*ń=tJ!�[��ynDt6������l?]���˄I�S�Sq����#Zb�;Ѐ����~�#��|���>�wm�������qy��o�P����О�d{�pB��d1��������ː}�j�4=L�8%&�>�q��0<�%J�Y}[�57�y�ͼ���b��_��q4�A*3�g������L]�y6$&O�����$���������#Z"ɒZ���v��{7�ܒt�
��t��6m��� }��d�X낇 �/!
Qx!* @��o^w���>�7*��iP�?Q�$t�`��L�:k��S�G����!�j�f��,�+�;��=@�S��	�w��$��x��`���;�����x��I��mgG��{�2Ǎh������y9�`=u�vދ�K�<�%���o#��v+O����U���d����%T���=7 ���>s܈����:����(��<o���sU��F�dS���l/q6�J=�K��C#�h��Ť/M�Q�Q.bcI�WVX'(Az��b���|.@
v��Fnq����u��	��DL�]=�s��7I�G���ey[�k��#�BH���������М>6�UY���i>b���f�������~n.x<����h��@Z��آMO�PA�5���R�jR���R��W�*D���M�ջ� 6�_f�k�3�|̜�ŵN�K��XMiѶ�,�#��r�z;��}�f�"�J�l�$�M#�#��6{2R:f~(V���6/��x�	ʷۍ���("EmB1Q��J��bX\�ks��icÂ���Ƹ^P5ɩ�.,�G�1���&4y���o�v0���x��_e�e ���*�wa���z�)Oe���kJ{����j�'�4s݈�rL/��M��fȴ�D�L7�.�(��T�	�G���<bP�c~n�<���Χ�[�c�K�1]y�k�6(B�S)ń��>�p=�]�:.�8jS�����7���/?�Z������J3׍i�a��r��3T����U���H�i�X���ږ�f�9"���{S_�f������?(K��_L�+�<7�)�������Y�_I�gZ��� x*n�k�XeEfDK�x8��֗�د�
 �5���7�牕�qc�����f�8^$n?^`������AW2R<��q.���o��,��/����R�ϛc�v��z�R$��i47��k^10"���,��H��n>?���j��k	NE�F�:�Z�yn��(��m�����������Y����;I��>6���Ƭ5_�Z���F\ȓg&h�$��H e� ր�c|���� Ú�|��]<_��AYG=��M�+�\7�)\��}q���n���42���[˛�̨�(�ԣ"dp3S,���Bߍ2��}̽����0��f��ns�:`��ܞ8�٭��e⋏�>���"�f_�
���j��+����i�4�����<"��d祬W������ir��xS
*��3�<�cE����wz�q?�+MO��2p�\�>[�0�X�*��%���w,l������Cb���2�S;��=��T�-�{����~�X ��w��u�֟??��������l�i���P�W׍i�e��:��|�n?��&�͐th���\��C͙��4�1}���^��GB�_�5��2/�TZ#��)sݘ��s`�SY�}�1�H�������-S�7��������I      �      x������ � �      �      x������ � �      �   L  x�U�ɕ1�{�G�%��?�)Z��}��,�F�����7=��`N�����ML"Zb��)�e�_S<��䋮[N��i�v�Nv8�M�Dn����~�X�[ܡ�F�Ɠ�H���S� �v^Zp�_�W��͆��/*�Z�;rUk��d�9^�æ��#��`���i;/��p�����[�S��5�C�qf�D��͹���Վ�TsF},:�./������7�p�9�U�"QSP�C홆M�D�&hZ��w7�������Î��w^�AŏZu���"�sS��ܻZ��TS|Q��{_;�EЪ<8{>�4�Cծ����������      �     x�͗O�E��Χ�#z�U����B� ) 8 E�W�XvQ����&��gP8���ڵ�mO����k�Nc������Sw�C��R�C��<�t&����h.��*�'�~`��<.^�?;��z�������w_J���/��w��nn�C]�����N�/�~z�h����Y������ۅ�3�g����ߌ����C��J\��쓯��rs�~,���ݻˇ�_��0��}���i���鏗bX����h���)D��%_��)z�;)>w����a����9k� f��3{��@��Y;k��>IW�L�{0��W��͆��UQ�!7rpcjC!�j���Ь��0u�j���T#��zϻ�9CZ��,���^!iq���h`d�S�d�����<&��R Ƨ��H]͗n��a׺ģ�b>^P̾z�`ZO�(H�(Å��~B;Se�!p�p��p���� �Q�6}�������KX��]�
���5�+���.�`�����>$S��P���[ǼU(F��:��c�l�c�z�Ū�� f_�B0[�R:L�O�n�$��0;Y�p�vTMc.J�b�`,��{��`��ƻ����C��1���4&e��zF�y:�ښ�ڜi�J�p��6n'��{VٛoG�5�HQ.��U���QJr�=̷"�X�h6��B����0�5�c�rL�[H�=w��J��jX%�z�%.>)��6"���7,���y��<�����|����F��3~F����9������2��/��\�D^V���z�N��B��e���@)����W��Ldl��� rU�9�H���M�[��(��U̔�|�.V�Ae�ѤJ�����:őojC��I����bΈ��WC�=�������#�l#�>Y��&mhe�F��/���Ⱦ9����Z��
�V�h�1<Z~���a�˰0�H���~��Az���W�X�Æ���0K�&�m�$G�ekNb��u�x�2�ګ0�o�9��]Fx����äF�Vj��b.���a�KT����m�G|��ޯ��U�[�����p����~�r�:���#��ծ�k�^�b������k�p���V�ۍ���}c�q/W�ҽ��
�Hr��I�t*��$!�����A3c ��k�R�o��]�� ��rپ�7��_x6m�e@���K��%�����8�k��l�A�f-F���d��3�ͤ
ߊ���%n�|v� (ʛ<4!d�3�z��tĶ2n�1٤���w�~x�l      �      x������ � �      �      x������ � �      �      x��\�rɒ}��
�b�v�Y��iHx�{�wc����{l��j"��z@"Y%�y2+�) �񰮼�|���KK�ҵ��CK�XDH�@�`)���j���e�UK�}�W����?��@ٽ�o ���l��P��M����K{Fw��z�s�ɂ���|��� Xf*�¾_ֿ!���}0HR"�9�/���+������n>v����|��yz�=�����������|�����݋�l|��������#���Z�{~O{f�r����N�����.��)�L�@���b�����O��/��G�@9�p��,;�"����ki�y��Z!�o�������������_�_x���i'��F���zr5���7c �@�Ϝ�I@3�B!�o ?w
��'��b �$�T�a��Tϴ��x҂�+'R[�i����̓9�o�^�Z]X,P�$�Bk�v��F�h�D�𒭀Ҵ׍�t}�Vlw&��d�N�MG�/�ӈ� y�|l� ��!<�̉!����.��b9�M�_�j������^���|�W%�c6o�z�����@ 2(��q�	�C�!���Y��A�hK�Է\�JH|i5'_I!Ņ�tԼ��/��vg�x���c�Y*	2�BM��Vͣ,���./ۃ&�䉨(A�b(�=���L?@��f�'fs"|.�SL����S ���#$�ط$�LL,%���R��`ʑ�����., ��d�Y�+{XMVS����w�Ne6l�[m�$��6�E}Ux��sv�DZ!�؅ $�.���͸x�D<����4�a�-%��KR�@8�D�ZSA��K��M��-GBaQ�;r�5�����^�ӽ:\�����,Q+����Q�����8��h֍��[����� a��U���!!܄
�?~�@>C$��� �Md�Ƨ��HpXň ���kQױ�ȒҰg��@`� *�M#�tkZ�UU�߶�Tk�}I�kϖ�hW�֍,����K�M�֋n��gXF0�9ލ��	B�)�� '���������HD�Q<�ć�k	����1�x<�Y�$��!9Ā�� i�H��2k��Q~��њ����s�i�ɺ��s�����ŧ��iT��ND�1����'� 7�:B��E`-�h�@����#�ɑ�@��@��$@mF�9��v�T.�,I��Yp ��?�`�Ʃɬ���.���$�ؕ�	^�'){��I!����f��/Uw�:���x��D[�B�<g"
m���4򰛁��7��'�g!��b0��ki�AH!P8��Б��V���Y
Sb�&SU�}�n��^��cå���![��X���բ�GͶ����Ÿ�x�;�z�xh2I$3�y#�@l�~���s����?�ŉ�iȪ��������cU@��s�A�J���y	��(O���T=�$}��m�Դ�r�^�$�����֚��e���x_M��~�}W��D���G��!7�p�@�?�6��3^�,NTC�{1�����8�p���|�!�,n��E��,�D6Q]�=���M�������Ƹ?���Ub�u�)�z9>�g���`��AyXe���}t��6�����ï��gR�G�8�����d���/��������~8��4�(�<Cq�ԒP�p$����6݇�|?S.��R61�i���)��=˶.ˡ�����ml��v�p�����I;�§�7��s�$����g?T��)b _���U�8d�(���Ƥ-�!n
��P�,Wy�O\(�v�x����R{���c�e�2o��^1/1�wJ��۝#;����R�_�C9Z�����uDS��DBm� `w-�k7%���dN,�WH�_8�)��z�@F߮� PpH��V�� <�;	�f�BP�R�"�0-ە����Νr�`:��d3��'.&�ɉ���(a�����@ޚͽ*�~
5���z�6f��f�R�4B+�w�4y@���.���m�����G�9�$ׁ'�|�D�#�T �I"�cN��4�"Ч���ɞ���gLS|ۭ�Tw4Yy��D��g:�I;���[����^G:�ϗ�܊�N����[uޢ�&�wJ�/a�7@� �7!L�w$��?��U��j��G3� 8=�'�%��s���҈ꠂ,��Ҟ�"���ۃK�X�X�ՠ^��Q�3I�c�	�˕�P��es��Xz��v�q��i���̱�E0�P`C�7���n� 䙺����k(������(���*������|Ae�=��o@F�jDB&���l噘� $�7�/ ��D��v��
�4�\��m���䠴��z��yv�fU�r�/q�'�Uw���
���˸��ѹ'G��B���~�k� ��y��9�>�}���>�R� 	�::�p����Đ���w�#"�;�N%�ۻ��̛6r���2ڈ�iw��^�7)�Ѩd�����%������v����yc4>c�;.��A��C���?������̭#hV"�������!o�s]53�h�$%�,��j�㚵�~}��s�.S�®�Y�dT~���\�]2O�<�LoGúӬ�h�6����u��UJs'J2�� v!��S�R��nF�3��T.��9
��uيWv��m�/�����P|f:��A�S�#@��4�	�ZĤ��t��|��d��U"o�Y�P{�qa9y���񹿆�=��%���V�a�ݛ;�M��jk$ʳ�_����[=�;�P 
m
�˾]�?�͟J���4ѻ� |�Wl��)�s���Cr����� ِ V���@I_X��QH[�faS>��c��h`=ՓR�^��Ӱ���z�>&NTV�r	�y�a����Ԁ��YJK�!@����{�����gꄏ@r���s��I���3<`��(|I� ��ه1)$�0E* ��"�:���a�`������T�������)��Ot�o���gi�<n��|]�y����:���W�I4�_�]Y��l�J%=Y�5����9c�X�0�x� �s7#����l��D�p��(�>�kD� ��!����]$,h(�q�&<�dKZ��p|.��ߞL�z앾-�ok�Qs���l���G;(6�[�ټ(x���^��-́tk[(���>��=cq���6��nI�ߢ�cx�����@�y�y%Lj�e�*a����ߐ_!,�"�]��D��:+�g�uD,%�ci(���\�화ު����]�������2N+CoU#��6�����ޞxX������Ok4Eߦ�hv�tQ�����M�^���d!����VH:�J��тÉVz��J�[;B-���D�z\AnW���CY�</Oq���J�֋�wo�;�?h�h�nV{n\�:/��e��>��vS���dwV1��	_H�vo@�k�ćq���.z ��S|��qM&6~�v��<�8ߠ��e5�c�pHfƤr�g9��`$i�8;q�"Bo��7�/�&��K�i��5��!~{�@ag��tQ��a7��&�-�J[��g{�R�t�Ĝ��f���]FL�Ci3�}f��<N����!�O�1��t��}<h4"ac$)�T&�)��2���eM�e�q�P��Ņ�{�¼��e[`B��"ّ����9�9�v*:5�o�;͕�f���N1���!%�x��I�*m��>7��n*�3��rb	Wa���i�0,��4���_����l��RD8��frLv��#��n	�b�$Z.�c�ݻ�x����KxY��v�-�NM�v}R�6��|a�-���6�Z��f1:J`R��<b�;�ͨ�oP]4Bm&�ӧ���P%l���L,<����_a�%AS��2���T�̌���D�3:Hr"B1#_{�a&�2�K'NZNP�֒x�� |;��]�dL��WONK����I�1{��[�n{�Q�B˫ݎ��4�n{��~q|EΈlp�g@MVz{��x73�|���\m���Ռ�~<�bzlٻ4�O�:�0'�0���Z���&���ޝ����fM!wnS�/�wmN楛�lmez^ N  �ֽ�d�)J{��H�k��3]�U��-��'���o;7;�� hi@��9ލ)F�$���r����S2��N�ʾ��l�\�ϗ�˳B��*AT��|���^�v��R�R�G-�5��%n��p�W���x�/����{�|{|6��U���&U��N8κ$vmP TE�`yzX��y;YL3�`G0n�Py��[J��E�G�91�[h�ƲΤ�tj�2A����_�����`�{X�%���A#Kx�k	4E�P������g' �0B���w���˺���~9��'�~��H�-���ǭT:]���&�>'�2B�mb��s��h7 ʧ.�< �Ղ�	����&�^�����*���J �S�#l�	���0�!�Ԣ7�A��w��OH��Sw�0��?��A�Lޣq�c������P�h�������t<a�����b��~]#�Og����	�	6��.�?�?I���3͜GP9K�.Q�tz�v%�9�39/�C%�3	��pc9�5=�M�ʡ6<Q�ʒXa��3��V@��;�A��.�G�E;���Y5���|���m+�vj/��|���J���i��K�TW3ɳ��1�M,���Ƀ�����gƃ�4z]"����hw1���z���&��-A�������0�d���I:̓��.�U��;����zZz��U*���NW�o/��ݕc���T��i��.:�Z�x���1;OX��,�޽dz���ԅ�G`9#�W`?�Z������Uz5����pNɕ��c��Ù(v9"����%2y���Y���!��H����cj>����������4�M�y����	=���6�|-���L='����H-�J���8^���j\�+K4�J?�|��Ԃ~�E�����a�[i�_�D ��@�D���ȵ@\ )n����ѿ1�ϡ��6��i������])#6�,;��2������Y�u�:���t~����~{*һq7S��8���չ�.iؘAz��NNvS��8�#�\İ+@��|��^�_�[^M�>䧔��O�	:L���0,,
�g��%��9|�	p՝v�^uת�/�_i[�}�&<��r;:�����_Po0,�3�U{��ES����m��0>,�
�R��-���P�\�H��$��g�Yǲ�Ssa"BQ�F9FP֥I������<h�2,A�g�#K�ܙz��9B��'�슿z�M_�rf�י'y���֬�K/9X���wz����\^U�:-V����al�]�}Wr��O%S`s�J~�E��$�s���>����I(����E�2���-����������      �      x������ � �      �      x���ne��&z-=E"o{�A2�d���l���c���v�����̔�ʬ*�}1� 3o20�����ג2�����{�gk��锴7���E��`�ou2D*�
]�*�zL-��^��S��*֨茼���2�@{�{��y�G�@A�6U��s�����_~�/�����W_���/�*rIkE����GE����1ɴ���/�_���������u�?^��T������<,�/���x�?�(�?���[�����o�ۭGB������}[W��]�������7�������G���X@���?>����>��>��'}������}�������uX��wGN�-����O��g�v�9~�a����ɛ����Ջ_ǣ��������?��R?������>�����p���?�.��Ň����m|��OG����aX�I�Aʟ�Ӂ����N���+�#�Z�a���ɹ��c�?����i����pR�Ǘ����o�ɇw��øIg��C=����}=ݻ)x��}|��O���������w�o��⟎�{�d?�B�ywx�v����od��)ķ������i_^\ݗ���YNeR�@�3*�عZ�ض(����]�?��LtM5�U�IYqU��&���޼{��݋?�}{߽�;{b�dp�`dР|���b�����7Ǉ��I����ޑ��A
�.��q���(����8���6����d��M��&�FiTFO�س��A`��?0x�ae,YO�v����$��h��Kc>���|����H��j '��*U�V���5����<-dJ25(s�wE�R�My�5�ky�1�y�K��ן�S� ��H��R���tN������]�p��TR�N���l>GE&́	+f��KӥsT��:G���~2`CV>{���b�N1j͞0h=�܁��Q�go]�� C[V9��Y�������}w����b7e�Mǧu&�����7���o'rr��v���?A�]Y�hq��^=w_��o˾|rk���"qr�)�rRm Y����\�H\��|)rHUFņ�ʮ$L�6Z�?;��ܔ!6���wU����yW���0�Gm.�V�	f"�-�Q����t�-�99��/�-y#�<�TB��f�Ģ2�VQ�,'ޜr�j�-��
��<� '���V�)�І��d{�v��Mb���&��&��݂Pj���!Xsi;{��<����+�'q�+���z.)�J��}�g��@m�E�e��)"[���^�ٴoaN��$.YKm���O�q�,���p��'�ٿ2�Յ�v������v?I+т�
�F1ˑX�<}N�(o�λ"���+����}������)�Y��������}z���3'��a#�ɫ���%��X G������JTATh�g&y��M�J�O̯��ԓ��A6I���%�l��>�S�*��$����(���9���9/r�e_����D��Lr�8�2�M��3�(r��������ݞ�ڛn�R�N�`(� gb�����7��^���w��"���t&]g;}������S^�����3i������n�#o��Hׂ����Ư����1!�4���f�(�Ç�_w��?S���'�ߞ��������g�'��t�Ie۝��%�6�\�j��h(����\��Տ�_����)'��D���,�v��%�8�	�%ۡ:-3�+Tr$�b�����&ĤLh�)"�ɣ���z�A)�=n~�'�ŗG���Գ�g��"z���Z�e��=����xq_����fMJw�ى�5*�L���ʜh�E�(߉�p��W�<�TllQǽ_ƣ���8e����zw#�����;
�XWF��<��{�Y�:�;y��P����>����1:ZSH.+�D�{W�n&�z�Q0�|l*Ę�Fr��c��%�<
�:���p�=e��GFX�ͮ�m�g���]��N���9_�
�n���<������\�	�6yY��ɄE^�B��.��4��("��2kFa��z���9�2-Cc�n��S� {Ѐ�g���;�-��ی�7�S�z����g�ui_��-:��F$�E6�\�*�7�� G߬�ۥF6�j��O�+1u]�K5ZNQ����W���z��qNi��i�|�3.�G&{bfL���[�Y�܁�Wl�]{�}z��K�.o�~B� ��*�W����/ᜦ���Ŵ�k�3���W���/~��=\�/(C%!��X����4+��,��J�qN�^��0�;d�\�ËS���_��mE��</�����$�/�$ד�m��5�̝��Q���8�Kc>����|�����d���H�&�ݱ��1�;-�X�C1>��?x�8�����__�Kg_C�\�׵jY�	M1"�b�;m�+1M��*6�sO�c ��"QQE�j弳��1��=�셪�E��CO((c����K?�5�y!�K?^/SF�d{��i����Ϡi��)��%�Gϧ�H�'p�I�t`i%J��uG��@��)tic�-�D�'!B�b��S1��@G�M�h�DS5��,o���.B\��o�=Vc}K|U�ĸK2�Vr^��DЖ����R��k�rr�����7e�M�F� ������M��ˢw��S�����g�Y����(mG˭��]ٖ}��ȁ�����)*�~-�X����;
�w����{�=T!n�'ؘ9���=�憯M��)3lKC�"�^L��Ȼ��|��3L'�"����W&t��N&o|��Mb/m�>Xar�C��*Y����2%Wk3���q�Xe�&C�xQ���/)D���h�mH.�2�����G�'��H�! Y��M��	�-��h�6��>�T��۲O�]JB� �bI�Ȅ
0;Yl��hN�a�7F�e~+R�PU>Q���R�������kn� Β�7߅o#��j-L��79)	`���2z�VD��z�{v�qW�e_�P+CVB�t��Į*�*�M	"y!3��%�J������.�{���V��pZCa�I8e�Mǜ�f�p!(�1��LL{�`
�\�Q=�D�rwN�.��~���,�R�؆1Rw�����ݟwzs ���յ�_�P��j�pܙ.u�/}&߀.�+���Z�<�.��~�N7lQ�ү��*aj�'�
r�F[�ե�I*�*V%��zE@WB,\u����I>�kj�Ld��Ed��y����t�-V(;ɪ7�F���+������I�.n˾��c�U��Aa��O�e��T3�f0�Y3�o-r�һ�h����OH�.�x�aH����wG$/}��X��a'O&a���R�GU,��T�*ئH^�9���Y#�&�U���c�����T�k��l>D�p#��G/�w���ؘ$�7�Ol�]YM���(<M���-�����lK/v��0(+7%�W�6o�����������Z'��=1���sQF{�fE���y��)��>�~k9C��0.Qa�EEm��$�C��Z�y���/���J}[���%AaIPx��G��]����;�J��=��{"7gy�QN�dɗD��^Fd�z���,ۓ�H�{jt6�W�܍�L��A�;mn�݆���"zs�I��j��pp�����ҏrwi[����.7�����\�"�5��c��9��>�4��JѲL(N�(ʰ�lt���^��������)��}�\��ӄ�U��g25`��L��q��<��p�z&kG����Yv��R&:�]P����'�nW!5H���^�YT.�����k�+D�C���(��n5B���<����X����Ikx����]:0f��6�gGΛ��v��@9�����Y�Pe�B�6���ΛP���ʺ�G�-�`�|5D�i�����͔w�ꠑ��	3(����̵��|����xw�3U#n逹����ZnI�U�'B�]/3���dӬ^�R��A�޷���b�^x�7јjL+�l��2�&� ;�~j�<�Z����'�#Ձ�Cv�3ֻ˟[������Mr�sS1i�j'��C�������o3$�j�)wt$��ǣ��}�u��    |"x������<���3c�YݥO��,���T��^���T6lj�(y��igLT��5E���\�k�+%c)��M5Q�p;bw�j�sp;�k����i����u�ܢ��Q��O�B�|���0M~.=.W,��=�Y)�q�Ql��m�Ne&�֠J����\Z���~�_�ח��/~���?�fM�Ą�n�+���3T���iu�S@��оv����~H<_\��5%� 1�D�ɏ�l2A�>cBA��h"�?O)��$�U���C��!z��*P
{�ß5�U��R�<�܏S^Bw��׍�D�{q��d�G�]���Ul�T�l6�`��������U�:��C�<���yx����X�-�u��d���{7G����Ubk|��$�kq=I'�{���x=�����	��x�2��B����Wa1����Ř�I�ɗ�*2�oB)De���B$[�ѽD�i^�I�($��+�?��:~��lɄ1nߏ�=h����#��Q��/�}_;�U�IQ#7��Q@#�6_\ivb?��Cp�B���^�e��Qɷ�0R1�.����7?��v��7��Ɂ�0ԭ�|y�G�g<�f���琊�G�#���~��/�}�v�X)KM�^+�2JYXSs1䉎��cw��n�`�~0-�V{�my/����5���1z��kvV�k1���',Ei�b������VeC?��m�)�	�cw�d�eyg5������c=�IKS9w���W��_|q����](��1l�c1]�lz���b�·O�t���j�Sˇn���A���J���^z���E�8\�<zo���<H1ݏO��b�㯯J�ŏ��S��UQ�"�"����R*���mJř濕T���PiX��$g-R�ܤ�z(h��{ZK̦���ʵ������J`Fr>�;����/������W�d����>�FL��2��!@)�n�r;e��!����7���)���3>s���x���|�$�G��zD�&(�9��
�z=���v}�����sp�IE4����lU*�Tk.Tk�0�Y��-��E*�I���m`�l����H+��hԹ�"��V7�8NQ�̍'�����I�=K�<�.�>��~�
�g&�U0jI�Lƍ��c�֚��)#ݬy?Nt�j���W;�����F�dS�S����ż�щ�!
i�%�����/���� 1���nE�����쫯���%�9SU"SMq@�,���#�z���u����S��ba���1 x>��+Pӹ{�M>���
�����U�^���U+��{>��;�����Ml�y+�����_�u@:�K�j@��}���U�5�&������\_��xM�	��O�m����g��0�y؟��z��~{�3�������z����ح�l��Ĭ�����[��s�DG�EN�[�D�̲���^е��3s �'_���46GQ�Cm�(��Cs��4�X���¾��䔁�!�#�FT��ku�������P����8����Ët���������+pw�}�z>OΜ$��!�ه�|Sq�G��/.~�q�ɥ�l�z/��fV:��[���.Z��T?��S�_5:U�o������ddh>
Q�|Z>�&�=e�)���\��a�,[v�m���;��'����|"�p�Ah;t=j{-b�.&�]8����8>>�k���>/�B�o]�<"�fc�Xʎ�� �2b�ņF��'E�F�m6�,��Wb�u	2rOD�:�� x�4���Xrr�lL�l\�t�Se�3�p�nL��&��W�����ľ����{vZ3�����C8�?=�k����7JEM&#�g��D}�Y���6�'��$��A�F$�>���-}H7�!�V��$�T0:vy�b4�Q-pɹ@E��|�+�p˫�u�\�.W���ԫ�k�����X��B�Ы\'��[�qb��;u�v�[y�.W9��k�ڜ`�r��ޤ�ڞmp�Nf�Qqn��ᵳ������1�����᯴���u(�n�2�C��$��Ӻ^2�__���g�f�bP���wl1�i)���6&��6{�_>/�"kΌE:��l���{R��M���b��l�8
9��E:X�Ѿ�L:L�貘�&'���휩��\s�55�%���$�	�\�Lx}���	7�3�<Y��+�7~�����e�(��_��p}��F���w���x2��i]+���N&��};X՜T�e��-��u��$!R�6e��q�Xs`,r�����X�A�~�1M-�1*��n,6�(慘�\-�`��P�;�j�?1��/g��`X��j �r�!@s� SD�c��DxЄ����H�[��շ�:ܚD�������W�͋�����n,>=�k%����I��ϳ/ȏ&DV�{t��&ê �����Z���mޭ%b�e�"�T|�T�_���h���Z�5�Qhk�aPh����A���)Q&x�J*N#�riٔh��ܗP�����kdĊ�c7���z��2�s��T�.*��
xd1��7Ɣ��+�`��W�D䝽x�o�����:�C/�Bd�c ��C¤b�� O�׮g�)`3:ɪ�<���D�S�Np굈��*3[j��r��)-�_ /� ��X��qM]5&��pTj�����.1���w��]Oü�v��j܃z<�I����f�$����/''���Ro�Sev��b�r:6r9�fy��7��N�<�ĸ}��D�cQ�Qw�Z����~/-~���Q������xUX��E7�9G���+u�up�*h����]�J��U�-c���_�e�הb�0�9��=�3��C���~��k�>U�����KR|?�+�tM���U����� ��ոGt�5&�jܧt�����4�qfm9�N�]<���"{W�e�z�qW��ڊE�D���˱Ւ �z}�s�(�z��^�2�0�
�r6���J�i�Ǆ���@_8B��E���'�/*�^��}�s��o�ad���X�kF�s��y|S_|1j�{p}z\�:�N}E<.}�^����s
k�B� �`c����G�iJ�qQN?�*� �(������,F��]���6`�������9/?�Ո�)m�t��a�)mw!Ow���C뷰r�b7�K8��c�S3���/K�d���g��J�J�yݨYE�Y�f2�����Ĺbm�T�{#d4�bҶ�;��c䜝?���Ú.��9��_܌�a�G�;�bw`i��V�O68_[�qc����R,�c�K�ML®+x��/q�^Yg��F:g�Y��˽2�n��r��t�a91`�"�0�-A<N��P|�L�3;��`�[�v�(�r�u��4���t�GM±+��ga�!`������ዯ���~��/�j/� )ú�QЊ��@ކXW)���I}-g]}aք*L�<��8���Y�S|��k����y�}n��D���^�!��e�M���u/��9~/��|������@����a-�x��+��O�ƦSU�Qw�v�+�S6�w�S�1+�C��u�V�I�*�L���g�� ��a=e�	���'��Ư8�����ߏ=9�}k�;�{���F�s��j�������jEC~e���Mq{ND.���ۤ���߯)1a�nIK�0o�,��y�>�怿�o�����hʬ�0<�����4<��;�y�C��������^0)_X�0%Yj�EE�g!���jӲr�����C#�V�8h6��{�RN�vk��4����N��
]c9s�g�kT�%�6\�"S�u�������P���dM��)�l�����R��U��M��`�c���Bp7�ۦ�w׻�)�|Y ��W��U�D��v}xŰ;F�S
������;�N��C���}�����7�� Z�0��-�
���9�6OK!%��%+=l)�~�nc.�#�Z���7�
L�����=�����uw���o��tS|ņ:H�W�yf�٥�-H�5���+���6��$}W�/�kb�=H��R/��D�Ac4�mz��
�~V�5es?��R�kg���_XXyMpz�e��BN�Vz�    ���y�|�h�O\��~�����]|�������8�矲�?�;�J�2��_J�� e+
�ޫ�{�;H���\v��+����w�`�p��%'��{4�b�R�ZT1U[8�f��~�@_`�#0G@�C([�r�B`Z��2^�~aj�1�P���p'��/����q�1%���JFM��k}ðy,ةUO�������bn����Mf��b�6E�&���Ԙs��BcN��7���Ѓ�0^{�OΚfd-�(�q��dvQ;�9o3���z��ON@�ˬ�w���L�F�h�2!��]�����{�+ocyp���w��_��+`g�tO1��Fs�>���2��P�]�huՔ�},�A���<����ƊNׂv[��dO�sF������n��@^��0�&-��	���p��ƾ�������Z��]��������;��Da,䠋��*����8AU�p�l�6��>S��R�y���@�-{*��n/�z�Jkb�j�7,'�C�B4�y�u�>���ό���w��Z;���r��e�J�-^zz��"���[-���ɯ������b��/�~��|�����Ƭ�jJ��b�:B�T'X��l�V~�-����"g�H�d"s�k�F�*TM�d��}��7j�o�Ñ=9�G�����w�h< XY0kk(?j����̨�s2-XPzfo�Q%��|�����||�������I�π�˓/2�2�z�qn�+9���rUٵ��p��壖H&�V��
���"�B��m�oj�̌Md�{sx���(��������f;�K2�(eS�V��S�)j�*B�5h���	|>����!�����3���.�|Cz�|f��R����^�I��S�4Q�+c�t�(��W��v�O;R)� ɗն��z����<�M��%P�:��jٿ惪&h�F'7�*'kb�B��Ѝf�*EcTə\(��ֽ(��a��1��T�w�����C�n<4�T*�#OlD�[R��g�E��|�x������ek��.;'{7`-���M,�Ԏ�kg졨hbV)�����Y���dF>���S!XT�W��U�PC�ĝ{��I�R�P���sbU4�$6kt���u�s��;WX0+�Ǆp9���g�����Ű)o��S�9򌘟���q}'��Ն��ܑg}�f�C~.��G�u �,rB��H+\0V>!@q����<�A��75�`�B�y6ۋ���7L�~)�X��1�x��.��Z�,����s��=t�����Z�A��1E�f1YźWs+�*��.{&��.̃E�� sS+�nN�a�B�J�i��[f����g�V[����;l�r�yBbi�f��]�):<m[�5+���f�m��5D�_���i�\<�ށ̓�0���#���a�%yE:ze{���J6��!d��o����]	:D�B��H/��K|p!o�sֵ�t��������������������������v?7RW�]������)����wc�B��,Hl۠�	db�6����s^NM�j��f=���oѼ�8��� ��j?�~>�L
b�
�(L!Q�ڐL��n�+ܣV�/�ƀ�E����hu��V��7��`����Щ��?�Z�5�M���������y�X�(br�����iZ˂D]&ĦX�3�Ξ݌�<^���Ja��:w��9�߆��B�cKH\c�_''ܧ���٫�p�����Q�{����H�3� �+#�����%�7[��ΏԜ��D�+X���{����wy��qlL�����}��/� ��ko���[���b�b���.���h06���CA�� ?xY�����8�,���JF�U�X.-�&KZ�:���M��o�c�����p��{�L�#e�&�{������ ���O~�R���qK]�˦��U�B~���̭���/J���@��X0`�؃�mꨩժ�b�9:[#���ɂ��@?��L3�PFJ�$Q�A�,�	�g�Y{튫KT�n��%�|��gK������h�(�cQ(�Q�VRɕd�3�k����hA���=�f��6�Q}�N���� �R�d4,��Y��}��ñ(l������	����8V����r�s��Z���⟘�V?d��ج*�A�#;���B����]�v�����:��6���Ko�iXT��/r$]C�Ց�Q��)`��U,E�zqf`!h2E��w�JpRO6�W�2�9�_�h�	^��?��<��r^Nq~��G`�<��s��{vݸ^�Ё�+O�hzJ��/�9 ���t� cTr�d�1�7)�Ūbm��m��]�1-kQ�M_�'����Ǹ|�Z�j����c��d#��8.f�%�� ����ޚ�(�=+��qW1ŌT�sz���D�'9h7J�R!y�GX���j5��r��jl���Q^���U�\N�'��4d�J~��H�Z��[W� ��wTBP��­p��X��Q��$BnE��]
r��B��r���6�3��9��"�@
���'�uS
FSkJ7'lȑWI����!��D˅�n����Z����^,GQ�^���#U��:Υ�j��^L��&�/�� s �P��S�2+�M�ᠣ��1XH��C��yy2 ��q���y�K�$رӄ��Z�g,��^��Ԣ"rT�7[+�5sz�I�NF��L�a؂0�U��p��ob��ɱ�e׼Lr�ʩ���ƽ�E��*V���Vh��!ʟj�$�*�(|(Ʀ�
�}k���Ҝ]��:>���{��o- O��ϩ �֊ΏY�S�.�
ڂګŪj�k�z]���B�=|��g��� 8Ц��1П�AgP+g�=w�Z�S&����%Nhv��$�/N�-ʀ]1y/��ɉ=����@�2���Jv4�2]l�{��'��blAp�ɍvp��&X5�)
B�T�u�\��SƼ�Em�9 ?_�{��M�.%`�K�� ��Q�Z�Ag����b|���/��6��W�p�{L:Ŕm/k+ʶ)"�t�AxT��b<�/��% ������9zQ��5"��Dm֠�<�&FB��]���
���<�����f8�
�)9;Yq����i0cl�B�/��陰��YE ��^�j��[��U���'Y��
@�~�B!�������¿�����V�_#D1~#V����|+�X�������-� ��Z�R�w�#@8�|�b5N�|I��<g(�rp=�"�A�0,�Y�h	��LK��"��¥cnE����S/M��� ��S�9t`�J��!>�be>��������I+66u"iڜ�hq-��>�����o��Բʦ �)�S����	�L�p�c��=C9 ��= �N��f�Ř�!�1��+��+����b�<c|܃� �d`9���J�f��p��U�=.ZT�R��WS�w���%�/����
�oz��dD��V۔o����~�Պ��8��f���W4�r�<�֍i��\κ�ݏ��������ˮvy�$ ���xЮDy7�}�6+oD�cIHV��֥U�)�4��g9 � Y�ډ@��h2f(�F�5�g�ܣA�J��k�k�	C��h��n�������X�4�p�at�(�H�NU�/AQ��C�\S�՛����R���ć��Zc [+�/��0	��G�\���_���%����g1|�X%	�*�6�ο��eQb�2CZx����W'z��H`Ʀ�F�!����ID�b/����Pc�5���}��}7_��?;p�5�CoOs�J�bh��2�(JTd�)TL��?����yh��-`?��������u.�Di"
�I%��,�*�?�A�H����~�HMctT\�m2��!��r(k"E�
�9�?����[zBw� аb��� m��ʔ
k�r$TR�ev�j�����p���� O]�� ��<�~4�ׂr{�,ҥ�	�젅��o��i]��tP�d��V1�K�M��Z�O樄E��B����4XT�.��g�    �qN����+!�
TCJ=�e-,�'���F�����t���}w��?�}\����P��RTN���^(K��B���fG��-��  ���5���zb;��}�	�7��9��:sV�V�J�����`����)�	�
p.
�������0�z�s��8���B{��>�a��a,�cCH�� �`�I9���Il"/�];��܌�.a��wf��t7�J0ozTd�6Q���Wg삱�{���M�|`��2�-���ˢ&RR�kQ��ԒvbI�X��Y�(�\ޝ6x́5���@q�>96��nR7}�*�#�I�3V�y$�������]��� ��x4c�k���6`k`���5���`2�Z���E�/��&�<�G[?��p�f��Y4[��5�^Χ&���h6;Z���@��f+�w=��YʘD�!z`�� Ά*z*g �<r�mr�x���W�lo��{�`���E��0y��^āEc&�V�#�Ԣ��gto.|g�;����f���� ���$j�4ě��͓��~�!D�p�ſ���/Ӡ��r��=�%I�a��Aǂn��M�bd�r���>g���w7��.G�S9
De��=�����0���)�a�%�Vu/k��zK/qٓ���=����������=�<4c[�����b�&�ΎU%�2�[�*bư��t�k�y�/W����l��F��a��\�����
Sj�����&��F�U4�����?&	�2�7�r@�7^M��'U�ֲ�����)�Sb�����/�s"�9��'�<^�ֻ��cK��*V���b��B�(�_k[f�e��S����[?Xcۚ��E�^�Ѡ�\�j��x���9����������g��v�V"]�+���QJQ`��	�l�Q��;�ϔ�o�ܕŻ���0�,*���U�\f��F!t�߯�j-U?���6w�ߋ�;�����K�7�A��k���[�=\rY�IqFݿ��"$C��ȡw��L��D�^�qܿ�9y��x���_�12J����5�d��m*>˔M���_ƿƣO���p�S�9��=;��K�s�/��~ҙ��q97@�''�?}>�OG��{��7��A��"�9���`3w7O�[�X��ܚ*�ǿE�l��s	��u��T�1�^�ZN�*�ڦZ��M�{�������G׃~�0A��{.��ܤ�:7�b��b�<xǭמ��/.~?�Zu�3Q�$&� ��Mv�S����\B}�)�Z�
ث�=s>�z��{S[W��͋����_��)�l���,2�/*��)/!��������<�I4%0�'	�s�ߗs?s��M=��+$EUnPK�S���Q���#���Eo`����{�'{���2�FțC�����4�E��� �W�@��f���D����;��6��{0�h~euÔ�~�M��%�3��`�VE~yZw�EK��X�$�g�樮��S��w�{���0��zI��݋����t-w�Қ�=M��[���'P���M%+��ŚL�X�Y���I7�.�>v\z=&�n�
쵖7���O�a��SFو���w'��+����_so5���P�gђ��ӄ����'��hT�)�Ж�b.�l��$m�='A~�-���� �I�h{ �"GS՗~�k�|���ҮUhM�����g�5r����־��݈���l5aɋN���L}��Z��y�d��
3��ǃ��;ypΌ���o�g��E�(We���⊟�a�#����Ǽ���!���VkBycs� ���|[;��+3����{����]�6��s0��X� H�ԯdRԊz�K�Ch���)�\�^��k���$�����Y���M�K�l6*�T���D~ƢP;���g^�l�)��5�Ќ*z��*f=O.�T谫d��N��ꕳF��W� �+Ʃ臚eM�3��8f�a�<g��)����չ\p>����V6���1�XZm*��o{lU�F���nm�f��^��g�k��4-tBҐ-6�����JV �I��0l�fͱ�|�!�z�A�[��\m�`{!tx�ɹ�"b�UdEaC��r@c�UTw����x �׆!4�Gl1	��Q�6z�g,*Z,�	�uΖ���7�_�/�߶7=[@7�+vƏ�m8�F�io��b��	Ye�!�Ej�M����Y�e`Y�LF"[.)!̍Cy!����&pv� 1N����ͅ���g�S0	���
�0Cԧ��/-~�[c���K�
����U�ײ�k���Kx�
�"J��*=�@�dX�^��|Y�$�)�lD�_�L�-W���e~>����p��S�bvy����Hh���!�Y�%����jJ䨶8�U�Ba����k�������I|O�Cd �@��!���aOB��6�A5�7�"r�e<#�1F�_l�@�"DQqO�h��L"�ԓW�+�)C�ǹ{���l��~��3|�~{��oo���?�m�n�z�I�S�1�,~_� �椨_�`D���;y�B4fLR��Qr�6��b��-��[�����֦$�)�����_���ѫ�vT�������݅�,�澤� [�T#�t���J/�(�s����Dc�1���K�����Z�p���i�O��_Y���c쁂M�Sl^	��m�Ű%7����uם;m�ޏ@<;���^a �sX]�eЪ�B=�UΪ٦M	^H��oH�˄{&E�Βb�`�5��H}/�cL6�W��rP�M4V�؂ăf-��Q5�"1$�:w6�!���9�t/�� �K%#�&W9͡w�mA���b����]|utC}ǈ��<U,�z D�\�$�To��YB��?�1��/6h�"4�Q��ݺ��BaD���C8��̌��/��Fv����P"���Oɓ��T�U̥�����ѧX
�8�*��4E2+[���͌�́�ɄcΖ�6�)�{?G��jvs&ƬXl���/ ���m=5��K�� ˱/�P������`�<ܓ��T�ao�0�� �1&�\[%���pvZ��Uiͦ`p��m�����O��{��M�{���k�'c/X6�4s�A�h���*��;�0mcs\���]b{� ���{~�G��Omxσ����p}����4��С����
+��A�*�ZC��3�ش�1������W���}��nlX�������4��>���5H^A���F��g��ܥg��^ߎ7�o.UNzD-;��<�VgXG�3Ԏɯ�v��u5����b�^�fE�C��>���o�^��zT-Y��}i�:����2#{�!Z�ZN])��(T+��ѵd�<:p��������x*���RDtX��
�A=��ȯI�ԛ�Y[�o-8
Y������{\
�ex��},� W�ߏ�&!���Z�{3R.�`rO��3��<�[\/�g�o��}D�@+���pڡ�Ħ=��5]�BcO֕%�|�P�-R��"qY*r������CQcdӬ�/(bg5�*2�R�%��'���60}��SP3�XU���Td�~{\�}x}�jS��q6�CK��4|�s{\�Nr�?�.g����"����:o�0����F۱�N�:e�Zյ?	��0˫D䲙�06dдҫ���@QB�XC˦դ���wt��ֳ �<�O����(�s��-���؃�0+,���{�	�9۴���@l��-'��\��/�� �)��oZ�\���]`����Sp�?�+�9�4�C\Bc����*9��u��*�g1����Q��25}�������C��MR?��3+`6~�q*��3M��9��'����c�`[��-�(eS�V�����T�	��4����������?�����_��?���������zʀ�w�,�u�Wg��B�����	�|)�vK4��X�g��h:�JMF��뷲hC/跩�������˰_�Χot
�Yؖ���;��s�ʋ2T=]Q2����ց-��X�rg;�2������bg��4ho�CtA<3�(��YL��    U텸��f�.�@o����u̡��Tk�pU�������&�K���}{P/����#k?��}i���]���#˭Ŗi���p7QX�f�^���Z
z�\U�tU �U�"X�M1�@����(,��p��ݷd�82C��Ԣ�,6�5��DQ�E�:-�![qD2�I����#ݬz�jpcOV�-XR�Z/ªĬ��G�C+3"�9���?�sC.1`�ŀ�4�J���B*W�دl��O�J���g����9;�<�,�0��\���!u���96cT��`ja� E��4D8Y�w��ɴ�����	���@�/��}�Ǳ�qE���Қ��F�t�5���Z�szz�i��[��K��Y���+H<�?�7�P�d�4��#8e�(�hƐwg�j�J�*@��+�zHP{$���k��6��Le���O�?/�~41��� �!5��S��Zd�c���c�]������
�� � �I"<�P��a���R4-�jBt��e�#�E��h�m%��p�/�ᎀ�p��1ءG���W�~�m^(}�$f��K2�v@�dq�
������
�)Ne~�!����ll�BNjK3�q,��}|Ʊ���������HH�JrF)��(�e;�._n��[��o�l�C��C�1�Z�r��y�H;�6UhA��3Oo�uz��:=�p5f�c�Nù�U�z��PkY�ZА��`�[����n���+u�dh��*Av�Q0�-��*����Xn�v��	X��td_0����I�:����,
nb1�.�N˭Ӯ�:�`������*��
up���!���(�8c��c�x,��DMcA���3��R�ժ��i��-aq1���)��d2O�����4(e��YsE8t��n�ԣ�m1�=g���Mg}*p~�ɬg^i�1D�pbvMA�}�B�r�1+�,I�v��K����#�Nz�M����4&156�j����6EUL��d�r�s	[t��ӷ g��p�t�K��B�A)+����0y�Jh�4/x�
����3�1l`P�YV�Dm�%�UĒ��s_GD�q�f��j�OF�?�Z������խ�E����^�Y%Vy����ڂ��O�d�x�mʐŔ+أ������W�V�R�N��t�Hw�"����h��u���D/ij�DYt�|D��{ވ�	
��V>��{���t�j�I����}o�(��g��5���48y�(iAk$����՛?���O��{��/�f�I�g���?M4[�p�9�_
� +蛖M� ,V]8$#�� }f�n�ӗ�`�J�gQ����b�G':����kh��fd1�ű��2fXk�7��h�j�c���t���o�~<6�Mx�~u�+g���v���_��_�����O��x�rkІ��!M���R��j{N�B��TH�� 2̙x��2��ܟx�@\x,��)TcC[\0=4 T�EVŵ��u�n���g�zt�K��C�Y\!�A�IHX��&�=�bR��hl�"'��v����[��U}�d�
�a����
U.=27	��҅B�ͬ�:v���>a�ѥ�|�x�[+�w>��T�MacT)D�:E��.,U��?-��^Y8�q��g��*c�5��Q(G������V��D��w�[�~@���)	*�foTJZv�E�%�y�Ӌ}q�?�]��P 4�kW�`��)��v�Aq�3�934'�����D@�����w�ӕb{�pKm�[�ƻ<c���D�p�Nt��q�x�M�3S��q��D�k >��@����}q�?�]�汾T�dT��uRi���@&B�s��,N����ŉ~+��BLcٮ�A�tR����dm)ʚL�(�����z!�[�$�BFs��{W�!e?AI��Ôz.�%���
�p
g��fFտH�"�C"���Xګ��jT��H���**x��r�"F�1��I��z������/�5�>y=�s���lK
�&��eA��o�5?c~����-��W��K{	~�i?�tW��L�:�
m��(@�; �.�s�[|v��O�O>�ZP�u8r��U��~Kz�zPN���\ҜE��Sz�����M6}���hVƢ#�j,�C����+$i%ߒA�[(a�Ĥ�~/�{{�{ÒA�ga��iYF���7��U �Cgۜ��~/��.�E���Hk]A���Q�I%E����B�Ҋ�3`a&3y0f�C�0v8b�k0F1��mP/��j�d+�&9Lݜ]0v����O�i'ڞ�.���݊W�;�QD���N�Ѐ�pƪ.�8o� �y��1Qh49�07���^"Z��9ߌ��f��W�<��pzڕuƏ�����-[�Q$0P���	�S쿚Q7?��[�%�bF)���i+i̖��^qq�'�ɮ�[<��Χ0cz�3�M1�Ӊ�<cS��WH�=���^fuժ " {�Q%��{i��J]�A�kЧ��S˔�������Aܽ�zN�6�R8�t�s��ݭ��C�ŧ_a���ع�A$��(���V�!뢜�A込j�*F����ٓ���뒭��M��M���^��
k�bDyJ��fw�n�k�р�ڈrFT�Y���	>�s�fL%],��R}h�8�T��WE���${}7�H
�I�dm<�e������R�kF�wc�XA8�5���U��'���4�4�/fA���NAf.�6Ű�Rİ��R-Y�T!���w�t(.<NnrGP?�P�j�!0�Ы�5�f���3ᄝ�5b����������>-.jr�6�����m9���>_��˾lMdUe�����eJ�B��u!^��E������� 9b0pz0=hS�D���9�u�2�d�䟱 F��EѲ��
�����r}2����V#�����!�K�N'�YTa��P�-j����3~�_�tW9y�c��)%������B?ٚdc����o//o��i���z��1���u��H�^`Dz{��0!����#%� �A>"ȝ�(�B��%�r���D-���V7�+P�n�p��ou��������:E�	=���VD�q%�}��|�`{��T\��{��H>ݪ~"���|&R�5�r�ΉTJ�#y���#���[^�ǁO���G���+�S���.TXp"�Dx	Z4����$��3�9H�@�z�>I�N: �C��5�����,ff1�`1|��؀���^�_2ښm"����65����b&����8��/�z��F+���ւN�!��R�Ѷ���jNh����Q-sq�!ךp
na��^N�`�Y���@��R��y�9ҀM�� 7��l�d�O��
Z���@R�h��<߈$��܁s��_��v�ц���<w��.�^���(����%�-k��J�Z�P(�sQ5r�����SF{���E���)�PY��4 ߮�����7:9�8�kP��[-�]7�t��J�}�9��ʸ����XZB'TMN�q�@�0�k嘕�3�g��s�<�^|4[�������j\U�j6J�^��{.��[|[��v�U�W�������!9�&9e5J�Da�C�
D��o�yȉ"�1�U�H���yH��Pϰ�e�*�b�-tb�s�k�jI^�6b<9����~�O�P໼�J�i���{���f9���C(��J�-��U"ym���e�{�P�a>���0'��2�@��6�ӆ*k)nQ�!�/����&�m��̀Pr�*�++υ`�Z�t���\8������Ѷ	��5v��!ő� Ϻ0#r�A�`_��qs�t�5aK���a��^��} 
YZ׃E����EE�5��f?��Š�/��7�l���~��ե�ұC+ck��Fv�c��Q���KKL ��\r�~Jx��`�~���FSؾ���W�`��k���n���^�5��E�@
D
<V���
����"xИ�o��'?��y��#̊YY{[%`���}�$
�Q
ۃR%e��&�P�"�OR�����Q9�x���j���Yq�	�*��V���M2�������hȳn��x.�J�lWV�����FY�;������ۓ/�v���ͣm�^��D���    �c�$�#,�mh_ؐ@o��A�^��G�%�(�R�g�{Z"Z.Eδd�R�t�������Q?�a�Q�����2௮����)AޟjM�]I3����vA���f¸B+����+v
K9
_j�D��9!#�P4�,�V��Ԕ�$�Yȅ�k�E9��������!�Z9E��ѷ��}��+�~y�Q\{�����[ָ#�e�95��Lw��O�jk�^��yP}ST��c!�_l��$E0��%�=�܈Z�Z�T�g3.�+�kFԜx����G���f�3�Y7XggW[������-��SwoM�&3�es�.�,�\.��L+G�xQ�3Q��W�Z�z	�ݠ\	Q[zX�;��m�\2�~�'ws�M�TĈ��B��f��$AQy�惨���R1�x�ś�b���p����_��Y^z[X�����.�w���`)�c�C,W�0U�#,(~���ʷ�j.��� �
�8_���#�������<��xӷT�t� ���=�/^�M�0�c�W���/�u>�4 oN����vw������op�\��T�(��J�XoE���L#�9�)�e
�L!d�1�$�-:�u�Ő��U*ɶ4fe�\����8�/S����(ؑxV`���B"�ḺD�\�0�)t��Cb����LJ妄l�\�̖�qn"z�E�ʘ�s��~;���)`@�˪�>�F��EGamEa█N�#���:��N����)ߵ�K�M�͉f�ȿ7zk�L��􈥚s�����SPV;�'u)rK�.���� ��L�|sq�~��Na�! u
���x�����6D�\$�h<dR�L���۹Pa.T��B�'w����T����C	�� ��US�8b��\�p[?*ܮPAw�i2J����F ��,Ń�N�c��ʳE�l����=e{8U
2�~�p����J!5�������
[�T��8�`��La�1(e
��nl����)
���#���$\}�����Sk�U��mBf��тYy����������6xp�	��#j9+G�`qiD�{%9L��VWY�L��R���q,r�*9z��j<�FG��/�y�>~W
�S9�y�c�"�{��Ѣ��L�	��BB����B�H{%ʣ���z��ݏ�y�¸��^�3�:���O)8`V(,�tn"�Z�$��È�)3I�I�.I������(�H�7�� jpŨV魍8���$������������rʅй���MDǱppIDK���e5���ݻ��%m'-}�CRz�k���Z$�B��+����kY���#6�<@M��!~��=��£ԝo�dS�t\Ĩ��R+��tx���vc&�^��ݰ�mY��V�O������ ���v����.B>��
V�֊$�iFy`�W�s������n4܊HN/N��Wšw�R��}����m���y�]Xwm���t;Vova�w�;�M�@+�ą�ȳ�C�Ȧ�ls���c��vL�/��6�u� xeZ�]��듢�:ڀ̲eHjİ���e�Q�p�``n��0�6�Z廆�$!;� ,�ȳS�H2�h67HF���V���_�a<��?��HGMa�k�;Ã��!��`�j����ikg�� Z�̢ԗ�����ZN�~��R�������,9�z�◫@�.�{ߙ�k'�l�:�eio�Y�����J���y����o�ч�	�qM���H~��o]�n ���S�i��~
�>ӂ��-��D�n:$��os�jNUM9U��|W���Ί�5�� ���ϩ�Xdic6�ϩ�}����g҅��c7n�P2H:�+��.�h��0��#��s�j�?�T_�Ue�˧c��Q�-@�+Q(<%�����3��� rU*���+�\kLoM��7����5Z�*(��9W5�&��r��'�Ll*+���m�ѫ�Z�F��$�s�j�U=�\��;���G���}��ޱˢ�2X�WF�x�3�&rL<W�J�:��9W���ϣ��*�F��Y�sUs�j_��UQt|ٚU
�"NѮ�� ه���I�����p[��ߓ�@TKi��5L�i���s�>7�&C�$�[�i�#3�g����~�mT)#45��h
�N1 ��J��T�6x�z�x��4�o��V�-b�1�i��t���W'��˛�����_��W�?�9�5
K��%����	?����Z:���j%��=� �mE�?t����|�E8������h���d�	ZC���SV҈��4�~����@aM�奷u_4k��\�͝*M�G���B1����w�P���5�l"^�8`x0�'ΐ?8�K� ��ht?<E���o�ܨ���%=v�`�IY��Ko��?Ϡ?Lл���v���TO�҄����!4a����lK�fi�ނ�������~�pG� ����[����g�22m�b&��2�fl~Dm��A;ŷ�i��g� �,�6��{uc<H�J}��Wu���$����n{��L��g���Y\� ĕe7 �Dُ=��k'�o�y��P��~��u�-e.ӟD�����ff#�V}AT��&0T8y�m��T!e�JQpd����-�(��ÿ�Ȕ��B>0'���i]j�>��t���Ri!��ѩj�]X3���g���;����L��P+t}�>jc2��:��HX�MU��?��#q��;����G@�ԉ|z�^+����1[�:�U�'�d�IN�����R7�f|�N�����*\~���I(�LȔ#��.%5׀4V�n��1�@�*;ĨS����x(�K���B��~�}������xK�H�5k(�FhG�ZU��9�����i���Ox���P����:��SC�R�+��9�����3���4���
�3�;v��1�C�@��]�'�@P>�g�5�Uy��L~ǡ �u�[���bw*�_'�v%��J���S𫐤Ֆb��+2H~�D##�Qc(~N��P�>�
�����09��m͢%O��h�*���m�YS��3�;]cz;s��8�}��퇗V��z� �*Q�m������hw���kv�^�Ƈi�::���"K�-(N�Ql-�^S����k%��qĳ�N�C���TF���;&z��C�9���-��*�W���Sn�gs�w�{[��iԽ��-� �O���S��A�6M8,WQD�XV�ܲ��n��s�w� _��� �Gn3��OW����9D�tɓ��@>1@r�h�(EnU�m�w�k^����k����)�5�w�<OP��J�#^�(@���@�Hi�ּ�<I�3i��k2b�JY$k�:
m�Q�UAѿ�f�����Ś�]�L_�y�������;���{!�҆<�ւ�(�-��`L�'��u��0��'yLZ����!
mK`[��	C�������WeLRt�V�us����u�}���2�,A3����]�k������ϭ^�$v��k���6�g�-�"�TRQ�J~�B��mS�j5yu�V�uɫ�������z��5k�E�<X6�I�@P1ָ�C.��4+ҳ�o*�U߈L��.߭��!.�e+G9{���������y�2ڿz~����+�w/_��_�Ǌ��u���v��iG<�����QZ��O�6��t��1ʚ�PƠ��*�:\q���`����~���y�:�L(�D�Ea�*[˲l��$�� ���H���e�3!I�Ahc�7�駳����V1�9����Zګ�O��r�øsqϚ���f��jt�č}�Z�����VF)��mv�iuo���X�r�����֊
E��{P�(b�;k8L��6Ҋeײ�� �
L:�>��?h|i1�h�8���?�|���!OY��'������W�~�������2`O�a6����a6�9QF/�<��l���e�Ֆ(E��p���v2+�6�F[}*#N��=�Z�qp$j�P;��p���H�q(�P�*�P�x���C�Eٜ��o���.V������9}��Ň�g�8l�0�l�a�<6 �f �	  ���yH_�G�ɶVg��l�Ru�=�ت8h�`C ��J�e��f��~��z�4�OߘE{��_?]�Zj�7W�]��3���T��;"���/�φ���o	��{?�-�J;&E�"q�nRq�ME�Q��������d�;r���';�Y� /ε�8V3\%ᐠT)�2AW�k���W��NwDk,���uL����>4@�W�ߠ6�&��\4�r+v��#��Pcq������^XE�~P���V�*�H�2��3�S�tɗJ�2�3��.�g�q�l
�)���-�.2.�+����%e	Q1ڤSH��b�"��|�����?c��w��+�0��h!)k `=m�,��^���Cxβ]|�ӒQ\ƿ�pe�I��C�R̩�����a��E`�`ˏ�_�|_ԓ/�75�+��X�$�ə痒k$���E�B�����V�T+���nKT��h���G}	�`�6򆦱�Z��������[���z6��NH�)�H� �mO6F���V�N�5M2��C�"��Zr�{��vY�Q�P鴠��1���0�՗K`#���jY�uK��/y����\[꼬)�\�u������˗����u�5+�tBJ>���	m�A���X��9�b�hK4�fr�\wD��v��%��l갇<kv��a��R,��ޓ�ş��JTo�$���V��W��X�YW'
�WV��X�;�e%�[�C��g���8lW�t���/��*�\ )�������V�6����g<Z�D���S�G�Y}��uƇ���+��_l�u��}��NWBǾ�3���Y� ���i����ɓ���z���P�k"�Q�D�	�
��
2�h �C����Ě����Pjdy�`�Ń���-��KT��,�j��΀g-����4�_�Q=� �p1G�-�y:�6�cw�ERd��#�#V
	D����fk!ieF��k�HRr>ɬ(~b9	��x���z��nI���� ��FXs��k(�������Z���&r�J�VJ$�@ +���,c:l�:a! ����X%��&K�K�7z}���[Ǎ�����^_"ۨ�v��j�]#{{;FU�)V�L�u�$dcͭbv#z�;ef��sv�ggV��Pe�hB����}|ק��W)�y���t�7ZQa.Ț{�LڤH@m��%��*(}}�q�sn	�~�i�z@QI�-�k����g���rl�����H{Ӊ[��ͧ��6U�.kL>�맑�wՎ���OQ/�rF��	2W��,zt�'O{�X�4����E$�U�M�ҥD+E��%/T-hM���oM�+"�[ޘ��Mӟo
.{P�S�d�f���T��~�cU�D0y�W���k5`j��5J�ŏ_<{�������*Zb�]�[��SE/tD���������>?���D�w�C����/^���m���y���.�ץ���ri��'�W<)�_��������h+��p���j�BΥ�s9x*�,��$�;�(�{��(�[n�2"pτ��$�G�2�r�Ơ*���2$"GM�M�^��X�Lt1r��<i�|&�<�r����y��_��O����:&l���!����R�E�����&|�F(b CW���ư_<����?Un��C���$�`���.J�������z������[���հj��CQlL SJj�9y������5��5&?�Z��Td���!=p�+u�?δf�*
Yt��,��F�0�\|�c4-|�hي�3��9эQ�V��-9��O�#��;�;�f���K�����ɥw�9���n&�0����"��E62�)�q��as;E�O6�e�{��֛N���!bd��1��	C� 2��R2�m*H~��L��c���Z�G��Q6��]�R�2�C��GN}����ݺ�0�u�w1�� "1�ߛ�� EyA'�h��仿>��1�u���g������h����4H�G����_'߿:{���>�YKX���.;��a5��-��8�ˈ�Ԥ_���������k�'R�"�b�ӿ����n	w ���o;�����yy�ߝ<��_V��/Vy~���;�6������e|��j��Z6Y���}�.�*��7K���� ��+�4_`O��x�W��J�5�y���]��KZ�}���/��m-v�����a-�Iֶ�,HЀ�%F��q����%�p����L<{�Uὦpe�3��ū�/_P��L�s�/��_�l�x~v~���b4�,�[�rǳ�������j{:�r��"�'����scĎ�	��_g��W>�t)|V�����b�K��X�E��yea�j�-��\�6Wwl-�=Td�����>��I~]PE�U���eC.m�E,cC��&E$�r����((��e�x( �^��o>4�{ɵ'�S}��Zo�S�a���'_�����m��0�������/�_6����ݑ�l�!3񧠸�șNM<gu����8>>��7��      �      x�͓YkAǟg?žKU}�<yq4������ݙ��E����U����j�����8֢9y�X=��%#�>�d�P��Q�,�,�F�!u:��X�O��ͦy�6�o��7X1�é,����e�3`t��HE\���V��;�A�����A� �l�R�+�	�*�U/��� �#W61q8��t�t�Z��Z�x5�v�+1C�K;�6�q8+��vH�f����R�X�c�A^?-��x�+mڏ���L(!���윫��ƢJ�T�w��8��C��v=��r��xzt��I� �!�A�g+FT�'��W<�)j�v������a�Y���8�� �IS���Y�	�����#���&U���5C$$�����M�rI��E9���~i���i�O�3:��p�������?��m�Vy��L�X%��XHR�5p��N�Puڷ����TmĔ���t?��Mgl^��g�M�I�_O:|P=�P�:���f0�9�v� Rv�
Q}���nW��g�Y[      �   l  x�Ւ;k[A��_q{3��ٝǪ�!E�E���}�R$��D$��g"�4�)΁�9g���Q<$�B���j��5�h���Ќ�E�2/�L$w�����0�_۴�]����m)�qr��Z����6������"���h"1e��Eo
]�Sf
̗=��G�� (���R��ES��y��P�j.�˥��;��7���\1hu���B��A�=B�R���5ۍ��D����]��s=�yگϧ�p=�������:Dt!�Bw��I����EV���]�P��v0�R�ُ2� �?�:`Lݸh�o`aF�� �z���}^�����~O�tj��p\��+�O�t�]��ퟖ��l6�?��٣      �   `  x���=o1�gݯ���!~��<5C;I��Y���:=�Z�u?~}u�L�)�% >���-P��6�L��L"9P�jȒ�E����ֺ���������y��G=�����c���纙��Abq�C���˪>�����x��q|(�n9�7�]���|J�K=W�Z�hf���#�)r1���Yk7M����8e��Fh9V��<d���+%u��`�6p%0���\�B�,(�6	8D	�� �� ��V�4!7�2�+Yi�ݲ݈E�O�a)���g�� �kDy	kk�����o��h-S����T��L�2��1e-�U�D��_y%�H�3^��B��	!9�۷"�(�����+%��      �   �  x���;�0E��V�>h����Z�ȶ���.~�4�&.l#tu|�KWs��a�
��$��5��<�\>aU<�M��5w�F�ǯs~�~,�-�<;o-2�������d�~�[�����3����0K�~;��Դ�l��pH��G�2U�7:!�9�3A)���͜��B���0.Q9, �uͶ�CtR�[�@�ڭu�,}����*�etf�f w��I�zGWw�IšyΣqj�T�c/:n�e�-DI�h��C���6@�Kw������L�y��:�w�734�ϥc>�wD��7�+�g���#�G�~�nZ�-���0�
^�z�1z����ݝ���/C_��
V�S-y�aV�G����6-�w�v���'�(��O2���s�~�=�����      �   4  x�Œ�n1���Sx/x)��nvt	:d�B���<�A4�_�d��Zā��I�µb
 �F`�+�� u�Pb�|�0:a:]0/�3*� ?B��������tj������]/G���귭��v��SS�^�BQe�h	r�6��\E�E�=���,�3b�;�׏�o��b��,N����+7�l)١� ���E��d�M<4�ը�1�ъpA�ULh�=m���A
�Z��"�� v�5�����EČ�����"4c&K��.ۨ�������z��ث��5B��6�D��q�8�J��LY0������:�L��      �      x������ � �      �   �   x�e�11��+董ر�����8$W��
(�=�FZ���-VFf��@)�gMв)`�d8����7���=\�g���bJA�G߶�?%H3| <��DfA���[��OU��*���%�fr!	Eq���5.���|�<���R�����,_�0�      �   �  x���Mo7���_�{1�p8�� ��������Zv�5�$F�}g��E$�6A�Ő�����uQa�3�&�,�A��:�s�0U	�7�EU!eFp��&S�ajK�x��>L������������>]���0-���o��������u&� hß;�9�>m�j�	�hI�H��R��	]�GOYB a���@S1�Hrp
y4�DIc�3��0Ck��.2�R$�Hz��5M]W�b�S��zf(4���6�������������g��ax�����Ӂ�1KM�%���@�tvet	B�'�e0I��:�:�B�4���k�? �x�u�L��7Dh�!ߋ���Pĉ���vR�E�7_�G�ݫ����ر@%1�tB��2Uv��ȗ=_m_�P�4#�N6c����� �������<h�,�}u8j�3�" ��Ȑ��g_�/�~���`-��O����� ��'7;��lT�H�Kwu`�i���5uI�
wG2Jz|�Qpp���V-��3ҚӃ���%���e����y�/l��!�^�t��+�p��inC&/`9?4"Y{�o�����?���v������^6)��~���?x�=����ʷ׭�c��|�ZY�{ݕw�迯�g��Z�(��p=� �bl5@Mj֒c(a0ص&���$����^����^?_���^����r;-�7����*Ύ6�Q���<a�w��6����X
d�|o.�QK|������7.37m�2���?���z�1f%���r�������R�o�6���ɽ�Q7�����GOG^0���2ob���|{�/ks���'�r�����h�1P�Z��w�$���-O���/c�t��Τ7������6^����7�)+����y�9;;�e��      �   s  x��Y�n�}}����tuW��d$Y$0`;�}�� �DI$I��]��szLۼ��CBYA5Tw��:�T��(c6NHf#��(�fuj:9%�����y����d���r���;.���1���Y���JH/H��FH\�\�晴���i�C�6�d�Hֲ`��*~�*Zc38K��`�I	v�D4�El��RX�����c��x{]��ˋ��q/��b1��Ǔ�o������ϟ������h�����w\�����[7����?���z��|���]��>�j���dD��,�	�Ǌ`�a#E�&gKr�<g��g���jY�mYy5_��pp����vf�L��?-<p����B� ��k"TD��r%e[
�����g�����аZ��F����Y��M�R�f-`Qe#�aC���V��r�yUn�o��H9��vQ���·)�9&(l�0e�r�rd�}Ԍ���։,(H'-��-z�
y#�&�T����/���nP�!��8�^yRm��f�3�F��tJ~�7�� ���)�F��{QV��Y4/[q�2�<<��z�����r��y-�����*���$�N
êݿ�������|Y7���t��HYe+8� �$-L�P$L>~J�_���! �O�8��ǁxԒ��f+"N�i2RW��"��8�v!�uQ��p�ZT0�ӻ��u竝�0m���H��)�?@���oj�-��W�����gxj�Q��O��#�@N�����j��-�)~#Kc��lp ~3�C�����t���zJ"�Z��TDh�S\,Y��1X��yB��@�B���3F܈pZ.X�������!�������;���lD�#I�R�Z{I� ���_�6�����q��+n5��K����qes>�ZM�q�6E�ٌ��x�����p���)�I�`�8#K�QA�\�!�j��6<֔�;�g7�v9W��n��̨Q�dŏ\t��]��6���D�g�SIT��.��Uld�A-�<�Y]��zmY�I/�qU�S꼏�V��Ii�﷫�6�ӥ���F�����0�V)��
�sL�� DIŹ&U�5L��ň��e:���A9�� 20�X��֏�D�5��ہ�Q^M�E��@��䢪���c�[����*���E���"��ӷ�ܦ�Gg��0-�C_�Vh��.n8�e��<���3��� <���������xG�!���؄�+C�t��LR�r��l:ZO��=K����,���Н�0;Z��C�1�[4][���d�רB�2K?�����r~q��z[t������En�;��w�vʩ�'�Mk߸6�u����N�]��"6I����x=�;}�������ƀ;C��������A��b��Q�Gm��"J`�[UT��m0[NE����}�(j@���p��b|jy������jWT-��̄��@�O9��d;'@�3x����
�P��b���4̯x|�gd,�m	���>@G�|9%L���v�#[�MU�!(X�g/B䮋���2Dm6�	F�e���ٖK%?�iB�!Y�}�b6�ե�
�[��CF���Gk�5W�d�ex��ի�/W���)-43�>�{��@4M���N����ݍ�u�3���M��{�jt���V:�Y`Xq��R$�DmX.W��Vq��{M86���(1�J�5b���!v'��`�������TPVӄ�t�������)�������U��@����Hw�&�~X�xz��Ä
���Ƥ�{�)u_�k�qR4��f�R�g��_L;M�Q[�H+� o-��ʌj^;��D�P{´7�[~B�`R���b2���z�sHس�h�<|�	O�(�ï�r>} 6�W�|���b�7S�?k��ݏ3�k�n����|�mh��);,k������El�Q�H,s4i����eab�MN7�p>�D��ʡ{�0��O/���9�NFS�"�s�ED+q@*%HZ�a�<�Y�Q�쏠�|Jo#=T�of��%����v�W����#s�݅��c@p��\��KM?X�б�Ep0��k/U�r�^��,� �y\��S�����|��;#��	��}�q��?��9���C�՚ľ	i�Rp:������ �!�      �   �  x��V����ɯ�|�n4���n�hS' �H�Dix��<���v�U��7��������q��H��
��s� &8�BQ\�B�lEP)�1���4�k~.������� � >�`O���;�f�v���ؼr�_��9��C���Dy Q��Ѐ�F��<om�&�aL�U�֦���⊁��!��*�dǒE*���"���R&��x��|����:K�{Y�˝�5�v^�9@
��{�P��pCB�3*��bC�� ��N�5^U��DC�����(�Q���C\i�s�k���G�G�+	z�2X��/��Hg��Ve�]a.�%�AF�x��hȮ1ߢ1�Jp����Y��3s��Togc�!q@$Ƿ>� 12HV6E���aQl������wVg^Q~��n���vkt�%Y��J�(b�,�3�4�ti���bMI��+X���%^�|.r��r��P)YU�]��,k�w6:hN���_�/�%�#����#Wa���ש���������d�DB�B吅S��5`��b�f<�c>ϯc��e�1t��q���#�+��������4>:�\��ʘ���md�+jO�MG�^a����txĎ�k�`{n�[G����!�b�F$O�Z��2��D����W�J���Tq?�<��aq�p>Jֿd���D(Ie)Y$�5?��1<}�;t���:�6Ɋ�q�-ux-�s��^r��c�RXz�����nB��fW�]XN˼|噝C8��
GO({���;-��v��0]���
8M�5A%L:��dorI����(s��v�BH����t�׫M?�p��y��Vr�1e�-�X ��B�,��
]�_�)o��TS�:c �N1O�����z])����?��˗.I��2D/�8AeӥY�6�Ő\3qa��ėt9\aU/��Kf]N.�2&\���Y_]Rct����e:��*��=P4w��"�y������"Uﰽ�LŪHo����|�������3������?�������_?��|���o�����Z�<�0���֊3ii��ů���[p&�*���)t�en	]�oR���	�UE�X3�2
g�F�!��]�::U�de��E��s�7�\.�7�J�����55� B�$"�*Z'
�u��
�� �%�u^+���׉݁��mv���E���,�m(�Jd5����8-i�<�I.!v���5�i�,ǵ�
�\�D?��;.�ɢ�C��xg�]l�8$��B�[Sݢ!w7�[(�d��5;��m%��7^�{�A��̖���F��E\"[�����xD2uY3`����v��]�ףfU(#���腪�9�C0Jj�iʵ�i�\/wx��N�/M��ZH�i̵=��6>�]ńy��ee]|�-�;_�A��M�tr�2O$u���e�l�?^�˔�c�Ŏ�^'�5�[ϔ%��})�?r�9�-�)Z�1����%L�̭���ld��*oT�
�5��wm���!EP      �   �   x�Տ1ND1D��S�#َc;��l�DZV�v��'��+ M13zŌ�̮�����A�@:ȉ�E`2��.���Bmv���<��RV7�11r\��MO�/DK{u�,ϋ}=_��}Tt@�k�~\dޛ{O��7���/_���=��B;���d_�Ɗ����Rʆ>p�!3>>x�5kT�����xڷm�-�k-      �   �  x���Knc9E��*zޠ!�O/�VPQ��/��� ��2lO2/y����ypj�dbP�����|`C�V���E��xv5�����џ��>�V� ����=<�����Y���_t?�9a����0%��?��K����ÿ�����Wdۍ�wB�6�[d�d&e�آ��Ꮁ l!�r��� m����z���tg�Jp��b��}�?������$o���z��oV��1|f�>���FLr�&mq��>���CAm=�X�\�w�~g}��:��Y�<>l��+t<��}�l�<*[�Q�thj�:���y6�&�����}GU�P�[99v �	ק:�@ѫϫ!�HP��ExF�Wl��]�]	w��6Xu�LX+��eF���'�S����إF��a��qV�^�q��q�;�g�����b	����$Fzb�b��
�J�X���)S���ݺA�iR!�4�	'��*��b�Æ9���[��,�9M�^
���D����?ǈ�{�9n��x�Wl��]�]	'�5�:Y
��?�j`{����3N^LϮ��h���{��u��YU1��GyD����8��* �Q�g����C�#����UU]�,YWB5q]p�(�h�W]5�fC}�<�M��a뉣;��VE�U^��8$��sɖ�mR�eY�>K����>Gc
i���l�E���*������j��      �   �   x�M��j1�k�S�ZdI�ϵ9I��T������?1Iq�a���o�&7M 	�}B�4�N��U�,�u:G�N F�U��CN�p3/o�Ox}��Bj�+��V�W��;�_�oej��2�G��Z9?p���r�Fv�U�!�A`=�eJm����'�ۅbG���������m?>6\      �   �  x���=��8���SL�`A�?�,�H�t�#,+�k=Nl���#�J,�0�����u-�Pn��|��l� ������]k/���ǀ�
8d�������~��F_�k�7�7ۓ��1G5�ւ��b�b�n��KE�E��:������Lo٭1�̿��ZD�>[���kI��4�h����.2�����D;FAĬ���|��*E< ��@�a06���;�ъ|icQ��\��(G��^��.z�Z�@j�; |�n���k�r�Ś��"}b��,�E������}���r/d&K���JoaQ��gD��g���=����$u|+�tQ�����2���k��y�X�s���[E�.��԰i�h�+w�II���u�z ��!��D��M��� �ǰ�f[��3Xe�N*�Ӌ�d=f֘c��#��F�_Ql��Ԋ��B��a�P���t.�M툓�k>�uNXuX߄����SP%5}.���� ��X:��\�m�=���p8m�{�w�Cޚ����8�~��^Q�^�{��T�<�[���װo�o�O".?����@�N
��?,�Z���K��M�;9rp�3��up��sP��VG�d�$�[���=�DM[�=,�9�Zr��8����!=C?��������A79      �   K  x���Kn�0���4��C�M�,�@1h�9I'�Y̍��?He�-�t.4b�h"��N�֩6�i����Gz�O����]:@Y���
%F6�Y~�y�2.$�h?�S*˜:��^��;l�
*�� ��+\��f);��bec���(��];s��#��%�:�|ʁ�$��2q�P6��s��Z�	O�~��'ޥ�
�y��d� ��*yU_���^R[���<rT�@)����e��-��0�4����.�7`4a�$;��0��|Oea���H�ڭ����a��D���$�}|�>��;�qV������/�/9_��fz�����N��כ      �     x��W˒�6<c�B�T�`ǉNR^W����b/�h%o��3���Iѻ�-�"�EP>��=3�Mc.�2+��Y�t����mU\��p�u�k�n�պ��m��>v}�"��s���M�+-�lm��x�Z��򰻩B��VJ�|�}��S9	x�Z	j��T<�J���r�O�z,Z�1�"��(�x'�ҕDKH$��͛@҇������`�9/����zĤ��K�(ѻ&S�|��9m�4-���������&���o��m����W"��a�\GĀ�Z*?Ly���:�Z�@f�E�&�Wc)�"���R�eʙd��Z06�h�������x��x_��z����gA�z�_i�J��V�~k ��X/�ѥi�ZE�^�Zr����($��$2�:z�ISv�)��� 7z�F�05_h��k�<^r3�.��sQ�%��&+ȧ���Ҵm�eܿ��]�nV90��|�ͥx4\2d��S?�6'��Y���04�.�Pq*E6�Μr"E�0a��dy�#S�����z;b�CΜ(�Ig�y6�����^&ѥy1X��e�,JS
��ti�FN��`�CcO�r��O��� �<c�#�n�����2:Ѕ`.��[���LY��<ٔe��ʒ���B�TE��������ƴ�A�;�"1��#VRv�0A����ݮ߯��O��������b�|g�ӊ	�ܰ�����eti��[Ψ��Т�\sH&c/վ�V���8����\>���+���d����._Y�&�J���K]�,��t0�e-�z��vw�y{N�Ő�0�;t]����1|��c��bS��KS1�t��w��x@���f@�v�$��33�Tu���Y+�"c)�퉙�mG�*�}��qe|��d�\��2��,�Qtq�^s��X$[Az4F:�˰��;�c_�Zv��(=�����g���7,��Bv��
��UJFm<������~;~~���}���/�C�w������#$�7,���}K����k�&ѥyy�������<      �   _	  x���9�$;���S�?P�"�-�2���a>ec��*�
ݵ(�o�yVZ�O����YG�{��vo+J�=ɳl�S=�2�"��I'̬n�k�����Y%�gQa,ۡ�l�f���3E�Б��Z����hQB,��ٻŹMA�ҿ����/��R��ȟ�{��؆-V���YCm��\�n�����
Œ/C�ХA�jSm�m��"�%l�|r�:�Cɽղg�]����)��Y�z+��y���_Q��f�PJ�q�����K��C/I��C�IB��3{-=�9�VX1��ovr���^�K\�U��-��4+�[��2m�dm.��������Fټ�<,��d�8��"��.^�f�k�]w7�l�Zh |\T��BZ%��k��U���_�Jɟ��u��5�=Aߘ�BB��Z��������>�Fŧ�0<���l+�����J����Eٞ-���jZ����;�K�Z�Oź]���e޾�끶�9b�v��;���i�Bt����)#�r�Z�ɽBL��������ر�Y��+�oKo�Wuɒn�n�6mX���PWV�W�2F^��yFiC흊���`�>�/跖?%n�� ������9I+���U����U5��!����i��Ecr���a�᫥��z����i�HM)��yM��r�P�P�E^�ٌ��}���N�*�x�x��Z�^\���#z� T�����q�@�8J�)�062��(�V���0"�2Jp[9Թ�Z��c%���b��bQx��q��z���>��C1�!�u�NP����z�ڐ��㳑
K�k�:_v��<�b�r�[�A+KӜj�}ԯ*�K<Ե�����n����J����_9������M��ׂ�(h��H�?z}|�[�_
kE���-53A��w�kyU�Gܚ��;:�˽�~]���m����3d��[B�t�k~--+hhvN��n��D�Jť]�x>bT[���X�;�WA�4��8�uJ����v�@4P�գ9=;����!�U�P��G�b��SB*��0 j�b��'���[�._����\@}>=N�n��!L�[T��p�eA��ъ���9i*�[��'���_:�o{|Gb�V��V��^��gR� @�I�T�>k�oJ��h�E����X�?�ؔ?8��r��88���vZ ���b�+����C��O�c�5��G�m�1���Fy�+�3� #�.�vn<#(HԌy���=/�A5vรF�B�⣳͈d���8髡��	���*�'�͙x�'�9m���;����-Qj�Hb� D2������媛���� "���0��b'>�c���J
��vL�\+ǂ���Hʐu7��[�ɋp�Լ��EZj��i1v��F����ߨo�o+/����q� v�b�TP�*�V8�{;is��T_��DP��	~;�-k�i�st>)��7l2����@O��a���+VE((��P�b�a�����s��'�k`p�d���9�(���B��M������=A�Y}>�T4�sc+�Ɣ|��I�I��V�_�����S��3�,zK�a +���U��;%E���\��u9�E�'֒I�pe�؉Lp]J�`�@�"��,H�/KW_$��]�N�e�T�g����@n�4�h0�E|k�_�E��'.5D�U����=�̎�y�*7�$FZ�g7C��Z@Mk��<�{g�����\�pÈ`�hC2�~���r�bKl�~�1^r�;�q���åxl̂��H�^�'Йy�.F�m`p�F~�����^y�ش|Pq��#��mM�ɁMԈص���mt�Wr��C�YĠD�X��N�F�\�r@/<���1@�"��'ff�zf���(Wݘx�Vl�-��"wa�[��;oj�Ypi&T�M�<7	E�`0l�1���y���l���%�����Ё����~Yq�+�����<�C2z�N�����Fǉi�׃��˝`��X�z>y4f�P��0�I-�<�����yVZ�8D�o*VP�/E�����()8�ؑ�S����k2{7Xd��D��� �O��=ׯ	��VqQK�"H�v��wrkM�g&e,Δf�u�����M��I�La���f�IZ�b�(h���'�\�zׇ�����r'�)w���Ǆ�=�.��D���5b�R;�����TL��/��g�ά:�P���M �^˂�錢�@�Ν�����j*��1�3��s��9H��3����_]�A��g��k��Z�w���A�'V�� O�GL�$��(�0&�t��ʮH�2] w�8 �UY�r�|k��E�=\K�|
2�Ȣ��p����7����*����C�+Ǔ�>0�0�^O ��H�)��?;��;�Okh������z���P�sL�IL2����o{����"
���y�~����?��A�      �     x���=k1���W�^$��V������g���C���.P������)��j'�����U1��0�!`P�56����w��bzBN�/s�b
y8�aQ���ڦ�:���/���9m}���[���b���p��Hm9dS�z?�F=�+$/$��� �*-O1n�G&i�w�����l�XKG1�^�_��v�x�_2N+�!��q:���|�=d����i����FM�p�$��0�Q&jD}<��q�W�s�      �      x��\ߎ�7n�N�����K��,J��.�wl�ݷ���3q�E���5r1H�сD�CQ�ݘ���$�:Fl�C\9�ٵ��?�y�Ia�1B�09Őz��8-�I��w�����_�?�秿<��O9�"�����_K�k�I�F�����_u�K�C��AD4�f1G��90����~Z!�h"!sĪ�1�]s�Vcu�}4���Oϟ���h�Z�j�10�Q�Plkj�3h��׏��]8�:f��d�jd�(��Mv��0�� ����11�TC�k%DX�A�.!S�F�#Syօ�ʵI�7�?9���Dm��Ǝ����Qt�fY�i��8���E�V+YH�û����w�G�Y�3S0��E��)�Bi��(Gۏ"���8*ј9�B�+#�[Ĳ;�J�:d�/���B�I��v(3a�&�~�bC3�3�Mk���} u� ����� 
�k����6#p�vxt�C��
��P8pIXM�
�-���7���.]H�u��-X����+L��<͘j�HH�M�A�̜@w�a��$��1r�@��o)n1pgh"j�Dy��S��J��!HwȩTԑ.�D*k3Y6wF-�X��잟�ߩ{�P/u���ɓҰ�U��#��<釉����1��`�VA��Xat�նQM��)G%�޳�%A��%ޔ�{M�]
ׇ ]H�H�lF0�@T�Zb�2�Iv�:㡴�
�J|�Nu,�V�P+>WIA�ڔPAu�D�dg��;�$ @@��{wi>ˇ��!n�c�,֤��qxb8���ud�1]`�ZӱP�F�K�" 0���pȼ|X��P���k�e@�V�kF�U�_r���P�����)����e'x���J�+vP��{u%�·5_p�"ܡ�C]�)B��C�zv#	W\U�
�b3�;g�P8~�/n�=�	�-ǘQ^�wlՎ�)�(�T�A	���^��H��J�e�b����1y�>���+�z�|/�n8�4��62�3�f\.�Z!���D7�o�<����T%�Q��j�4 ޏDѝ�����J��F!��E}�eKIMk�~�ԅd�K��-&pӶ��7c��1�_޿���݇=<Q�u ���I@QZF� ��(��=�n�~���d�����|寗jТ��rX����B̔��)��r�OL�81���i;T�Bv!�*7�v�>�4#eÑ�$�A��{��IJ?��+� ��R��Z �����d}��	�Yc���9��yLFɖx��|��>|���=�X���*t�X�sY!#/'�R����B����o�	rW�.1�Ɛ�_&����aJ������q������K�[d�����h��&3>�]���@ˌ���m�m����N��uX��W	I�`�a%)@�8�Y�Յ�+ʛ&*b���p�[(��5��q�v
`�çn�g�1����z]lal�PJ����6b����o�]b(�o������2
�ʸ[9l0�����3b�sȬ�*�XЋP��������)h��&��pyq�0]^�kKf��F�m�?��J��K^K�����P��pC�/��Pÿ�q�P~e[h��M��B�A�W��2�i�J��<��N\{BԴv�~���S�1R�����)~�B*枡jF	���$���iK���:�������`�����tw�L)�8j"����ڷ�.$d7���[�B��tAP��I���6Okϟv�JNfM-j3��Z�7��;��b^uvh��v!-���64�W5f(���z�}Y6��O�^�����ʽ���@NJ���~�R@�����Ɲ	�ho}M~��r��ýv�)*��%���8��T�+bhH�)�itXڽ�|ՅTd-6.��/���y�KhƂ_��ݫ+y(������T�O��̶FƟCV}v!	�6��Ɩ�+I��`ԤX��	����u#9��t��F���?h�	p`شi�L�W���n�D�Yw�P`��O)��N�,��ۄv��@]��� �y{�&��\�/�t�^���+�	�s�\�zx���A�4�R�BCQ�ܩ;�p6���0�o�+o�O�[).�P��A\7&���0�M�����C��K�x:����l{�r�!���"���݁�������T7<��Ӻ���G�����R^X�����u!��QJ#��=�η Ȩ5���b�S?����]�К�z��'�,}��$k=��v��T���ʪ��l̰�cjU�^�2x��l�ڍ9�������*T���aJ�ci5��ٯ�?��n��Dm�½6oN�� ��q�\I5q9�>�ԅt��SJ�~>&
�wH|А;�4�i������m��5hyh-�h�*�iv�S����gCl��Xx�����o)����m��j�ݺs{QK���º_�$�)�5rJ#�=���!M�s�&�A�V���b��Z���7�g���t�y�D-�mu���xǩ��c�%��]HM�pg�k��9 f%?ܱ��{>T���ʐ��IR��8Z�2:��.����n��߱P(�w��* �Ժ7��8�U�?v�R�VK�[��t���){g�A�Q��Ex��.m��r_���%%�Tnv~���˺��3*�^:2V6���?�!�r�0��0]H�BMQ&�����g�}>�ԙu>�M{CuC�nɱ���	w�M ���57��qh��Pݸ� @��Xܡ�z����B���G��N6v��6��|��.�at@�	�H�}�����I�b>ɽ-���3����H*�m�w~{��ۙ��@YK�/�BlA2f�y	S�k���p<qH�>Q�J�ύ��\7����&�Ս���}����^����m��)B���C����Pao���̘��O����z��X�c��̂�BC�H�hs���D�G>�}v!	��8�nؤ�nݠjb$(~�A���߿<}���k��),H���gÃ�R!�D����8�����\���H;H8�E�rɨ78�����|�t㝭��~a�y;U-�H�أ&�g�q����F�ǐZ2��h�\�4H�R�ID�@��}���iL��X8nF���V�dX��q�u�=�ĕK�rI�H<�s�mj\}����>�xI���ԃ���,A ��=U(�|�@_!�試I��7�i� ��RM�jͧw��n<�[QcC��3�R�b�~?,� �6ڛWP7\�듴��˜��y7��.�1����Sw.��4*=A���F�(5�99�Ò���W\7.6R�vk5��4HC�B=I�%�n�>�*�>�x��#
BǿK��#ǀ�C��F���|�t����SpxR_���'�X�P��n�+��	W|&� ���vz)�
�B���y��.�$��?0�5�9��q���n��S-K�T� �Ap~��ƶ�������+�{g(��1j�(P
��ef�+�˟�C��U�O��uO�Z��K_9.��n��������W)>��#1�gH��g䯠n\� l��U�}�.�zS3���]���1�ם�s}����f�\DQ�/p���]a�c9�����F��l�xwj9�/(0f$6V��P�����Q���|��٭�)��L-^z�K\")�L��7V�J�!�z��<o���/~[�.��}��%���<gi� �Y/�DS�]������OpV�=�膰S��L5�2�+�e�����jܰO��]ɷ5�-L�]�y�����$��?����Z����,@>�.�����C��S���txp��m���@�����a��2�Э�GA]�u��)D���#�|����2�p-Fiyօ�SE,Wj�
BE���N���)KΏº�*�s��^��V�❼H�� [�>�Rg_�S��������̵���:����x�?�
�)�3�����
��nɲ�x0�.^�CG͵�,�����d
�����Z�܅Ԭ���i��{���XT-�l���O�������~��ޫPP����J�PB�K���R��-���6 nBN�Z�6z�߽{w�  �   �B�	׳�/H�����6�E���"�q!��	�r��/3��@̈́�d5���"�3�d(����Us���)������r�����ub���ɋ����<�i{ӅD]��mh��N�H:�����u<��B~��_~����^;�@      �   H  x���=o1���+�<�I��;ݺd�׵��N�$�r;���-CA�+H@�xN�#h� \Y�t#h��a����c{���p�^��)��<y�C�s�	�1��Dz�8�k�0�uU�EU����#e!���b��'BȂyi܉�R���������#亯/}��Jv�����T,n��
�7���o��>���y$�_��a��aO������МT���A1(�[O��=7����f6�$	U�w����o���{�
a�ؼA慀�S�і%����m��q`֯�L��k��קdߖ�p�U�̑�X�]��o��|8~�	�      �   �  x��YiwG���
�T��E� �	�d�V[�fk!�9���%�V�ml���~]�}Uo��Tb�G\t��X��R"���� ��ͅ�x��F�ή�\���Q6�r�T+�U��������j���?��b�����[Τ�f�v}=��9.�#L+��.�s"����1��_t_�o����!��-��Jyo�R�$�nD'n�T4���&ѧPdd.$֜-R�����=���j��ֲ{�1ge�#�%�M��,Q��L�)�&O�yζ�.�{p�H[���Kud�qX���CM"�1E���'�w��@a}Bo���tљJ�	W1��:��Z!WN5|���A���-�Ұ����@]"A��b���"�,aS\����i}���Z���?�̂SZf���J�̉J�ȩ�D�Q[�B��[�-��� D4�G
[P� ޘB���v)��
��m�� t�(�2Μ��JR��ES�M(��U!Vsk���jհ�Q�]��j�'��kuo'�X��	E#�a|����['rj�uv����0:P��VKw�H�f�o�D��I�����\$loF��n�8du���!��K��D�̈��#Բ��	7���(���%|y���fL]y�P����7^ŤO�,�Ld*� ����)�l��t�L���X&�:��w q1��('% S��	�y��cŤװ
�9���Ig���>;���ƨ���*��b��D��בxkIN�b��!�w�.̇�����w0��d�P0f���R1)<1�a�"�I9qm�����W����+�_�Ѕ?���3��Տ�ןP՜De@� m�5һT"�~"�I����q�m]��r����dw�֓3�K[�-[��ɩS�۽1l@n*j��(<�!s3[��J�f�'�U�b�n�%HMK����Ͷ��8�Dn�
�^c�������gbi��u�s��ȻS�m	x�h���o��-m�j�����,���byt����A	��`��2�>Fr�t�9�/ ���kYoj��:�9��DLkCaD��`C	!�1��`�ìDP2�G��Z+ܽ����HO��g̼�(beQ��d^�\��{!9%8�@��Y��r��j�v'�کb-�P�كbH��
��бn�� ���(E`����,��&+�V�_~I�'/�Ë��UB1\��CB�<al�I��eAEa
&�G�bb~�/��:V��"�PW(	.�ZJ����F�sEuPkx9һ#�$�|L�p��(����-�ǰ���{�τ7�y�.���O}�V��4/��|�G���h���憐~��ן~y.Nʇ����k$v�&(F�aߪ�*��helNg��Wǁv�=���@�S���&��q!kBK���"���DyQ�f��X	UK����v��{�Gy����|G����E)�@d����%除ѫ���?����h���_%]t`5JW˵�O�������0,����Xa��)�����J5>M����/{����"�0�?匮3�����y��|��4�G���O��ۏ��<O�y}��s��~z���Ut)Y'�b6]K޽}\ES�ix�������b�������������k�������r6��B6\|�q9�T�ŏ�����b���|���^��函����F�>v�ӗ�����b�'���Q�Ǻ���	�U�]'�v���|$;㿙�C�n��BkU����RG���a��ig�']��z��6������0�j��+��Y���:K�?\��N��̎�2Ѧ[�u�\q6]b�]�w��6�U�ۦ����]�Mrݥk�V?}���<��v�"ONǳ��3Ɵ��w5�~ǯ����r���;���ӵ~�a?�e�Xf�_�f�t~�:RƏ��x�R�~���C8]��_�|%|s���
˸rn��{gRQ�ƒ"-j@n
j�4�z�9+�E*�,��kŻҝ���@�V8�\���P(x�9"qG�,��X��&XS\4U�&�@5�6��?O^�_�ק/�d���2�"o��٧�6���l�r���h!KH�((A�Q[�*=N��*X0�5竰���Ҏ��	_��*~�:��rZ��K�ӂ��l	�YsI�P��X=�mj'�J���2/�|��yw��Ɏ
0�R��Cq��|��qb��F��莸O�L=�)�yt%RtγH��Q�ZE)�� A0Y�J�G�́��Kf:���ܮ�{�^�;+�A�*��Q�����PՖN���Ś���_{0�ER�����83�Z~�@���(0�AA�)E"�¿�hb�T+��)ņ?8||0	�hvtg�KN<h�	<�U�	�*����u]�T�7���B�u�5�t����a�Y��Di�x�'VY��	K���9Ԇg8��j_Lg�տ�,��p�XЖ
T�����Ь����DZ�y�Y��w�r�����[FM����"�'<�Z+����B��Z�	���:�p���b�r~��|�᭺#�O��Ҁ�ۻ`�ATx�]����3s�6~y�H�>N�7\��h��'��	��ݍc�"2��3�)�|�">��`�kT��2�{����e���N����ӱ{��<�m���|�Q�Hn����7�_><���K��˘�O���h�=���N�/��zW���j�R���K.�_�����R�������$�G��,ܣ\	�x�C�=(��"�d�������~|q�ǣ����c��<삩G�b \K�t��mM/a���jt�.._^�T2�rc9����B��`]PÕ8MA��_��?��ݧ��[y����!�	ѯ+i	&���Տk�JF�U!S�t��ׇ��ӊʎB�Oħ��T|3��с��%P�b�с�qJ%��q}�$x3N'gP2�]YR����d�$DC�f� �r�D�?�|(&�q�evc4Si�8����t^���Ӆxq���}����˘5      �      x������ � �      �      x������ � �      �   �   x����n� Eg��Ջ�ɖ�S�v�T~4H6� ����QժS�Hw8Ww�' Z/�� ��#�
1(;D"+��]��iI��ݑ��j+����v�q�g^o���]T+k���$J�Gr�G�G%͠���k��$��s'E��%��w&z/4�˶��^��[�o���ן��:ӷ"-�y�=̯�j�*���2�cT0��w�&��e�ٺ��;������!��aZ�C�u_�a      �   �  x�͒��T1��;O��<�O�8���AT,��8ڂݥ����6��4HD.r$�>瓋�:�0�	R����48L���1r\�w�{�{�'%$�o���[�Vo:���)b*R,)�3����4Mj��!&�L>G
�j��ƥ���aP $�<!ܣG.�dl�����m��O�//�&	�~}��Oߏ痯q��ǷwG|��t^
|���0k��nP���eKF��qF���|���(���r�*7ǀ%A�ȫ����\��@J}L��0�J1^70E+$��6V
��R-���H�bYr�9��$T���B�� �(9Q�?�p���,7�KN�Ժ�W�M�j[�Ғ�kW"⛧�FZ�X�ڀ:�jy]����i�7�VF�bM��I0,�����L;�S-VU���H{:?�#n      �   �  x���ϋS1�s�W�.&�߽)²��z���eb_��j�W���*Jy<���02)R��T��R�64����a�n�����69i��&��d�������tPU��;��i<�z���o�gz���"$�+,1��Y9�Er��R	!s	J�M2�GK�'罊��d�����d��I��:!�)��:��Z�;bj�V,�*���-�ϖ�uj3n�O�����^���ʒ��X��f�H�C���p�g��	�Z���W>�wr�l�A��hrV�zw�ݰV�ݾ������.Ӹ�g<�ea�^o��Wܳ���P{�V�,PLk`���M%O��_�w|FVD�+�t�}��zlm���T��i�p�&�|6ύ粴��$wC�➥7p?��b�9�4      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   �  x��TMk\1<���^��d�C{k���
���Y&K�.4IC�}�Ғ��^JIS<��3�G$��Z�Ab �
4eVɵuQ�9:dF�Rr,���B�.�G�<���L��9�;3�Ξ���p{�?|�����M]o��lz���u�w����7��R��R������A����5����4B�� �_^#���1kɹ<�֍,��@�� 5%P��!Q%2�����i�"���PF�6B��?y�3�aK�b�?[���ax^#vg�Z�&�eE����fm�h9�d�-�㢱
���Ua�D��I�fR Tq��8U郍	�D���˺z�RW��Elu��un�`6� q����`p��l�P��<�z^AG�P�j��U��?�6����QŞWʫ��a-YOiA�D�e"x�"���f��4��      �   �  x���Yn�@D��S����Yr�s�P<I>�hԲ�'����7İu��X<�w���3p�AH�	�v�(`-bj.r��G�!�q� ��L��C ST���o��	��C�M�(O[m�V���bLtZ�{Uщ0
�eZ#΄W=:�!n�"W��E�nY����y"��lw/�ײtں����Q���i:R�X�����F�fe��,]�(;�Ⲍ��� r9߈��"4��Z��L��2Ǫ�K����Huu�te�A{�N����!�C�٨D�.�.�:J] ��0𣏕�Qh�Q#��!�fH$h�i�L�tC���l�p����s��vJ�"��2�"�_�"~�d�%� �h�X�WB�5�A؁�#С�E�ۛE7Ez��E�p�fWQ"+�*�Ϗ�8� +Q��      �      x������ � �      �      x������ � �      �   �  x�uVY�9�V�b.PIQ[��AI��&�`���釶�a�����G��-�]TV���"�r:^�U�^�b�5_[W�&$�qGQj��pf���_�?z��z�)O��.�����/1"�"�k5���:��C��zJi�c�y"w]O��|m�zZ�ߏُ���H����R q4�Oa��,��z��ǹ�����Q�X�k�T��PAJB�ծ\�m؜(��Nz������R5��،��FdiчFѫ&	�6y��sSx _�t�c{��T2
r���Raa���sE��F��9�2E���h�>Y��r�y9�;]��(ވ��G�h��4c�:Po�4�B��4��덋y=���>�zu�c���kP�g�Cs�d�Hm�Id�c0�� >��~ib��R��1�bR���B���^���	8Lō��|U���_�;/ ��`R��lI��~��XUc�����H��	�����1�����H�1��h� �<8G̤#��P�L�wj�˲���΍���v�w�?�7Y�?1��+��c�eH�-{K WOܛm����E���A����2殫>���^v.k!E�Q�cs��-x�R�ۻ�*�Q�E(iB���<��n��y��|kZ�Ɓ�g4��"�ck6´3W2	o��^�O��vչ~_�8�t���i����Yr�Tq@�$2�%�.���E��?���h>��e�O�oc����9�cm>�3����l���cL���<��-��c��\�)v�Û�,7So�%NM�@����"�mH�󚤒��y>}=���]v���~w[����k��l��(�>���9�������ߞ�|�z�h3�>�q����X5U�J����@����eh�ۣ,X<NX��Wۡ��~�����?�p���,�$�H涤 wS��aXoI4�����>X�Mn�\�_�_���&>tj��-�5�
�d���h��"��x[J��b`"tW?l��,&��y�~uf[���ZG�f䭣��,Ń�!m��7~=MD��s]v�[sZIބD!w�%�{��G/5�BPsU�\���s�w��j�X��7KO�[7�k��c�s+����5�h����Kb?�>��7�e��wjFy����Q$�.9��c�o��1��7��~�AW�4�K�!��-HZ�&JŚc�vO�����a��a���M�      �      x������ � �      �      x������ � �      �      x������ � �      �      x���s���(��޿��*R9�>����r��J�W�,9zd�'�B�$$aM\�������Nϳ���Ж�|'+�������~nnnn~���=��e�擨�}]g�4zH��&��2���(���e�哲���`��7��6���$�'Uz�G��c1%_8�"*�9y'����@Ɋ<�R�r4���tG��a���L��S:�R���*��?_�g���^t�ˇ^tu��x�e�����x���.�*�i��ϣ����ng\0�jcP�d*��H5����0�w��(5��O㢜@�BZ�ˬ���V�nS��V�nU}e�}���d��E6�.d��/����1A�B�p:��cMw�A�k�pǚT��O��6�  �
,oP@y�R�Cz7���@�M.�lA�#����6�k���2�:�M�lP�e��.��a1��N��U� �Z|զ:Pm��	�)їB��T��A��T�����e��4�&�R�̕RO�S��S�� +��(����Ah͢�Qu�5�^�f�aq}mle�"��U�E-�}����D�D�h@xM]��\[�a:NʉE��U)jCd�Z��V5���Lo��>A�(zBM�#Ԩ�A����4%�C���o]�(ТE��2M�E��\Ѣ����'�΁T��-[tن��6�C�L���ցl�e�/�t�ā��~��/Q5!_�j?�p��4�O����Y_M����R�4�=�n�V���xL{��z�^�W�G6�_�i6�>���?�%�[���v����>�����vע�Ӌ����x�C`��	��&�aI��8z�&��g��"O%Dh��ng:t��&��z�ݵ52O�(:�����q�8(�đӑ�Vy�z!��az�LG��~A��rp�Ɉu�7dS�1B��\I9޷NO�/���N.���a21���G�����ߢ.4Fo���_������/�R����_�֮�� ��ha���w�!��	m>;�9:���w��.ώ.~����q<m���w1��yH�m��G��r�}2x<N&��7F��c����"8��ՎQ��g53������sӳF~!�YH�aYe-��jPf�	��Q��Gdm�Ü̒����\��m��ǩ��2����D9u5��$��>M(�8&-����ؔ�g��'������*~?#�a	As� 	�e��r�f!rH�Ŝ��(����������A�SJ�'G��u�����;��V�%��+uL؅i��6ȩ"Z��l\��`/	Zm�3��u��z��=Za�J>���gC��mh�d4�@z*'1/������ٞ��]��c��$��c���r�����&O����/R�](� Y�X���;�2�!��,1�;,�c�5����N� K�9W˅��%t�Ai	gL�@?-�܇p�i���A5�`0D��?)&�hF�n�|�Kޭ���U=����:�k�H���F�z'�3B���������&�P���y�*�ȿ�Ꝑ�=�GttNa�E�}smo�Cd����{QI:v�gџ#��tz��Nע�ӳޡ���P.[���-5������G;��S츘љu�d��usX&�u٬H���8Ɇ�Wq����U� ��h�羛b&���y�����m��ޖ����϶s�bH��U7k&�ʥ�s~ID��G>j�Ka/)��'��6)��ϟ�oՈ��o��HMo{�V�T�&iDh��ֹ(^��"'r�v�㈝�ߙ�HG²���hc���&�_mKW�J'r��-)�¤��&d'��`ZM�;IZx6�}B�1�D㙸�Ouؠ}2�Ia>�����uVV��V�9J��ߒ�Z˴�E:~d������q�9 8J�o�ή�4bp��?�k��XJ{<hM�w?hs��і���?�>�uQB۝�P�Gŀ;��
P5(}�۲�[O[A�Rn�#6v`[?vMl�;p�nab�ѣ��uUҞ7&Fa��|�o�l2���Ct!Z��Bp����E�fe�T�>Y��g>�'`a�1��4;;wr�9U��Ț{�=y	�����/^=����MQ���vjƥ'�f҄	���~���1���x����3 ��e��|�t�+}�J�T��v`8m{2��I�xN�����P�+���H�'υ��0�<��M���J��`�,����fE���a�������'��G��|&Н'f�5L!����?}bt�q�R�P��/�@�k�-��8�2	Q\Xe�WN�56�/��_a����!E�+}�tR�1�$�$�dപ�OT˒1t�S����]��=�`��\ ;�����D�g�U�3�o��m�����Ϟo:�@$
Ju���~+���M��H[�7~;��)0��6Ȼ$On�>��lA.a96&�D-#��n��È����̶�,�R���i�0�Tٿ�w���M�!1�L)�u��4"���<�dnj��~�A��r,�@S_$B�=I�S#}uj"���fðLK�B0����˻��X�����PO]����ȗ!C��E~^Sk�[���w'�̺�M������z'�s+���s���ע����=B�y�9R��v��p����������T��2��g,�~C�c��)�w}���ʴ�y�j���6K�:͙%S�e����9�y�Y���4*��#[͒Z���l�$;�Կ�]��1`��B g{�,��k��{]�_`�*d>�"�j����7ML-8՞����[^����j��n_|V��f�"B��f��*Lջ�Z$k�<�������n8�)j���)"��31�fn�-0��s�
��oh�(`˞/�M����:ތ����f�F-"tg��1����Ѓ	�Y<����I�OG��4�oh�Q�c�"Z�+.[���YF�<oO�|eK�bF���at{�⩦��j���,d۹}3��\������t'�:1�[���j�y�~;����}K�l�d��ܷ3a�3ʞ�|���XB^�鲇1w��KL���^^B�]�"���X��Bo����U�g��p'�N���NNJ�7wB::9��Sw22�O0b���1�<?:y�'e��I`���W-*�8:��u�w�S�ߩ������>��k�އٹ��bv��EL���z�,�|5'�k�_��K�&p�^��e���i�Q���;tb����k{5(�C}N7	s4��ɿ���>0G��C�Y!f���d�����0a� ���jҰ�-C�������?�0���\ñ��:,�[�6�>`mg3��ܝ��J]ϋ�٭�&��]��~�(y���W{b��}��F?�)=�i<�l}kb�ܹ�M�/.�p�=mX縴����S�JھsW��܃��0��C�\�s���EE�`��\BJ��C'�k�$&�&j�Y��3����p����^��Zg)����z��>��6S,��yA�Vt��vM�"۲�j+;jpD�Y�Z���y�N��\�N���5�q.�'��w]��\Z+m����A����>�jz\�l:q[���9d��jUC�w�֊�����,AZ׺Q�bX(|w�nml�w��Q�N\�������|�E��3�i���RnN��2��gL�z�F㐴+��)���E�Vv�Dm]����3G3R=uT�2��][+���^�ڞYcl�u]L��a�&�k{�=/2giw�2��%-ޥce�=���s����bڢmݯ>4�!����㣃_ ~/O��4��t�F�E9AvS��y��w������=��#��)���`���C5�.䠙g`� �:�*�ɧ�vtr�;��l���W�t$"H��@�	����o���g,W�����?��z:��"O��N���?���[������ãsO���׿��!'@|��w	=$Pl��i�:$H�M
�2���rX��!]y��I#Di�ѐk��@�\�D�0 u��\0�]���6�m�'���3z�>�� ����TZ��5BdV��@�QɿH_�bzs�rr����T �`����Ytxv���5�fߊ̔jzb�.}�)}�xE$��8?o:͝�M�L    �4��_��vL��Q�8�Z�������%8��H.��H_�>��G�'��ǀ��1���s�ڼT:�N�R�h��h�k��R2��ON��wX�Q߳������MH�c|Gn�EI�P��vm檅��G��2�s޻�g�W�5����Pݨ���������=��1|7�\�GQ �֩0w/ZF��-I]7z�=�#;����,����m���9c�Ws�I8��7'����<BA��ۥ�{���:���C�J����dd���I������#	%���$6�<�nT�	�#�G�1� /���8�0�X�A��� ��W ���C�U6Y�}�sB�ג���J�"�&;�v �YN�E
�H���<Pw��e�� ۙ���)^�p/�0����M�9�6S	܃q ��� �=��n�V^����t}��̹�3�j�������z����2��%���RO]G�D]'�O��&�:�3S��|��%��U#po���\�����|sw{{�����M�m?��l����<��%Goi���_�GL!��?�B��l8g��(R�8ܶ\I�XJ���=����5E|�T��Q�(��OQ�F�H�ƊIQ��%��y�$�_�o���;�2��F�{���\�+;�[v�A�9��hz�G�u�M�a�Vyg���ju'EtK֎t	�Y2���x�1���1 ��	I-�F���������4���5]-}����k��/�f������&߂�e1f�&[6���
Var�>�櫜��@=JƩoB0[���.�*�xr�~�J��o@���Ƭ`zg�bXHZP| ����	�]����jJ�ﲼ�u����D��m�AaBD��pa?DQG(�6��l�*���8iM�IMk"��;��t��*��m�+ܪzíF���z�M�+٠��M��$z�oMٶMe��AG%kB�d*Y��J�ď��|� ��
6oP�y���xÚ����E�mr�dZ0ن�K�S���$:��٤��MF��
u��D�Eu��T/���Fz9�nT��F��nT��F���B�yWK�}9VM=3WO=�WQ=�WS=3��]��H�f1�Q��5���f�W~�D�ї���-��b�1����M���Q4!�&���-ke��!&`�*I�!"F���Q�1Q%A��P��5��P��5}��H��^�oՅhQ�E���p�"���
�hQ�E�	\(�1x�&;�-�ن:�mF7�z�M�٠��M���{ 	���x�!Q��<���n6֗�^o�t$�$�*��C�	zAB+��b�*Q�2��h�q���B��""�e�{��7�%�[���_x�9߀W����fC�b�� +�6���|���ͼ�����h�����>�$e<-G�M�:3$!� A�3շ%�@-n�r�/�rޛ��tt�ְ��Ge/���j;����|�v�[i�,^n���j;�b�9��AUk�w{��ܤ�\��3��>�����'G
v�Nb�e���Y�����<�8;z��P
�"��OW���wG'��Nz?o������������C��St���r�!�����}���g}l ���8
�CC�D��~���{�$���y�����ζvJLn�Hy�?+�7�i�?��9�ߜd,F�t´#B��N2c��i: .�p�GL�7mۃ�f�ѲڪYnV�շ�-�cr�j�~⏾�bQ)�c�@n"J6�L�X���W��l#��2� :Ɲ:T���'WK����G���v9N@{���UjFg��O���z���$�l�Q���y���o��n�7���R�7����gb(���yg�0����G�@l	�=�nct%l�8K+�V���.�O���e&����-3� ��T]�9��=,&m��2o�~��ʺl�դ�����z�<�-����4�qXW9tT�Q��G� ���L���)��t�{�4�oU���tY��i�W��U>J�ir�
!�*�8�N**v��)e��$��_�����-ˮz��S	3�ׯ�Y?��rx���m:��+��d��F�X:J�ڤ@c���$x�x�Hq���dwo"��g�K��u������ۻt�F�f���e�'77�r��^aG���#4 �qZ��r��K �ɽQ��㫱�&�鰖E>��a'��3��݄�L�N&yN&	ئoQ쑂O<&;���֣�$�?:�bc�NW�����l��/���C�k:�ҙ���tİgT�_���|HP���%M���-���p2/g��d�֑B�;V�6A����Z���v6��4�a�{c�DV?� ��F�7��>@J5�%''O������~B�v
b�A���ȉ8�N�wm9�d�ޓ��Iw��Vf=J�"_�_24��>��:��8�P	�5��4)����Ǌ(�/��L�!�Aޞ���mlm M2$=`�nB�(&뫜g::�8���� H����9�b��r�M��ioO�'��Վ�����g�A:���z������zx�Sd���Q��?�D$��d�T*::��.���N���R `_�ec0 <���}?�%�����N~:[�>n��I��s�Kx�<'#湐���ċ�|Xo�~���]5艶5�Q&����6�qbK�$��)�H�=M]u���T
����)��p'��1�13b�y�K���>�^k؅�m+�'.��'t��6��k����_,�ՙ�X;�n��-���t�]�֮|kW��+�ڕo�ʷv�[���4X��W�y�t���M��k^����1&�kL�����ߴw_�A��y>4�⩥'�B���#�s�)����}iv��z]>���X��F�"`)��/�{��E_c��c����\<~��ᅦ��o�4h֏Nzg�����\�=���[���ii�?��4�9�t��`;�X���f1���,f��*?�{�*�p�;8�?�i�ek2���t"��<����EJk��,�4Ԇ�,��ڧ����L&�l(��X-(u:un,#��˚f� a�
cG�/E?���4������W5��n=>��5#ݔ6��9���,���Mj��Ip+k�ɶ0��;�?���5t��w��}%�`��F0/ȳ�?N�֛&�}��V���KX���>�K��Wv�Y��3�)��F뉨��5�:�S[5]Q��a��~��)9�Jv�˻(�a0���<�Dg�N��ĵ�e�:.3�?��¡8�Κ!���!$	T�$��*f��f�j	���#��޽���1Q6X�z��
.�@�Z��Ofľ��Q��7L�j^��xEMQ�<.*����pM��@4��@��]M�7c�F�En�He�H]����/��D�Y�s����-�ճ� �k�D_�nin�R\S��B� ���,M*Β͛7��Z����������+:d�D
Ž��O+j���!�~�����ң��?ҿ�!�Z��6����Q���Gm��CW"��;CǄz�㤡�����q���׭�t0�AYO�[&|���IQ	\�e�7��������Pc�h2�?w9.����]�� �u�pqh���^���mPv�H�����U�/&����C?��,:�&��^��X2��	M������$m��h�A�΂�t��RP�9}_�B�XK�FW�CT�tu��%�<$yt�n�>d:��D��+V�����=�1���n�t	��Ȍ@�xAԛ����A�[���R)�����p�����
��ף5̆m�ʇ3���@���#�	��Λ���M���ɭ�{����σ�`�R�~B.���:����կ ��C:������Yb��H.CS��9<��ˣ��h,b��o,�ҋF�.�w���?/֜FC�`��*M��-�ȡ��O����%��_��~��!�d]�N�J��C`��a\5��脌"����	�z%�Z)�tᲡ�e�lB?�/�� E��:r�\uts��,���з�ߖ���g���D����ɜ?[�b����h'jV�䖇��Up�7�Z�#^i��    �c�f~.[#/5����>ܢ����4�-/��3��I��$f?2�?N�&���m8(�me����6SQ�����J�iOa͇��Ak���ۧ:5��Czg�45�k/L���/�	�%=��r�л��r��Ԫi�ތ���ג�΃��E���Ĝ�cn�J�ިcO&Elo88�ܶ���ސl�Ǎ ��L�Q��A,6������r&���P�H%�3|�@�F5c*)R�������M��Q��i�惴�]���Z�����*nn�ԳTL�M�ޞ�+�F��߬�����U�Q�$}p����-��i�U}[�>�.ܱ�s��pON�F25 >?���-?��Px	��0�0%�A�i���<�4e�?7�P�S����xÏ�&�	�M��~���-��I~#l�E���^8�3�2�����=����m>0�<o���?�>�;���W?^��(�n�M=�g�qq��sDE�S�A:x��Ѫ���.���;S��}�/qҕ�C̝N�����1�k<��#�A�	���>bl,�9����m�C���s�B�4��
q��Z��Lr"|�e!N�/�c: �~dnдbW�w;������KW��������=����I���aP��	�&sL/�l"ڥ��[wb{3 �HP`<懣CL�q���>rU$����m�K�X3�	���C���@^�B~��LUH<�g	��뢴5W�LV��4�|����=��rW\�h�hT<��
b(���pZ�T�M>;�m)�*w��*���6�UN���U����O��O���G��kxrܔj4T��#!�1��b�ё���O����Bh0�Y m���3\Q-qeZ�X�f�����k�T���;�%�^���|���/pP,�����G�ο��f&XK,x�+�~$���娪S���Ý��S�E`��i��L!iAHL��;��G��P.J���s����)�>�!�g�������Ez7.ʤ�F��0�D�jؗ)�*Rj?BBv�g���oj�����N���T��{��D[I��l�5�����9���K@OE�9boB��#�H"h<X㌚+[���ǻ˄ٚ��c�|3�Ǉ�!��3`1�v�ku(~��;K��!ʑ�����m���Ȝ��d,ټ��&����%�4����m|���q���U֝ee�1u^��3���T�_�nГ����8��S�	���V�>����o�L1����a�*^�C������M�nSc�w����ok��� 7���wq}YÂ��mg�Z���"��3���Lk v�_�h�M�|t� 3��u#^�3�U��U��U��U��U��U��U��U�[_�[$r�]zu�������ܼ֗���+-�W��!�QS,h�E���m�����NO�hvG��)��OG'���Q^ln���*�J-o���t�5�38��ݨ���Eͩ��Q�I�����ɔ���T�w��%���XQ�Tٲ�py��i:$��.���ڢ6�PO����A�Hr�����,�򢉅��ٸ�n$�r�j�l�!��)�2�CC�y��(�gv��q%��|[�P͇�@��e#U�[k%�ݪ���crA\��g��V��>���?:=��_�qYB�y9��6����.�)y�3����)S�Xlu���~Ds��q�]oB[��a�J`7.��@bZ�����yZ�ىw?�|�8B���s��t8MZ~EM#tQǜǄ����i��r�Mn��Jt�b���6g�5n�P����mE��O�'�$�'{�P���T���<2�,�=��d���(���3
õ�pT�A�_�OJ��Ͱ��26P�K�ܖ?M�d0a�4Hz���'�I�"�(�+VP=�c�{���c��Uk��f��	�	/8�I>A�}�������A
� �#���5�8��l ��)JV䣰*�NB��Ј�WBy�G�@5*��л��QO~�Y�����:(�f4�	��Z�����@;�<]�FY��������"�6D���L�ӴQ�٢�Sj�toz�п�EBC?:dd�t_��ѴG��c2M1G>N���5�u���φ�L�X�n����)ͰJb����#�
�����[���QU���l���m���_$�w|��AӠ6.�S�j��ZX���rs�䣸���h ³��Agg��Es�	!t7�֊�z5.Vⶍ!�"�&S���v�bwk���9f��f�#y>�TE��Q�������������?�ּ����4��#2=��µ���	
;�Yf	� �8ˇ`%����pB����8+�����O�K�7���'g�;�J9f��Y�< �8� �5q�!���;�$�K�ytu�'D&����K6!O� +(lt���9��^n|��Oﲽ�p�k�+�`uY���ηj5�I�O��bzs���N�V���w*�j���)ڨqW�'0�f����#x�]�'��ہ_��<��ׁ��0�~t�´�	�Y�*�Bs�|�W�4���$���6|��l��[:|�_ԽK���?�n���E7�".�b��Da{�nvU^�s@]��Y���#X҄�]ɨ|[��*��#�]?c���|��2W��7�t:�gS~5*����-��omHd��L����W~9~غ��j�͑~<=Ő;��je��R]���:�v6E�=�E^ƙ�"�L4c�e1G�J"�T����on]:���O\~���h��xpzr~q�Oq.�:���Պ��h��b�1}rSE.�#�G���c�BRe}����Ӹ	�z,�>E���Wc�!fC� �֤&�N�Q��@SRCO>�DyL�̅5��(�a��G����EƱ��8�?�8mT��t4d��~�Bb����Jb(��ζ�v��;k����>"߸ ��5���x�~)�������ш���@������Z}@��O?И
ޜ΂V,E-W����,�
�#1���P]�$�;�Fi�η]d} mvwAw��r�<�I^�?)ӔA^�:j��żB= G�u�x�|k��>	9���dͫT��+�� �,�޼`ܥ&kȩ��y) aZ{]O�p[ڙD����p���?`�lrP|^O����Y��6�Ogx����p�w9֬0K<n?��>��<����G�� ����y����y��ĩ?�B9}���<}����>�Ǯxǚ7�sEAּ��+6ҽ�F(h�K���a�B�$�@����3�[���6M�;�,=o���e`�KF{�_4#�ު��w��V�$��t�[f�l�[5c7�jު�{��a������j�hD�ֿT;A#����yE�eu�����ќy��R�pr(c�_�fT��� �/�_6�e�5]��,&�B�R��L�4$���範��$2W�=�*K��PI��Q[�{���I�7��-dE��j�ސ��5�P�:}M<0���5�\�(<l=A��M�E�+���3�Ê���
�������C�?t�������������5����������̣c�e��|9�?��hQ�
��&�/�4��v ���(�X����� �T)M!�ʄ���w0v�r���U�|�/W��%Z��]$-��z�]0�6"�̕�Ә+���3��c՗^�#���_Ď��I��P�ҚR}��߷��>�AVJU�,�'�;��8�4�r����/p��xZG3f*2l�t�g��X������k4�7���Z�ʰɰL�-~�Σ�;O��c� ;$N�W��C�a�Yr�X���)� �E2߂v����ɚ*t�q�H�����R9�Ysp��mo=�����@�24�e�*=j���Q;�ۨ��B5������/-'P���n�E0{�W
jk�a���`�l�mY���nӭY#�Q!ˮ���BO!,����g�u�s}]�I�6�bѱѰ��iw.����y��ez��JJ���:̣���][ru4����Ѵ:�VG��h��h����l��>wB;/���G/�w6�v��`��q\(vKh[e��D7���ՠ���
��X����ӓ�V�_�2��Kx�m5�,I���u;��6�1��lf
?�'    L���Rҕ�\)������ڊs}���h0to2:\I�F�=`��	���"�L�\SwH�zD��y���;�W��A���߸�T����;�"�K��h��$~x�������z��ڴdB�x�MTn�)�W���d��x!F�d��o�x1˾py3����$�&��Q�OG��A���!���h0Q�_:�b�V-�0�)��2�i�WP��ʳRPG-��X�Ih�\
M��[X��P�4���\��)wߢG��oJ -�����l��0��J蚆���JL�����b/y�K��Da�>����1(�e:%�&P/��
�D�F6Ȓg�$��u�;	�M?||HJ:"�g���ɏg�2�K�G��|嘙�O�i"k�b�r��u����l�ռ�nx�cF��\����1j)4�$��N1!�F6q�F2�]��	��j�]j&�B裋�BY���m�C�_��������FB�������	X�ߋі	׬�M~,���ۡ8�ԓ.��b���W[��_nn-��/of��r�N�u\�|d,�lqv��� ��B��2�Jʈ	1�-��K9`_����||C�(i:��2���k�D�J��P!Z�r���5�h5W�=��Ȫ���r͐�Y���Y��bv���3Q��$c
/�>#ǿ�8X��I��y�K�zC��|�j%xd�J״�5}]�;�?��2Ҟ�71�����9n���Rp=�v��M��q�
/����n}�u���xF��̙ �������@���-���=_ ��LFY�3|}B��R�AR�j䲨T���?��Q�q�V����d��Vb�Jl[�m+�m%�ے�~v3-��35�g��n�7���v��^�����!D�۬HY�
�רHQ󗨚�����Y���㸠j��R�D�Kj��MrQA����}�O��2��J�% xݰ�H/"�o�KR�MVU����:g����q��m)x.� 0�Llu�er=��$�ɼ�^CA�y���D�e�{��au$*^Ҏ�Q[7� W3�q$���>9}�2�G�Y���ӗ��lꭺ-�IL�,ӪZjO4*�|lՇ�8�OE`t���@���l�P[�\�r��?�F�,��}U�Ą���}\Tm�כf��D�����z��
~����%L�0r��e)�-��q�����O��Bf��!�z��`=^��27�尝�}`:-{������,'�|=h\b�<��gY��}X��=-~�;�e7� sV�1R և�Lo��ͪ�CO��@R�;[���}-FXu`����iO^���K�HVm4�!s�`|���ae�<_��B���x���	�� ���{�ۤ	ľ�~��6T
�_ iV�L��{��^+����Ug�j梋��M�sYȾ��>��)�Pg�g���8��_m��S�K;N�ė��#�.EІO<*tQ�)#�k�3y�p����w��R�X��X62+��`�(���щp�Qe"	Ye�KZ��rL?�T�o�Ǒ�@"0�D��Gf�<�FT����S��r,�k�v^m�@Nj�2���L��'��J|r�+[O��Z��V�V�f]��i��|�+2�Rd�s�m(hk�ծ3��5���g@g���3�[ x��H�����Ϟ|�x��Y�`��xG鑜�c�9��0U��X��\��`�!gID���2L�[U�K�K�0�J�6'(� �+�Y-7�HH�)��[�oL"�3�l\�*��1�O�΂�c��7����i������|u�8�Q�<�Ua�q."UO�NQ���f��N�,*��f���S?Ǹ3*F����IR��L�ѧo�m�n��޾����X�?3����rB�#.�Y��B�m�A�v+ҁ9%+m��.г�8��l��8��N�:��].�G6=���$"e�� ���uX��[�ZRqv07��R~��ND.2��`h�~�L�aPC�ॏ���/��fb�H!a+iAUI��0-G�TmG��)F��0V �NIm�,�J��r�3Q_`�!�A��y�&s�������K$b1l^�BԼҐ���0T��i�M%�7�5/����`��H��ڟo���2{�)�9�GL�,���m���S��Q��D�I*�[[;۾��[�[��t-�ꊐ����̴=+���J�8s���MIZ�U`���X����K�e
���euQb)�	�Z��J����6r�.h���<g��Zwvvv9k�*A�Z
Y���!d)�&L��L��B��Zڦ\����i�k h	ǻ��v"s�8��ͷ�h��6
қz�v��C�,=����X���,�I�@<����m�lG����L Zwg���=�8�fn��5�D�%q�G�c5�$S��፸s�g��U:�J�R�Y��H�ݧ���r�M�y���?v)m(��������:õ^�C�D��d�O{�5�����O�D38�}���}1����٤�R�yn���vZ\�1#��iz6��7������n
T���J��fm�R�;*�D������g���rK�"=s�ۿ�}�4'"$bR%Pn�&�)�P�i9i��f����4�Q�u�ߩ�Kh�w8���j�9�u�����Lx�Y��r�ӳa|ͪ�(o@D)#=sbG�#Ar��R�}���|Dw���;a))����k�k��5�F�9�A��&|��Yų�VZ"�z�B��	Y�J�a$�79����;�F�3�"_%M{"$9;i���*��hP��CYO�Ga꠹g}cD��ѽO����`�6J��ب_�Ű\�3ϡ=����,�׼�a�������D�<��6�X�(^ _��=s~����Ŝ���s����	�ޕ��fE�ta�ñM/6����[:h��r��.D�IED�D���\-��u��{�r����ٞ!uf%�[���L%M�4�¼	*d��Ms�	r��Q�[\k?/7��pKma)b�p���rhC��'p��EO�c>`*\ۨ[�����_$�н9Q�|��(MJ�J���L�O�0r}M��-'&'_�1ȍ8���r�����QH����b����GH���	K9X�2�l������k"�����.�W=یK�E�Hne�h�q��۱c�иL�����B�a��,�����.�Qo��ƗD.�!LԊ�U
���1M�)�{[�t�{#�� F�v08$�K�EX\��"VΤC)��-W��F���|w+�^���	��LX12;.@Ó��F�m.u-�b3�yPT�[[�.��~�![�sUv7���mޛ��SX<t���>��㷡&�9=��I��di'"	׊�9�Pj�?��q�,��b�w��'v	0��b>���Q=p�<�ϰ���<g��2�rX��~���K�(����}dTu&�E���L.	�=}�$�*��������l�>�o�*W�d�F9L4�(�L)8���F^��-�a�����;��FQ�W+��[13��}Ǩ��������JH����	ؼ���,k,����Bʿ7'Ի�:��!+Td���Y���CA־lPKԨ"���/AfS��q�u)7Xd4���FXo#h�/��o6�9�u� v�6[�����N��36�"��N.��H���`��κ�����HF#�P��qQN��,��ЛL�m����Y��7k4�f�F߬���e�L�h��hcP��8�c,�1��t<���|&�_����ڠd�1&�nI�#R�[�	2-,�fG���o6�ÛM숷����J�PD�6�hE4C��P���PȮN6Zd�6�j�F�Ñ��x��րD�=s@�]�l5$ۍ�vc@�}k@"��9 ٮH���ƀd�1 ��5�*���at,[yǦ-��$�*���Y{+�6�I�*z�����������pZ��f����qo�Dvq��*!.ځ�3����pb�����r�ZŮW�r�]�d�m��nF���T�n�T�����&�:����ÿ�x���8��ʭE�Zį4ݢ�Y�3�KQ�ⷭz�0��F������y��Z�a�43�A�?q*���of��'��˅�LO�������v�3K(��Ń�    ͆?z��vG��5�ۇv樵z2n6BZ���!Zv0�3:�6m�v���Fi�Y�N����3�S͚x|s�Z��߽$��>��h��P�i�EY�xRӱ�����,��`?n��#]�Ԏ����s���L�N�����v��xj�8����8�����6zi�9��t!���@@ͺ����R�Y������o]10#_���s��}�����Z���z:�?n(�4d����pF���F����=�6��h����{��v����Xh!Ԑ���uP���C6L��X�`8)���O�&�*鞍��tT��"Z:�UU%;��[A� �,��������%U60@X�\%����J[fAqr?��nnlт�_;�F;���@������Pxu��L�Ebյ�(����`�ɿ�������~,9M�C�K3�<㡮�3�:=�nB�]��s�.ӂ��3V���x���C����s�>S����}�	S�*��*���IxL�s�<����	�M�c�8M�c����k��ݦ�s�nӈ��3t�����;t���~��ǔb?��cZq|��b?wN�cz��{&�1�8��N�c���;'�1���=�n�{'�4��O�IG<�����KB���b%��tל`E=��A?Y�Y���K�֭�:Q�LtJ�\� �%ݖ�������e���(�uky$�.--	�vg��׈I�f��wd[N�<|9ɇ�$�;���v~�q:*��Ռ	�ifa�~6�G��t�i��1�#��	d%Ff�� 鐩��8��E�����Vi!�Z�~���)�����Q6���׷#2��9�q���}n�i�w6�67_5���y���&erGxh)�'Ѡ(�t ����kS�z���z�<�J��)XDL��dD,
`��c���|Ƒ
��,=]���r|�p��� Y~�c��w�����י�G��x�W��y�+j���;�'������s�b=��������	�f�j�	�_��	��_��r���[������b�m�i���B�Ep��`�^�m�D�nm��b��{v��?��h�D�mx3��n0��&�yu��wMu���@EYX	hӓ��G�7'��ȩC泥�w_ �2͠���x�l���s&A��N�M����|��<#��5�0���r��e?p�u��l����\զ-GJ�r0���M�̈́ +Ezn�_���cJ�lDJ�m*v�c{�:g{{ ^s˦G'D\nW��x�I���M�k;���Zd��fZQ�D,�y�w��ߑӉ%i5E_��=/�C�-o����@����;��#Z��/������j@��-wV��hj��#iV/�9;l\�e�M@8�n��	~}�l�ˠ/�8�����5_a��s�t�FZ�B����۶��c枴��n[䊝�L�U+���z�(�>�r4�I��9Lc����)�!��Z=��DԒP{���~9���H�u�D�-$Oh`�֍���1ȓ�H��_l�r]"m�D�4h��['�Yeu��_K�k�2�?����A�Ȧ)c�A�T�F6�B�[_:ZzI&�g������'aEj�H�f�����Og�9���6�`�j(�ȭ`.��j���|浳�>��$\�ɫu�dDؾbm��6�4g�iN��b��zݕT�����A��U#���5Z��Z�V�>��toV'�ޑ� meH�F{��F� ��2K�w�<���MG����u�T�4[���c���t]������#cL�:�1A�{|3$a��>H�l�̼��E��迅+����-Z�2-�ͪJk! ������2���r����+�i����l�P��^�֡@�Iq*0YA)��>�'�<6�.����j>NǦ�a
tJ���_߰<_v�?V]�H���B��Z�Ҫ�O�ҍbu�����}�k֬�e_��!��4)`��-^s����\�VVgZ4�wZA rD����~������q���V@T���sE���S߄��qH��6��HZ�L�F��Q��b��Ԛlm�<������K�!��,�1)��1��*�UV�C�i5fθ<�Q�ѐ||�ݔ	��;u�tg��Y~U�IDFq���T��!�@�&�O�,'W�;�3���A��RJ����Ŏ��<F/w��`����1��1�ʾ��;�M�I��i�L�i��Ɖ�V�#]ƬK�ˈ�>��x��@��!<3����Gj���C��	ZfC��6DcA�@�8C�B�i�ް���
+�f0�x�
r����S|���.u�d3N�]~�L�6g���˫i��)W�Kwe��<M�)�G2�?�~q/�4�>5��������W@���`����a a�k�we��2�&�mT�m1%��.PԟB���4��g�蠎JD�m||���o�tmC�a�)�5����,�n��~�-��*%��U��G���f��Եz�D�L�!�y��e幍��tm%��-����W�g�Bm�a��J��ׄ�u3i�#g��H������i ���~~�xu��Z�姩Ko8�2��0m(�g�ڨȴ՘�����u#���D+V�.t�B�gA<���u���'�J����8�-�&��tNwc=�nq�e����;�"�t��F׭����b�ի�L�w���Viy�g�1�f����I��}1�[;��?�DYp6��l��FM��E�:!�O�6��ZVD
�^�
=�X)֛{dLc"x}�B�=���׮y�U��TN1y���͜�r�Y�R�;��,�K�D?�Eқ&������e��4U�9R�3����f�0F'-�-F'�ͣS;�#�ѐ�ե����6&a��[LE��7O�� '#��Q5�[�J�z���;wh+��i�H�((B��h�s�mZH�z�� g{�T�u P�c����|@�7y���퍙��V~	��:5��<-uwv�3x���9�>ӛ����f+�f�ǡ,�<�N8�P��i��2B✈��yW�b3tLB�9�1��
�_(Z����c��C<^-zQ�D��o��Z��/�"�&`���(�D�xk�s:�Uh$�a��P��f2�{e�傺�U�$���\CΩ��:zH	Y߃��.$0��uL(j�2�xG����3{�{�G0R�����<Q����n��\����*�4�B0@�@l�\�0؟KD#;^��y��-�؜Gl3�a) �I��bkI�T��Li�i�ʾ�Z˶E��O����|	���z�.W�V~9^J��m����Y~L�ఘ6�7M�G��?��������IB6����Я>��$]�);����W��N� g������h�V4ˎBR�1e&���brz�Q4�a�8R+�"�j0�|��	�r�ƌ�Z������7b*�y��F�08p����S�C�q�6G����Q�L������T�.�~A&��3V���(�mU�Ҹ1�3���{�䗮�FL_���tu-�i;�w�5�]�_�ͯn�4�v���Ϭ�.�44+�bv�_��/?&[�^��B�����[�/��X&���
�S��۱��{�a�[��&�b
7,�Թ��S�y8G�$���u8��ԕ��	�j�u��3v�+�a���2v-������Y	�]��n���Z@0zy܍���ɨ�6C��A� _�*�dC����'u�-��h�������;-U4$��Gι?^�2 ��R<`�����M�ʀ�z̀l��*0���a�O]=� ����{Q�uiU��(%8��wlՠc�>����7B�5,DK�cix�KS[��\���\���o�.���V`�G�7)PÚ�[-[�f�)H�S�y����
87E�v�L}c�ß��ӻ>`l(���p����?u/V�d2�t��������?�O�I2���2t�6ף�5��Z8��S\�;��i�u^LR6���X
~q!�C�u�a�P�	����"1�c�E����s�+lhѰ	��bCug�7����]����V\��~�QQĵ����x���'Y-	��)��0�ڝ��HԂ�.&ź��J�4A�%��H�z'�3��	F~���\*��    H�袉Y�r���6-�n���q����9�`���nWn�?�]�]s�$d.=� ��p�ٹ8��o�T����5I�,k�v(V`�"8�|}`�j��'�LF"����X�4�颃�hcP�#z�w��"�s��FI�O�v zI�8��+�p�g���N�;s]h4�S�>յbgmL�tV
�J��T@��gÅqS�Td�ԯq��r�%��c���iID� ��ׯk��=�5v��|I����G������U<ND`2�7
�t����I�gg�OF���o���H�-��<2a��]I��2M��t��{18�|+���R�A�n\�j�0n	��B�3Z΂�}4.��:cP�P��<:�?��,��%á����u��ܵ�'��p_*��� �FD$
t/^�VCyo�NFUjܴ.�>EhK��\^��A|Cd_��b���WQ�h
�}��~0-;k|a�>!�F 0���(�1W������I�&�[�rws���9OM�2sza�5F#7~j�`� S�C�8m��-�	�5���c1e���?�դ���(��5%r3�0�ʹ,I�G�1�u��>F����}V�p()��6�_�pX4D@���	�"_�E�6ĐBHrV0�#�g
� i�9@�{�.�~@�U� [��V"������܍G����>,�c:��^��|'Ľ��>�����V�Q��x,�j!��I2S�l<:�=�������/I�EB^�k��a؄����0h�FJ��	�E���8�Q�܊9p�-7��.�=�K��)��j��a��y���n���W�s�������y�{���-�{r *R(�&=��ĩ�Ad�i9�oS��%���A׌Z����*�l�U�����a��6ճݝ�;�^n'��������΋��E��A��;�8&Z2܈���`��pr��Cg�1�j������"c�TÍ�G.�'Y�: �L<2����4�2i����[�Y.-nm#�MAݢ���'�)�MsA��j;����g�������A�Y�C��,��lo����/^�Kz�V�1��80�IB��
*$dt��BA䛇�#d�ى��)�-��� 8�0����!1�P���}iB��QRf�HAC\r����](���4Qإ���Y�=�0Da�6�PDaV��bD1����$U(ha�B�C
^�@�E
�FL��+6O
~ o��Pi�N�w��vȡ��jtp��J' �bA`|�����|sk���� � x�s-���"x�p��l4��rU)$1��m�T�w��<�s�(ӛ��[��k�����Ș�p����MX��eZU�A�?��-���CI�ϲ���Y:�K������+�����|b[�}�!B+\���)���m����|�:CW('��%���s��]�_�J��5 |7t5�w ��r�^��x�KR׍r�1�9�<;�\ĠzXNoK��p�0۠�-n��I8�'���P�|� �wI6Zڸ�VG}�Q�Nb>M�{�|�����["%���[^7T�*g� �ߍG�c:�T^�I0�t0��k_ە!.�#$6.��EEq��ŧ����u@}��_#� ���:�rj�,y9���_p5ڈ]��Q\_{�p\����yV�������nE��V����8l��Cf~��{e�������]�M�é���7�L���"��A�I��S�M=(e�����{
H_�� ������^� �����L�{p�bHf%��5p񶭃{������HtY�,��,~�͵�.D�����c������A�u���>ӆ�C�[x�.����n������8^��V~�w� ;}n�y6��|Z]�Q��8_Or���,�"k�fq��xk��M�Df�L�ܔ��1�Q]\�&��W��mM2D��C��gҁ�NfEmE�gY>�2{�<��3�Z�D�\��v�t+�BZ�kQ�n�(�[iY�-�T�w�f�䓽h4**�4ĺ�S�̘V_E.I*m�p[@L%�>mce��8�I8RL�7`eg)�D��,/M��3̼y{a�G�b�*�H��GgbV�}��x �baG<텑V/+��3D�!w|���"��Yi�ցD��)���$�dd,��!U@؎>�c2ZU�%hY�݈�~�tSj�6:�ʨG̝M�^��I��j�;<M0l��H�������ؒ��F\wm�us�9�aY�陞�(��VE9�FY�Q$Ф8��*Rkg� �%E]n0�����*�ݰn�}]��5��(sq,U��t���p�
 q?"�0΍777�;܆�����7آ�sb����@��.��4�<:*�Xw�����������?����R�1L�m�����S}�X���|�bS��p)���K�m�>x�0�ޡU�/q�l���r��֞c�O�ݡ�_2�����Ą�T��+S3Og�yޣu��=�w
�~��oΘiH�G��t����2�C�!��s�� �9pd����P$8�������}�`��4�V�6#����t��Cg�,���y"qs�#�I̭�����9�3$���S[�CsH�(3^eǰ���!/J-Ŝ3Qf}r�yʴ���3l��m� %��Q�H{36�"��N.�K�e��U�q�k��S\o���z#����W�ޘ��zSKŨ7j}k��F�o�h��Y$�l��j���S��1+����&τ���l�%[�1�vcH���z���YX��:�x��!�l�7��o[C�s(�Y�h4�"����fc(�mk(dW�-�]�l5F#ۍ��vc<�}k@fh�;~�j���E>��X����I�@_��/��&�G�g�@�c�*E��?�d��tڸP�?�6�\�pfNx��� �ʊ����qo�Dϖ��B�Q��lۙ�8��4�'�?w[��Ư��خ�0&�q�g�GA�A���Y�Z��=���-�ќ�Y�6:�U���U�@�Y�@����GV�L�����w�3���=͙���Z��g���Y������Y_f\.�����Ҙ$���V���y�4�"�f�aZ��'�V��U��{Π��qQ1�ĥH�ۆ�B��=^�2*>yh���
cM;	��z�6J���rô�4t��E�}��f%x)��b_s��]��Ξ�b��J(K#GYCWTq����8X�WVYP���Y�+�Y^\�E�`*VS�쮖�j�'��Q9�I�EB8Oa	�(n���0Lj�!OO���x���0�?F$
d��5W�S^ϦϰIG亳�rJ֣�qԪ�y&�i.��Jq��SȂȆ��!�ׁ��ӌA��n�iULKHM@�Mљhb&?
SD��T� ־����'� KFjy��^i1���677_�v�ex��җ�n.�|�j�d������H/������:��w����cLN�8������R���֛��K�f��;|�_��o�^�u�a0-G��]Q�����ʽ�e杹Z �p|�Xg���:�����.	���Tf���J��^9"�V�+G��#��a到rD�ZW���a到rDx��#���a到rDX9"��4tǬ��B�v����VBYo�>�v8�z~
5av+?6ϕ�Bx?#�u�2%lm�<G��q1!����P���̲0�T���Ѕ�����u�q��lB�Y>M��P�ĝ�t�Zo������}V!�R.��drogN�Kӱ
�-S�ɠ�xBU~�!X9����!��%�"tN,��6����
�LW����\g%�Y-�r���p'$�H9���$E	�B'(�/"�m�Yg\���t�e�w'�r��sC���OG�Ra�} ���Q�(
SA�����|�u��g28�z�Y��H� ZG�ZջSE	>'}�6�����=D��"�IE4f��p�Fn�1������B¼J+��͸G��K�q�����7��E�oҳ_�"h[U���t�*@D�x3 b�I�p�D&��E�h2���t�F�6����A���D�AX�����x���3��Y{���#f�QN�     4�R�ҧ���W�����/_>�M�W����6�m��}��:M_mRZ�2r� �����0�8Eh7��r�XU���
��uQ�P�c��*on{�) �-��1U������l����"yI|M�"�uz�;zwB�@BKBS'Iq�>T�������BM����E���B�B���z�k��������O��O�c��J-����r�v���֦����wE]mz6� �q<HF�)TA��Iu�/rҁK�䠂qk)x<	mh	&0���$�����̓'����']�΢l�n��I1IF��ԭ����{������n�A�Y[�6�ez���t�	�`����=F�CZ���u�Ispc�&t �2���!}d�L��m:��vP�uOVLp}Nn1: Y`AA8L�I9��~�.C�P��`���?�M��7���{˺>��/�q}�ʏ�>/����
�?�o���{�knWߞrW1׷F�ܫL}���s���A�\e�U~�F]����eZRt\bWH��{{�<�qFp�L?�	����T�rb[�����/���#Dp�x��O�̢������E���k�@���~R4~��'����_�$Q����D��C��(�>���������C��/�%�㬗WӒ:a���,��#�+$���>�p�&U�}J��n2�mZM �T���$)���m���4ɿ�W�Z��@���k%__]}OS:��Q�",]6=�*��f����z-*,Sl�zB���U��xv��q�:.r��H�:~�IP�m&B_Ķ�/���F��'G&�t�*Yx}��������]&`J����ɷkjmz9��q��ݝ�4��H�۳^��d�7����/TSz �
-���qsd+@�WO�
�v��iY�!���JF@һXJ�� ɧk�I��b�>L�@Ut!X�K*4�-w�
56� w[rx �������n H���47� �'�a9 ���!�DyJ��À
A
�u`!H��^��;G���`B,#b	)���Ff�(�@����"��)p��Q��
`�eE#��
f�e֢6�@
"���!A`�Y�H� �B,�ET��4�5� ���Ȑ0�B,'R�XQ-Ģbx!������¬.b�iU�0:	*��J`!�U��jdaVT���\5`5��)`�XK+�R�q�YI.�B*�A��D�B,'bE���Gf]� "������$� B��DJ�Ђ�Ijl��$	0��e��4���K6̐����\l5䢣��]|8�A�a@�Xr3�?��H^���S�b9�da��XNGڅ0�B,��S��`19�K�A�XH*�2�Q�YD-�jU�@
��F� �B,��%&8��2.J���O���|{�U֛TV2�����c�5����F*s��"�k�R���)�mJN�������U5�,�Qu���/{g�?�d�!\�0�'��!�ٰ�Djz�Dׄq�D���Vn\�4�E�e�32Z��y8�ƫ*��vBGqȂ�Y�d�}���}������%F,c�Nz�n��1����>Tݽ����q�x��>-#B�0.��-��\g�G�;�;�[[�I=�5I�5�V�Ъ\eL.@�]Je�3�<�/ݦ�1��֖=���=2X&̺^B�¬�M�\�u},��x�l��c���?�(��{
Kn?��rG4�(ОhX�EwE=� ������=�劽)��x���[�ȷe�eP�][�F��SI�v�$䜹O;��2�sc<�	Y�%��V�����!A�M�*%�^~�f��%TW��$Q����p
n��3��,��J�E����dqCL\��r��Hi!H���D� b-0��E�/�\���6�ˠ[��dk��$��gR<�=%Owks=�^�{f��ͳ�x����0XM��4'DR~��)�$
ɴnF���R&�eAx r"�G���#��<@zV�pԻz��.�[r�z�ǷD�.��2�˙�$�򰽽�%r�mw'+�S����XJ���p~�L1�w�����G��K�]D�UE�w�z*���SXF��k�@��I��e���-,+s�C��~R��2�%1�k"mM��CB��w����#�AC��<ͩC>��<�Љ��d:�0�}#�ɑ0ϴ�v{�_�v��(��q0B� �	/��i7��!�!�E6��Xĭ'�BFz�F$h�5Mi�����i�KI,���:7�(�1����L� �`�&�J~p��=���aq�wxtu�']C�|='P(��G����z����������ߣ_B�a�kLn/zN����>�X�l�O~E�iU`�t)�^w�
х	Sh��l��(���>&���(!g�Y��q��\Tn:ʘ���0û1b��ѿ	��J����l�$���a�!��������x��w�q,�~w;�cؿ,�b������?��_���G�N��c������I���k5�IR�*���y�:���������.���}�����9��l�?�����wrxJ᝾}˿�y�����%������O�������A�����_z+��.��������p�z�c|L�L�QD}�p|t���"��? G ���R !��}8;:�ń� �yK�
Ғx7���� -��Pp�r��ڇ�WS&��:��:���T��;o�s��j���� �:�|Y3*�����3��0�$و���pѮrL�mN�_h��ng:tD~��x��F��5���7��Q�ͮX�us�2CeK��"#�52=
�f�! ���APk8��p�����Dq��AR�a
-<sGN�JTK��P7R=��jg�-5�&S|{&X�L��y�Zb����tŢx]�``�&�\`;�t��@ǒ9�ҵ�p��&��I2*rKݽ�|w���< ZV�`Q΢��vO�7�a�J��B���9'H]MY�O�C�����*���ļ�/��G����R<�@d��O��9������w�yx~y@(��?��?:���;;z{D��6.��B/e:J��M�zŢ�A�f<�	9h��V���|T�p�?���&�;{D���9&h���A��"|�L�`�B}|��9 jf͆ϩC����֧[f77���`i����O\���X&K�����l��F��T��S��@�jDF�b8�t�s�`Z��i	��Ю��8�9r�]�JS�|D,cTIy]�&��6'�D}����	�8L�B���[�a���𣝝봕���W��&����A��/���)�FFvp��0y6è�,O�>#���Ż���a�>;kp��Y�s�{oԾ�U�����ϯշb��*���C"S���/@]cm�BIG�6D.�7Q0��!F��%�0����kET�n�e�g㎓���ǔ���^$��	RѤy35����dp�5'���4�K� �,�Ȳ����m����N����nA;,�U��<'��7�P�41}4ҿ�Wk��W@�R�����y�[G`��@�:|Q���T���MP�����͆>�#�-4�g�#��߈� �i�2	�_a�\��n'�l���еa�r��LXt~[L��Z	��)S�0�Υ�u!
�/
�J�.� ���sqb"�.� �B|���F�L��0B�[�С+�K���)��bq*�Z�v&5T�Kh��w\c�l�ŵH�Y���r�	�*�s�E�t���Y���$bY�@��k�G>�Þ��̠HFi5H��)M���!����u��#�q�>J���<�W*
�j��%�;�`�k�B8� ���!�C5���S$�N�
�A�^���1#�X��5�9	*�A��e��X�ߖb�=r~��k�\�h����i9�0��%p��G9��)�R�x�U�@�U�b��@~C�1LXR_r�m��l�Q���\(a<�D	/�z1=�/�J��/Yg�]qONE�f'/��#$�	������J�C���.�osۯ�X�t�aK���YrdKȑ-"�$��X���B�#y��B�J�С)��SA �
Uz�4��$5 r|     i�͌]�|�.�Ӱ���i��Ծ�	�~<��D�
n���Ƈ��rv+��$X�( G��(���L|&���챘��$򇄚�n�Jh��}��Rٷ� [@�ĄZB38�ə�*s�{Ėooϥ�]�C=���-��T91Iޡ����^U��w D�����k�	������k�$W�*Oj��z�)P��,�<�����0�0m�W�B�X�;�0@&
&)x;5�V`7�U�mRAɲ����H"c�4Y3�7/Q�Yp��(����2�=
�Q�xn	
*�~r�x�eF��4����w�@�L�bZ�~�2r1�
H�br�CQ~�pZ�u~c��1V[�^X�Q�{{MD��rg��r��,���[��-j�G��`�N�����-������rCR�F�� ������x,r�;��z�6�j����	�28�'��������{}�P��g���ݷ�czZ�X2"L�
x�a�'D� �=ǮO�i�ބ֟�&\�po�מ�_lo?1�(Qe��I>���zԟR��!j�
7��8.�����f¿4�f:Ȯ��\a�3Ģ/`�"{%��ԫ��%�#)3!ȃ���+S�g�!LiQ���g���>�T�;x:�&�$����jkkAN����jU�Q�'K�'o�j�.�-Fp��欂�.�A�����	��nG�C��9�E-Ƚ=�pd���@f2ڋn��G�4a���U���s^6�x�V�� �r 	�7�)�NB�s����.�TҔ�'�13p��-����ݹ�f+0��';�5y�7���գ�	D4��0˜������l���#�u^G�&=���É�MZ<i7Fan�d.Rocd���L���-��ET=H�	GF��fh�'�����A,�+J�W��P��y�=)&��_*_������e(����z�b(,c\������zD6+���1�Z�TU𨐕�����V%���g_>���bG��W�DE+�)��%-G�1-��y��R�Ŵ��&��������v�*F�	VH�� � �$���Ql�������s�ކՋ��7�_�E�u�� ���>�~����b���{��+6�1]�_tV��hT+��<8���P�ӱ�p��eT�I��}����ҰХ��߳�t.�2�0J��5�&�.�M���k������0,x_��.ط� ����
k���wS�&�^���޾��p=����Jn���o��f�,�� UN��,�J:dKz`�%0P5��S������UJ+�Q�V��T���6]h�%a��U�%�g�����N��#�]i`�^t\�p��$#2.l^p�	�m�����֓�t�WG��X����0��~X�����+��n����Hz����R��2C��N��-<U[�;+T�C�����_M�	���s��p���ߋ]����H��7���*
/�`Sz+x.�*�ew���
�����m7����`��1�5KW�)�R'�^ӻA�9B�{MlQ�����ɿ�X�O s���$���1�d����zi�w&� ���R�ä.өDe;�EUE����J�%�a�F�ģG��T�v9�G� HF�Sh��{|�{UH����OG٨G����6��V�<�ᑪ��<������r�N!N[�2�B�W��YΜ����Pԁ�EMdV��yC�`]@��o P��d�'L�c����@��;=;$�!J�k�#�s~��������k}jK�������2L9YcL6�l��'�����ν��ʶ ��d����ﷻ�[o? �h�����Σ�w���B���eMB����F�k,��3�P���j��ή�r���H��Q����yx?��=����Q�R3�#?��������R��ܹ#g@<����	^����U�{7ɧ��یxSl���A�`�SңO^QHQ�'y�IvU=��g�i�rˎXb\,cJz�
��T����Y~�2�e(����dL�RN�k��BI꒘I� ��.��&�������t��K҂�|[�^>S�#��_B#,'�L��������Ɇ�\0%�>˨s���`!�����K��8�o�&Q+6�\��H��C{�]�Їŀ�8x�N�Q�3�]��#�r�OԲčPu�؜�9��7i�kG�'�����%��<�p��*eӡ��?�ʹ1o��F��c#4���D�=P�7�O5�_ɟ��
���.)��d8�������܇��xJ��T����<��!бó��O��7�_1O�&NL��T4�=4�B�
��ǩ��.����g�D�,�^�y��Jؕ�z������~��G�#;-�N��x� <���6�=,����'��E��ʠ	JM���Wv�WT��fq�����b�?/=td��S�2L)�rR1������9s�\s`R�c ���)"P�ֽc��y��@R[��J�,��\:�Æa�hn2��T ,s�ɇ�S+���E��ǧ�@��z�l�H��2����y1�����֢=�M�"͜<�p�(�YM5B;63LH���pW;Ë��3�e%v����Q�l��yl���n�>�[>�Ehkޗи�5Ir�~b?�܌�Viuzܐ(�(���/��R+H������=����@�g�`}�h�T'f����HZM���>(�>�ů������>8h�Ā!^Ժ�,�!��v�F�cou쭎�ձ�:�nձW���d��_CU8�oكp��w}"�+�u��	z[rF���a9Q�|�Cs��K��tC�8@�S�u�*@% �����g �b���+�Q�d�{�*H�d�,r�I&��(�
P�B�uC���F��y��߻i�h���d�"â�-[;��h��0Vc�;�g!��*��m����
},���6W��RO���%�ǡ����}�,��h�ɿ�2?�e�>u�5�& �7��R�گ�K�����-�/�L�fӴ��ov�<�D�%ntO��T���0���ͽ&+ԋ�3�����6w����-��	��i�#Ҭ��7��^��oӆ�V�eb���1�bdu�,�*��c�<͠��}�Q˷��τ��zW���nL}�g��ݿZ�
������>?�)�Qh@�#>8�E�G�V}�߫�{cM����?��eva��$�P
��o8k�&`BC�f�
�������LӠ�%���e0���VuhF�E�dj~6~�P���8���L�&�{�{a��EJ��)��+�����ٟ-�_�ɵs�+����>;ߕ\��JMr82�K;���n��)��륙	k��W�ua��p>�Յ��R��]��>&���V�H� +�:6�}lL�g���Z�o�ڮ��ƚ�-����c�N�FԄG��8/��c�L��#'�=�ٔ�,go�J������9������8R��dP�f@C0��@颔}|tr����4���	Ч 1	yQǉ�,G��J�9�(&.�wK�T�"��T�����ͽ��{gG%��և?�8���B!נ�g5�V2H7�N���1��[�X�i�<���n�cg@Ч�-vI 0�e[��c{�9�K}>=����J������3��;׹��{OS8�<�z�Y�����2���ڝ�}���(/u�m�4�T�R�a?Q�3#��yjc·�Ɲ垟�p�Z�+-֦(�y���<��)Ѹ�)y��e�4qC��S���i[eɋ���2S�Y�(#�F���RL��/��0�wed�̤�Z���K�3��+}/Ƚ���U�_/+�K/����'��*��d͹1�3���}|���y{���1�p�}��?ua#>��jI������,�{���~����T$�h � &'w"� =�����>)��X��Np̬[n
�]��g�L./�te~<�J��Gi�ӹ>M6�����y��.�K� �X�K��r$��4�Z�&,Gn(]��q��$a��)ˠ���5F�$o�|�ʲ�h3vR>#{� �  �{Y�����C+�����g]����ks�-�֐��[0��ZV��R�2�}g.�$.�^k���%��7H�4�>����4.��E�5+�
���"b)������,�1R��̢1�O9��P�*M�O�G��Pq|quR݃|K� ������4ې�ž3uh����m�WY��m�rp�S�U*�Ra�
�TX�a�%||���
�<��L��V#������ą�^��
�T�B'�:9<�vz�IJ�-}�w��BX;���}X�1�jF3zy�|f\Ϫ�lΉ���l�f��W�`Z�����@��,�[�wtگ�@*`
a],��l`�����+a�g��b���c�X6�
TX���>�����N�R� S�bNe�� clE, R�����UX�sR�����dB�
Tp���>���v�����B�@��uA�"�}�@�"4В鯀4ͫ �b�#�Z�����n*�P�
 T �� �����
���օ�����؊����$�V��J!h�5+�����*sA�*4P���t���ӫ�Ya	L%����l ���{��^-�@h[��g&�`׾���1f�;���T,���!�1Yֵ6c;��6�mL�R�'^����|v;���;��3�`vA�}����<]�E�X6ǲ4bQ7�af7�Aj7�jaQ?�efG�EjOz΢�����imR���Ea���a*i�7[@����?O�CU.�E���G�H�Iz����e���!o���2���S��M�ݨ��=�&���#OAW�afG�A��J�q�%� $LLI1���	u�ݫI7JR�9�@��^��w��-�c�1���8�l��)JN�|���o�Ej�ߺ��sDg����v�L��4|B(K�W��3���w"?�'R���j=��U0/^nw�;;g'@�^���HQu���-����YS��@�;�����"=���k�96@ƬN�(�G&{���"�,wTׇ4���
���!�,E�bjf���EC�����W�@T���.A�H���ؤ���4&i���aCQ\�ʡ
h�F���e����%9?FN4*A�7�b)�ݙԸ-A�T�hZ1θ�,A�q�#�ݛ�<,A�f�&=!�r�a�G.3��-@�ǝ��ϧݞc��Ս�dG�Fo/��5#	\�^n�_��S����-����Wp}[`�?
�������_����+~�+|!Zw����9_k�/��֒u�o��!W��3��^|����h�)���Z"�	�w#�П{�OD��Z�ҟZ�$��C��I��D�R���4�ҍ��Ɣd�֓�e��|-'_�QwEZM��Qo�ZL�����|1K}�k)�z����J��������@��׳�O����g��J�TZeZ% �PB�4�תgٽ���vV��O�/NzT���(G~�|�����3p��\��$���{SK�pIŨ4��4��s0So�Y��>J}M+�5�V��Ϗ�'�oY8��v �t`{x憑"}�$MV���	g��Cw�X����d%p���};�P)�C��<_O��d���)v_��;����)�G� p��bEvs(O�ݭ�#��������U�����yC�m�?ݘ�8=�*~�z�N`�b,h�K���`��x`���-3�i��f����Rc�yg��(OT��ۗ��N�Ͷ�����)g��Zơn�p�|A۾;u���*X�e���'Ȉ:G�7�JB�H�H�1�1���X[&��jGȫm^��}�c���Ѷ~���I@��ovx5ӁY�s�{ұ���ױj�5R�C���|N�э�T�{8*W�9�$01���?�C����q���0>:��2O}���`��jU�ˎ�u2���A۞(��VAtf/��b1��ҡg���צ��L��U�=onOj�ev�eJ�NO��^-��B�}�}G��һ���*���s�{���n���]�v|0��P�ikg�L�x'\�Q�7���D���v��\ Z�|�`B���ͧ yF;{������p4JLL�o��Zp�P��V2~�vj�hҗ��������x߂�ͮ��ş�{0���i��K�\[1K�6�����gN�y��$�I馞X��DI���L��Ҙ�������>��;ݏ=Z�;� �� "�wء���wр��=��(�_�z����E��m�e��vn�����?�&Ŭ���;K�q=��I��+�a	��0��I������l��rY�?}���3�YP=�S����?��Á�G��88����yx3�.BDs~��aus�Z���Zy9�t����%VjCE�>%&�7C�yOm��雡�|ł`5~)VQ�LB��'��5 ���I���\���0C�\]ω4�*NIq��;w�$T��aFNɀ<�rj	�"�:��$�K��7XR/k�,����g��K}�7���?��VڐlV/�WI�^W�ˢ��B��Lj�UzR��t�0]�W&-K�(�+�w��  ���ۄ�_so���Xp^6��M�Ak�@��:�Lt �:h������|��	��-f"�����l�n�s�ځ;YX���C��Z�7���g��G% ��(�J�c��Ƃ�����=(G�,bG�aj{6:�r���'�G��o��S�k�z�(b����C/R����-���m�r,�8���z����x��Ƭ����{&5/�G���x2����/Oj�6;���)�Fm�ǋ\{<�G\08<zo��n���1�1:0=�*CB��؈��>JX���{���2����N�h��[�$z7t2���R�=j-�SZ�IM�)9�ۓɢn�v���|���Z����6\I�D�&�h����Dd�Tٻx��渁��yl�p+_�&6�~����U(w�UoU�[U�V�-��:�  ��+[Dq�����y�������K�"w2�=,|�P�s�i��@��1ӆ���������q�Me�p��>�)km<Ҍ��M�ȁ�&@�(&l�a�M���Y�ݐQ%s(T� �s������\� �U�G����� �JU7�!��"��Y�=rC]zr� ���_O�k���=	c������t�|�~��ֱ�1�3�F���$[Oǎt��9Ғ:>	Sʿ�8<i^�O3f&�zl�d�-.�%T?�RB���b�Wo�d%����4uc4�oy�O����Y=�78K7�ss����f=�P�)��)c�8�g!��!��=�]�	Z��s�9J#�&�i��͔���,��K��� D��=|�'̹��'�Іc��6icEX��%"��'�����R<_��.C�`O��@ܿJ��[�xE�U����WW��]�K#8t6���*"2�߽s�Ndy}���{g�
�L��=ql�$pB��+d'��Yǣ�B�͛��| >���3�6�N�)�&Ei�K�W���'gF�gvJr���Ĝ��r��ce{��4�+O���מ���~(V2�(Ec���G�|�IJ�><�VZ����K�_g��a~�ݼ<�|���'���llϬ��y�1"�pf��c{���+ύ�Y��SS��홙R<�<11���R�l���e{#[Ǵ���m������P&<�/��_�;^�1�ǵ�ظ|��?�?�.,      �      x������ � �            x������ � �     
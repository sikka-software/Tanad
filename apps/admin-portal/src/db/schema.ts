import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
  check,
  jsonb,
  foreignKey,
  date,
  pgSchema,
  unique,
  uniqueIndex,
  varchar,
  smallint,
  json,
  inet,
  bigserial,
  primaryKey,
  pgView,
  pgEnum,
} from "drizzle-orm/pg-core";

export const auth = pgSchema("auth");
export const aal_levelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const code_challenge_methodInAuth = auth.enum("code_challenge_method", ["s256", "plain"]);
export const factor_statusInAuth = auth.enum("factor_status", ["unverified", "verified"]);
export const factor_typeInAuth = auth.enum("factor_type", ["totp", "webauthn", "phone"]);
export const one_time_token_typeInAuth = auth.enum("one_time_token_type", [
  "confirmation_token",
  "reauthentication_token",
  "recovery_token",
  "email_change_token_new",
  "email_change_token_current",
  "phone_change_token",
]);
export const app_permission = pgEnum("app_permission", [
  "users.create",
  "users.read",
  "users.update",
  "users.delete",
  "users.export",
  "users.invite",
  "users.duplicate",

  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",
  "roles.export",
  "roles.assign",
  "roles.duplicate",

  "companies.create",
  "companies.read",
  "companies.update",
  "companies.delete",
  "companies.export",
  "companies.duplicate",

  "clients.create",
  "clients.read",
  "clients.update",
  "clients.delete",
  "clients.export",
  "clients.duplicate",

  "invoices.create",
  "invoices.read",
  "invoices.update",
  "invoices.delete",
  "invoices.export",
  "invoices.duplicate",

  "expenses.create",
  "expenses.read",
  "expenses.update",
  "expenses.delete",
  "expenses.export",
  "expenses.duplicate",

  "quotes.read",
  "quotes.create",
  "quotes.delete",
  "quotes.update",
  "quotes.duplicate",
  "quotes.export",

  "branches.read",
  "branches.create",
  "branches.delete",
  "branches.update",
  "branches.duplicate",
  "branches.export",

  "vendors.read",
  "vendors.create",
  "vendors.delete",
  "vendors.update",
  "vendors.duplicate",
  "vendors.export",

  "offices.read",
  "offices.create",
  "offices.delete",
  "offices.update",
  "offices.duplicate",
  "offices.export",

  "warehouses.read",
  "warehouses.create",
  "warehouses.delete",
  "warehouses.update",
  "warehouses.duplicate",
  "warehouses.export",

  "purchases.read",
  "purchases.create",
  "purchases.delete",
  "purchases.update",
  "purchases.duplicate",
  "purchases.export",

  "products.read",
  "products.create",
  "products.delete",
  "products.update",
  "products.duplicate",
  "products.export",

  "employees.read",
  "employees.create",
  "employees.delete",
  "employees.update",
  "employees.duplicate",
  "employees.export",

  "departments.read",
  "departments.create",
  "departments.delete",
  "departments.update",
  "departments.duplicate",
  "departments.export",

  "salaries.read",
  "salaries.create",
  "salaries.delete",
  "salaries.update",
  "salaries.duplicate",
  "salaries.export",

  "job_listings.read",
  "job_listings.create",
  "job_listings.delete",
  "job_listings.update",
  "job_listings.duplicate",
  "job_listings.export",

  "employee_requests.read",
  "employee_requests.create",
  "employee_requests.delete",
  "employee_requests.update",
  "employee_requests.duplicate",
  "employee_requests.export",

  "jobs.read",
  "jobs.create",
  "jobs.delete",
  "jobs.update",
  "jobs.duplicate",
  "jobs.export",

  "applicants.read",
  "applicants.create",
  "applicants.delete",
  "applicants.update",
  "applicants.duplicate",
  "applicants.export",
]);

export const products = pgTable(
  "products",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    sku: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    cost: numeric({ precision: 10, scale: 2 }),
    stock_quantity: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    unit: text(),
    is_active: boolean().default(true).notNull(),
  },
  (table) => [
    index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("products_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
    index("products_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const templates = pgTable(
  "templates",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    type: text().notNull(),
    content: jsonb().notNull(),
    is_default: boolean().default(false).notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("templates_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    check("templates_type_check", sql`type = ANY (ARRAY['invoice'::text, 'quote'::text])`),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    url: text().notNull(),
    file_path: text().notNull(),
    entity_id: uuid().notNull(),
    entity_type: text().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("documents_entity_id_idx").using(
      "btree",
      table.entity_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("documents_entity_type_idx").using(
      "btree",
      table.entity_type.asc().nullsLast().op("text_ops"),
    ),
    index("documents_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    check(
      "documents_entity_type_check",
      sql`entity_type = ANY (ARRAY['company'::text, 'expense'::text])`,
    ),
  ],
);

export const job_listing_jobs = pgTable(
  "job_listing_jobs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    job_listing_id: uuid().notNull(),
    job_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("job_listing_jobs_job_id_idx").using(
      "btree",
      table.job_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("job_listing_jobs_job_listing_id_idx").using(
      "btree",
      table.job_listing_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.job_id],
      foreignColumns: [jobs.id],
      name: "job_listing_jobs_job_id_jobs_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.job_listing_id],
      foreignColumns: [job_listings.id],
      name: "job_listing_jobs_job_listing_id_job_listings_id_fk",
    }).onDelete("cascade"),
  ],
);

export const employee_requests = pgTable(
  "employee_requests",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    employee_id: uuid().notNull(),
    type: text().notNull(),
    status: text().default("pending").notNull(),
    title: text().notNull(),
    description: text(),
    start_date: date(),
    end_date: date(),
    amount: numeric({ precision: 10, scale: 2 }),
    attachments: jsonb().default([]),
    notes: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("employee_requests_created_at_idx").using(
      "btree",
      table.created_at.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("employee_requests_employee_id_idx").using(
      "btree",
      table.employee_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("employee_requests_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("employee_requests_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("employee_requests_user_id_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.employee_id],
      foreignColumns: [employees.id],
      name: "employee_requests_employee_id_employees_id_fk",
    }),
  ],
);

export const saml_providersInAuth = auth.table(
  "saml_providers",
  {
    id: uuid().primaryKey().notNull(),
    sso_provider_id: uuid().notNull(),
    entity_id: text().notNull(),
    metadata_xml: text().notNull(),
    metadata_url: text(),
    attribute_mapping: jsonb(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    name_id_format: text(),
  },
  (table) => [
    index("saml_providers_sso_provider_id_idx").using(
      "btree",
      table.sso_provider_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.sso_provider_id],
      foreignColumns: [sso_providersInAuth.id],
      name: "saml_providers_sso_provider_id_fkey",
    }).onDelete("cascade"),
    unique("saml_providers_entity_id_key").on(table.entity_id),
    check("entity_id not empty", sql`char_length(entity_id) > 0`),
    check(
      "metadata_url not empty",
      sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`,
    ),
    check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
  ],
);

export const saml_relay_statesInAuth = auth.table(
  "saml_relay_states",
  {
    id: uuid().primaryKey().notNull(),
    sso_provider_id: uuid().notNull(),
    request_id: text().notNull(),
    for_email: text(),
    redirect_to: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    flow_state_id: uuid(),
  },
  (table) => [
    index("saml_relay_states_created_at_idx").using(
      "btree",
      table.created_at.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("saml_relay_states_for_email_idx").using(
      "btree",
      table.for_email.asc().nullsLast().op("text_ops"),
    ),
    index("saml_relay_states_sso_provider_id_idx").using(
      "btree",
      table.sso_provider_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.flow_state_id],
      foreignColumns: [flow_stateInAuth.id],
      name: "saml_relay_states_flow_state_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sso_provider_id],
      foreignColumns: [sso_providersInAuth.id],
      name: "saml_relay_states_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("request_id not empty", sql`char_length(request_id) > 0`),
  ],
);

export const usersInAuth = auth.table(
  "users",
  {
    instance_id: uuid(),
    id: uuid().primaryKey().notNull(),
    aud: varchar({ length: 255 }),
    role: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    encrypted_password: varchar({ length: 255 }),
    email_confirmed_at: timestamp({ withTimezone: true, mode: "string" }),
    invited_at: timestamp({ withTimezone: true, mode: "string" }),
    confirmation_token: varchar({ length: 255 }),
    confirmation_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    recovery_token: varchar({ length: 255 }),
    recovery_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    email_change_token_new: varchar({ length: 255 }),
    email_change: varchar({ length: 255 }),
    email_change_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    last_sign_in_at: timestamp({ withTimezone: true, mode: "string" }),
    raw_app_meta_data: jsonb(),
    raw_user_meta_data: jsonb(),
    is_super_admin: boolean(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    phone: text().default(sql`NULL`),
    phone_confirmed_at: timestamp({ withTimezone: true, mode: "string" }),
    phone_change: text().default(sql`NULL`),
    phone_change_token: varchar({ length: 255 }).default(sql`NULL`),
    phone_change_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    confirmed_at: timestamp({ withTimezone: true, mode: "string" }).generatedAlwaysAs(
      sql`LEAST(email_confirmed_at, phone_confirmed_at)`,
    ),
    email_change_token_current: varchar({ length: 255 }).default(sql`NULL`),
    email_change_confirm_status: smallint().default(0),
    banned_until: timestamp({ withTimezone: true, mode: "string" }),
    reauthentication_token: varchar({ length: 255 }).default(sql`NULL`),
    reauthentication_sent_at: timestamp({ withTimezone: true, mode: "string" }),
    is_sso_user: boolean().default(false).notNull(),
    deleted_at: timestamp({ withTimezone: true, mode: "string" }),
    is_anonymous: boolean().default(false).notNull(),
  },
  (table) => [
    uniqueIndex("confirmation_token_idx")
      .using("btree", table.confirmation_token.asc().nullsLast().op("text_ops"))
      .where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_current_idx")
      .using("btree", table.email_change_token_current.asc().nullsLast().op("text_ops"))
      .where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_new_idx")
      .using("btree", table.email_change_token_new.asc().nullsLast().op("text_ops"))
      .where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("reauthentication_token_idx")
      .using("btree", table.reauthentication_token.asc().nullsLast().op("text_ops"))
      .where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("recovery_token_idx")
      .using("btree", table.recovery_token.asc().nullsLast().op("text_ops"))
      .where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("users_email_partial_key")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`(is_sso_user = false)`),
    index("users_instance_id_email_idx").using(
      "btree",
      sql`instance_id`,
      sql`lower((email)::text)`,
    ),
    index("users_instance_id_idx").using(
      "btree",
      table.instance_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("users_is_anonymous_idx").using(
      "btree",
      table.is_anonymous.asc().nullsLast().op("bool_ops"),
    ),
    unique("users_phone_key").on(table.phone),

    check(
      "users_email_change_confirm_status_check",
      sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
    ),
  ],
);

export const sso_providersInAuth = auth.table(
  "sso_providers",
  {
    id: uuid().primaryKey().notNull(),
    resource_id: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
    check(
      "resource_id not empty",
      sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`,
    ),
  ],
);

export const invoice_items = pgTable(
  "invoice_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unit_price: numeric({ precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    invoice_id: uuid().notNull(),
    product_id: uuid(),
  },
  (table) => [
    index("invoice_items_invoice_id_idx").using(
      "btree",
      table.invoice_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [products.id],
      name: "invoice_items_product_id_fkey",
    }),
  ],
);

export const job_listings = pgTable(
  "job_listings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    is_active: boolean().default(true).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    is_public: boolean().default(false).notNull(),
  },
  (table) => [
    index("job_listings_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("job_listings_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("job_listings_user_id_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
    unique("job_listings_slug_unique").on(table.slug),
  ],
);

export const offices = pgTable(
  "offices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    code: text(),
    zip_code: text(),
    phone: text(),
    email: text(),
    is_active: boolean().default(true).notNull(),
    user_id: uuid().notNull(),
    notes: text(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("offices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const flow_stateInAuth = auth.table(
  "flow_state",
  {
    id: uuid().primaryKey().notNull(),
    user_id: uuid(),
    auth_code: text().notNull(),
    code_challenge_method: code_challenge_methodInAuth().notNull(),
    code_challenge: text().notNull(),
    provider_type: text().notNull(),
    provider_access_token: text(),
    provider_refresh_token: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    authentication_method: text().notNull(),
    auth_code_issued_at: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("flow_state_created_at_idx").using(
      "btree",
      table.created_at.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("idx_auth_code").using("btree", table.auth_code.asc().nullsLast().op("text_ops")),
    index("idx_user_id_auth_method").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops"),
      table.authentication_method.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const identitiesInAuth = auth.table(
  "identities",
  {
    provider_id: text().notNull(),
    user_id: uuid().notNull(),
    identity_data: jsonb().notNull(),
    provider: text().notNull(),
    last_sign_in_at: timestamp({ withTimezone: true, mode: "string" }),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
    id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [
    index("identities_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_pattern_ops"),
    ),
    index("identities_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "identities_user_id_fkey",
    }).onDelete("cascade"),
    unique("identities_provider_id_provider_unique").on(table.provider_id, table.provider),
  ],
);

export const audit_log_entriesInAuth = auth.table(
  "audit_log_entries",
  {
    instance_id: uuid(),
    id: uuid().primaryKey().notNull(),
    payload: json(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    ip_address: varchar({ length: 64 }).default(sql`NULL`),
  },
  (table) => [
    index("audit_logs_instance_id_idx").using(
      "btree",
      table.instance_id.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

export const instancesInAuth = auth.table("instances", {
  id: uuid().primaryKey().notNull(),
  uuid: uuid(),
  raw_base_config: text(),
  created_at: timestamp({ withTimezone: true, mode: "string" }),
  updated_at: timestamp({ withTimezone: true, mode: "string" }),
});

export const schema_migrationsInAuth = auth.table("schema_migrations", {
  version: varchar({ length: 255 }).primaryKey().notNull(),
});

export const sessionsInAuth = auth.table(
  "sessions",
  {
    id: uuid().primaryKey().notNull(),
    user_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    factor_id: uuid(),
    aal: aal_levelInAuth(),
    not_after: timestamp({ withTimezone: true, mode: "string" }),
    refreshed_at: timestamp({ mode: "string" }),
    user_agent: text(),
    ip: inet(),
    tag: text(),
  },
  (table) => [
    index("sessions_not_after_idx").using(
      "btree",
      table.not_after.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("sessions_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("user_id_created_at_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("timestamptz_ops"),
      table.created_at.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "sessions_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const refresh_tokensInAuth = auth.table(
  "refresh_tokens",
  {
    instance_id: uuid(),
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    token: varchar({ length: 255 }),
    user_id: varchar({ length: 255 }),
    revoked: boolean(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    parent: varchar({ length: 255 }),
    session_id: uuid(),
  },
  (table) => [
    index("refresh_tokens_instance_id_idx").using(
      "btree",
      table.instance_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("refresh_tokens_instance_id_user_id_idx").using(
      "btree",
      table.instance_id.asc().nullsLast().op("text_ops"),
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("refresh_tokens_parent_idx").using(
      "btree",
      table.parent.asc().nullsLast().op("text_ops"),
    ),
    index("refresh_tokens_session_id_revoked_idx").using(
      "btree",
      table.session_id.asc().nullsLast().op("bool_ops"),
      table.revoked.asc().nullsLast().op("bool_ops"),
    ),
    index("refresh_tokens_updated_at_idx").using(
      "btree",
      table.updated_at.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.session_id],
      foreignColumns: [sessionsInAuth.id],
      name: "refresh_tokens_session_id_fkey",
    }).onDelete("cascade"),
    unique("refresh_tokens_token_unique").on(table.token),
  ],
);

export const mfa_factorsInAuth = auth.table(
  "mfa_factors",
  {
    id: uuid().primaryKey().notNull(),
    user_id: uuid().notNull(),
    friendly_name: text(),
    factor_type: factor_typeInAuth().notNull(),
    status: factor_statusInAuth().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    secret: text(),
    phone: text(),
    last_challenged_at: timestamp({ withTimezone: true, mode: "string" }),
    web_authn_credential: jsonb(),
    web_authn_aaguid: uuid(),
  },
  (table) => [
    index("factor_id_created_at_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("timestamptz_ops"),
      table.created_at.asc().nullsLast().op("timestamptz_ops"),
    ),
    uniqueIndex("mfa_factors_user_friendly_name_unique")
      .using(
        "btree",
        table.friendly_name.asc().nullsLast().op("uuid_ops"),
        table.user_id.asc().nullsLast().op("text_ops"),
      )
      .where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
    index("mfa_factors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    uniqueIndex("unique_phone_factor_per_user").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops"),
      table.phone.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "mfa_factors_user_id_fkey",
    }).onDelete("cascade"),
    unique("mfa_factors_last_challenged_at_key").on(table.last_challenged_at),
  ],
);

export const one_time_tokensInAuth = auth.table(
  "one_time_tokens",
  {
    id: uuid().primaryKey().notNull(),
    user_id: uuid().notNull(),
    token_type: one_time_token_typeInAuth().notNull(),
    token_hash: text().notNull(),
    relates_to: text().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("one_time_tokens_relates_to_hash_idx").using(
      "hash",
      table.relates_to.asc().nullsLast().op("text_ops"),
    ),
    index("one_time_tokens_token_hash_hash_idx").using(
      "hash",
      table.token_hash.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("one_time_tokens_user_id_token_type_key").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
      table.token_type.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "one_time_tokens_user_id_fkey",
    }).onDelete("cascade"),
    check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
  ],
);

export const mfa_amr_claimsInAuth = auth.table(
  "mfa_amr_claims",
  {
    session_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    authentication_method: text().notNull(),
    id: uuid().primaryKey().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.session_id],
      foreignColumns: [sessionsInAuth.id],
      name: "mfa_amr_claims_session_id_fkey",
    }).onDelete("cascade"),
    unique("mfa_amr_claims_session_id_authentication_method_pkey").on(
      table.session_id,
      table.authentication_method,
    ),
  ],
);

export const mfa_challengesInAuth = auth.table(
  "mfa_challenges",
  {
    id: uuid().primaryKey().notNull(),
    factor_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    verified_at: timestamp({ withTimezone: true, mode: "string" }),
    ip_address: inet().notNull(),
    otp_code: text(),
    web_authn_session_data: jsonb(),
  },
  (table) => [
    index("mfa_challenge_created_at_idx").using(
      "btree",
      table.created_at.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.factor_id],
      foreignColumns: [mfa_factorsInAuth.id],
      name: "mfa_challenges_auth_factor_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const sso_domainsInAuth = auth.table(
  "sso_domains",
  {
    id: uuid().primaryKey().notNull(),
    sso_provider_id: uuid().notNull(),
    domain: text().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
    index("sso_domains_sso_provider_id_idx").using(
      "btree",
      table.sso_provider_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.sso_provider_id],
      foreignColumns: [sso_providersInAuth.id],
      name: "sso_domains_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("domain not empty", sql`char_length(domain) > 0`),
  ],
);

export const employees = pgTable(
  "employees",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    hire_date: date(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    short_address: text(),
    status: text().default("active").notNull(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    termination_date: date(),
    is_active: boolean().default(true).notNull(),
    department_id: uuid(),
    position: text(),
    salary: jsonb(),
    notes: text(),
  },
  (table) => [
    index("employees_department_id_idx").using(
      "btree",
      table.department_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("employees_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("employees_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.department_id],
      foreignColumns: [departments.id],
      name: "employees_department_id_departments_id_fk",
    }).onDelete("set null"),
  ],
);

export const department_locations = pgTable(
  "department_locations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    department_id: uuid().notNull(),
    location_type: text().notNull(),
    location_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.department_id],
      foreignColumns: [departments.id],
      name: "department_locations_department_id_departments_id_fk",
    }).onDelete("cascade"),
    unique("unique_department_location").on(
      table.department_id,
      table.location_type,
      table.location_id,
    ),
    check(
      "location_type_check",
      sql`location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text])`,
    ),
  ],
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    quote_number: text().notNull(),
    issue_date: date().notNull(),
    expiry_date: date().notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric({ precision: 5, scale: 2 }).default("0"),
    notes: text(),
    client_id: uuid().notNull(),
    user_id: uuid().notNull(),
    tax_amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("quotes_client_id_idx").using("btree", table.client_id.asc().nullsLast().op("uuid_ops")),
    index("quotes_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("quotes_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.client_id],
      foreignColumns: [clients.id],
      name: "quotes_client_id_fkey",
    }).onDelete("cascade"),
    check(
      "quotes_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])`,
    ),
  ],
);

export const salaries = pgTable(
  "salaries",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    notes: text(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    employee_id: uuid().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: text().default("USD").notNull(),
    payment_frequency: text().default("monthly").notNull(),
    start_date: date().notNull(),
    end_date: date(),
  },
  (table) => [
    index("salaries_employee_id_idx").using(
      "btree",
      table.employee_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("salaries_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.employee_id],
      foreignColumns: [employees.id],
      name: "salaries_employee_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const departments = pgTable(
  "departments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    description: text(),
    user_id: uuid().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    is_active: boolean().default(true).notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("departments_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    requirements: text(),
    location: varchar({ length: 255 }),
    department: varchar({ length: 255 }),
    type: varchar({ length: 50 }).notNull(),
    salary: numeric({ precision: 10, scale: 2 }),
    is_active: boolean().default(true).notNull(),
    start_date: date(),
    end_date: date(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const vendors = pgTable(
  "vendors",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    company: text(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    notes: text(),
    user_id: uuid().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    code: text(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    capacity: numeric({ precision: 10, scale: 2 }),
    is_active: boolean().default(true).notNull(),
    notes: text(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    unique("warehouses_code_key").on(table.code),
  ],
);

export const branches = pgTable(
  "branches",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    code: text(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    phone: text(),
    email: text(),
    manager: text(),
    is_active: boolean().default(true).notNull(),
    notes: text(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    unique("branches_code_key").on(table.code),
  ],
);

export const companies = pgTable(
  "companies",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    website: text(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    industry: text(),
    size: text(),
    notes: text(),
    is_active: boolean().default(true).notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("companies_is_active_idx").using(
      "btree",
      table.is_active.asc().nullsLast().op("bool_ops"),
    ),
    index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
  ],
);

export const quote_items = pgTable(
  "quote_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unit_price: numeric({ precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    quote_id: uuid().notNull(),
    product_id: uuid(),
  },
  (table) => [
    index("quote_items_quote_id_idx").using(
      "btree",
      table.quote_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [products.id],
      name: "quote_items_product_id_fkey",
    }),
    foreignKey({
      columns: [table.quote_id],
      foreignColumns: [quotes.id],
      name: "quote_items_quote_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const clients = pgTable(
  "clients",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text(),
    phone: text().notNull(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    notes: text(),
    user_id: uuid().notNull(),
    company: uuid(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("clients_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.company],
      foreignColumns: [companies.id],
      name: "clients_company_fkey",
    }),
  ],
);

export const user_enterprise_roles = pgTable(
  "user_enterprise_roles",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    role_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "user_enterprise_roles_user_id_fkey",
    }),
    unique("user_enterprise_roles_user_id_enterprise_id_key").on(
      table.user_id,
      table.enterprise_id,
    ),
  ],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    email: text(),
    full_name: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    user_settings: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profiles_id_fkey",
    }).onDelete("cascade"),
    unique("profiles_email_key").on(table.email),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    is_system: boolean().default(false).notNull(),
    enterprise_id: uuid().references(() => enterprises.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("roles_name_key").on(table.name),
    index("idx_roles_enterprise_id").using("btree", table.enterprise_id),
    check(
      "roles_enterprise_id_check",
      sql`(is_system = true AND enterprise_id IS NULL) OR (is_system = false AND enterprise_id IS NOT NULL)`,
    ),
  ],
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    role_id: uuid().notNull(),
    permission: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
      name: "permissions_role_id_fkey",
    }).onDelete("cascade"),
    index("permissions_role_id_idx").using("btree", table.role_id.asc().nullsLast().op("uuid_ops")),
  ],
);

export const enterprises = pgTable(
  "enterprises",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    email: text(),
    industry: text(),
    size: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    profile_id: uuid(),
    enterprise_id: uuid(),
    role_id: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "memberships_enterprise_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.profile_id],
      foreignColumns: [profiles.id],
      name: "memberships_profile_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
      name: "memberships_role_id_fkey",
    }).onDelete("restrict"),
    unique("memberships_profile_id_enterprise_id_key").on(table.profile_id, table.enterprise_id),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    enterprise_id: uuid(),
    user_id: uuid(),
    invoice_number: text().notNull(),
    issue_date: date().default(sql`CURRENT_DATE`),
    due_date: date(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric({ precision: 5, scale: 2 }).default("0"),
    tax_amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
    notes: text(),
    client_id: uuid().notNull(),
    created_by: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("invoices_client_id_idx").using(
      "btree",
      table.client_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("invoices_invoice_number_idx").using(
      "btree",
      table.invoice_number.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.client_id],
      foreignColumns: [clients.id],
      name: "invoices_client_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [profiles.id],
      name: "invoices_created_by_fkey",
    }),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "invoices_enterprise_id_fkey",
    }).onDelete("cascade"),
    check(
      "invoices_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'partially_paid'::text, 'overdue'::text, 'void'::text])`,
    ),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    enterprise_id: uuid().notNull(),
    user_id: uuid().notNull(),
    description: text(),
    category: text().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    due_date: date(),
    issue_date: date().default(sql`CURRENT_DATE`),
    incurred_at: date().default(sql`CURRENT_DATE`),
    status: text().default("pending").notNull(),
    notes: text(),
    expense_number: text().notNull(),
    created_by: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [profiles.id],
      name: "expenses_created_by_fkey",
    }),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "expenses_enterprise_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const user_roles = pgTable(
  "user_roles",
  {
    user_id: uuid().notNull(),
    role_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    index("user_roles_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("user_roles_role_id_idx").using("btree", table.role_id.asc().nullsLast().op("uuid_ops")),
    index("user_roles_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "user_roles_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.user_id, table.role_id, table.enterprise_id],
      name: "user_roles_pkey",
    }),
  ],
);
export const user_permissions_view = pgView("user_permissions_view", {
  profile_id: uuid(),
  enterprise_id: uuid(),
  permission: text(),
}).as(
  sql`SELECT m.profile_id, m.enterprise_id, p.permission FROM memberships m JOIN permissions p ON m.role_id = p.role_id`,
);

// Define enums for activity logging
export const activityActionType = pgEnum("activity_action_type", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "INVITE", // e.g., User invite
  "ASSIGN_ROLE", // e.g., Assign role to user
  "LOGIN", // Could be useful
  // Add other relevant actions specific to your app
]);

export const activityTargetType = pgEnum("activity_target_type", [
  "USER",
  "ROLE",
  "COMPANY",
  "CLIENT",
  "INVOICE",
  "EXPENSE",
  "QUOTE",
  "BRANCH",
  "VENDOR",
  "OFFICE",
  "WAREHOUSE",
  "PURCHASE",
  "PRODUCT",
  "EMPLOYEE",
  "DEPARTMENT",
  "SALARY",
  "JOB_LISTING",
  "APPLICANT",
  "JOB",
  "TEMPLATE",
  "DOCUMENT",
  "ENTERPRISE_SETTINGS", // For settings changes
  // Add other entity types involved in actions
]);

// Define the activity_logs table
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().notNull(), // Keep as regular column
    enterprise_id: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "set null" }),
    action_type: activityActionType("action_type").notNull(),
    target_type: activityTargetType("target_type").notNull(),
    target_id: uuid("target_id").notNull(),
    target_name: text("target_name"),
    details: jsonb("details"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    // Define composite primary key including the time column
    primaryKey({ columns: [table.id, table.created_at] }),

    // Indexes are still beneficial
    index("activity_logs_enterprise_idx").on(table.enterprise_id),
    index("activity_logs_user_idx").on(table.user_id),
    index("activity_logs_target_idx").on(table.target_type, table.target_id),
  ],
);

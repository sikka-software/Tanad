import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  foreignKey,
  unique,
  uuid,
  timestamp,
  text,
  boolean,
  date,
  jsonb,
  pgSchema,
  json,
  varchar,
  pgPolicy,
  check,
  numeric,
  uniqueIndex,
  bigserial,
  smallint,
  inet,
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
export const activity_log_action_type = pgEnum("activity_log_action_type", [
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATED",
  "UPDATED",
  "DELETED",
]);
export const activity_log_target_type = pgEnum("activity_log_target_type", [
  "ENTERPRISE",
  "USER",
  "EMPLOYEE",
  "ROLE",
  "PERMISSION",
  "INVOICE",
  "EXPENSE",
  "SETTING",
  "NOTIFICATION",
  "SYSTEM",
]);
export const activity_target_type = pgEnum("activity_target_type", [
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
  "SERVER",
  "JOB_LISTING",
  "APPLICANT",
  "JOB",
  "TEMPLATE",
  "DOCUMENT",
  "ENTERPRISE_SETTINGS",
  "EMPLOYEE_REQUEST",
  "DOMAIN",
  "WEBSITE",
  "PURCHASE",
  "ONLINE_STORE",
  "CAR",
  "TRUCK",
]);
export const app_permission = pgEnum("app_permission", [
  "users.create",
  "users.read",
  "users.update",
  "users.delete",
  "users.export",
  "users.invite",
  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",
  "roles.export",
  "roles.assign",
  "companies.create",
  "companies.read",
  "companies.update",
  "companies.delete",
  "companies.export",
  "companies.duplicate",
  "branches.create",
  "branches.read",
  "branches.update",
  "branches.delete",
  "branches.export",
  "branches.duplicate",
  "clients.create",
  "clients.read",
  "clients.update",
  "clients.delete",
  "clients.export",
  "clients.duplicate",
  "vendors.create",
  "vendors.read",
  "vendors.update",
  "vendors.delete",
  "vendors.export",
  "vendors.duplicate",
  "products.create",
  "products.read",
  "products.update",
  "products.delete",
  "products.export",
  "products.duplicate",
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
  "settings.read",
  "settings.update",
  "users.duplicate",
  "roles.duplicate",
  "jobs.read",
  "jobs.create",
  "jobs.delete",
  "jobs.update",
  "jobs.duplicate",
  "jobs.export",
  "job_listings.read",
  "job_listings.create",
  "job_listings.delete",
  "job_listings.update",
  "job_listings.duplicate",
  "job_listings.export",
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
  "employees.read",
  "employees.create",
  "employees.delete",
  "employees.update",
  "employees.duplicate",
  "employees.export",
  "employee_requests.read",
  "employee_requests.create",
  "employee_requests.delete",
  "employee_requests.update",
  "employee_requests.duplicate",
  "employee_requests.export",
  "quotes.read",
  "quotes.create",
  "quotes.delete",
  "quotes.update",
  "quotes.duplicate",
  "quotes.export",
  "activity_logs.read",
  "activity_logs.delete",
  "activity_logs.export",
  "domains.read",
  "domains.create",
  "domains.delete",
  "domains.update",
  "domains.export",
  "servers.read",
  "servers.create",
  "servers.delete",
  "servers.update",
  "servers.export",
  "servers.duplicate",
  "purchases.read",
  "purchases.create",
  "purchases.delete",
  "purchases.update",
  "purchases.export",
  "purchases.duplicate",
  "websites.read",
  "websites.create",
  "websites.delete",
  "websites.update",
  "websites.export",
  "websites.duplicate",
  "online_stores.read",
  "online_stores.create",
  "online_stores.delete",
  "online_stores.update",
  "online_stores.export",
  "online_stores.duplicate",
  "cars.read",
  "cars.create",
  "cars.delete",
  "cars.update",
  "cars.export",
  "cars.duplicate",
  "trucks.read",
  "trucks.create",
  "trucks.delete",
  "trucks.update",
  "trucks.export",
  "trucks.duplicate",
]);
export const app_role = pgEnum("app_role", ["superadmin", "admin", "accounting", "hr"]);
export const payment_cycle = pgEnum("payment_cycle", ["monthly", "annual"]);
export const employee_status = pgEnum("employee_status", [
  "active",
  "inactive",
  "terminated",
  "on_leave",
  "resigned",
]);
export const common_status = pgEnum("common_status", ["active", "inactive", "draft", "archived"]);
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
    manager: uuid(),
    status: common_status().default("active"),
    notes: text(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("idx_branches_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_branches_manager").using("btree", table.manager.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.manager],
      foreignColumns: [employees.id],
      name: "fk_branch_manager",
    }).onDelete("set null"),
    unique("branches_code_key").on(table.code),
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
    index("idx_clients_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.company],
      foreignColumns: [companies.id],
      name: "clients_company_fkey",
    }),
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
    status: common_status().default("active"),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("companies_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("idx_companies_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
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
    status: common_status().default("active"),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("departments_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("idx_departments_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
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
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    short_address: text(),
    additional_number: text(),
    building_number: text(),
    street_name: text(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    termination_date: date(),
    status: employee_status().default("active"),
    department_id: uuid(),
    position: text(),
    salary: jsonb().default([]),
    notes: text(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("employees_department_id_idx").using(
      "btree",
      table.department_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("employees_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("employees_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("idx_employees_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.department_id],
      foreignColumns: [departments.id],
      name: "employees_department_id_departments_id_fk",
    }).onDelete("set null"),
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
    index("idx_memberships_role_id").using("btree", table.role_id.asc().nullsLast().op("uuid_ops")),
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
    pgPolicy("Access if same user", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(profile_id = auth.uid())`,
    }),
  ],
);

export const enterprises = pgTable(
  "enterprises",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    email: text(),
    industry: text(),
    size: text(),
  },
  (table) => [
    index("enterprises_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("enterprises_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    pgPolicy("Access if member", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM memberships
  WHERE ((memberships.enterprise_id = enterprises.id) AND (memberships.profile_id = auth.uid()))))`,
    }),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    enterprise_id: uuid(),
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
    user_id: uuid(),
  },
  (table) => [
    index("idx_invoices_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("invoices_client_id_idx").using(
      "btree",
      table.client_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("invoices_invoice_number_idx").using(
      "btree",
      table.invoice_number.asc().nullsLast().op("text_ops"),
    ),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
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
    status: common_status().default("active"),
    notes: text(),
  },
  (table) => [
    index("idx_products_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("products_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
    index("products_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    zip_code: text(),
    phone: text(),
    email: text(),
    manager: uuid(),
    status: common_status().default("active"),
    user_id: uuid().notNull(),
    notes: text(),
    enterprise_id: uuid().notNull(),
    code: text(),
  },
  (table) => [
    index("idx_offices_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("offices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("idx_offices_manager").using("btree", table.manager.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.manager],
      foreignColumns: [employees.id],
      name: "fk_office_manager",
    }).onDelete("set null"),
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
      table.user_id.asc().nullsLast().op("text_ops"),
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
    phone_change: text(),
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
    pgPolicy("Users can view their own user data", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`(auth.uid() = id)`,
    }),
    check(
      "users_email_change_confirm_status_check",
      sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
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
      table.user_id.asc().nullsLast().op("uuid_ops"),
      table.authentication_method.asc().nullsLast().op("uuid_ops"),
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

export const instancesInAuth = auth.table("instances", {
  id: uuid().primaryKey().notNull(),
  uuid: uuid(),
  raw_base_config: text(),
  created_at: timestamp({ withTimezone: true, mode: "string" }),
  updated_at: timestamp({ withTimezone: true, mode: "string" }),
});

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
      table.created_at.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("mfa_factors_user_friendly_name_unique")
      .using(
        "btree",
        table.friendly_name.asc().nullsLast().op("text_ops"),
        table.user_id.asc().nullsLast().op("uuid_ops"),
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
      table.user_id.asc().nullsLast().op("uuid_ops"),
      table.created_at.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "sessions_user_id_fkey",
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
    pgPolicy("Enable read access for users", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Enable insert for authenticated users", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("Enable update for users", { as: "permissive", for: "update", to: ["authenticated"] }),
    pgPolicy("Enable delete for users", { as: "permissive", for: "delete", to: ["authenticated"] }),
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
    pgPolicy("Allow enterprise members to update requests", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`is_member_of_enterprise(enterprise_id)`,
      withCheck: sql`is_member_of_enterprise(enterprise_id)`,
    }),
    pgPolicy("Allow members to view own enterprise requests", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Allow members to insert for own enterprise", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Allow creator to delete own requests", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    enterprise_id: uuid().notNull(),
    description: text(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    incurred_at: date().default(sql`CURRENT_DATE`),
    created_by: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    category: text().notNull(),
    due_date: date(),
    issue_date: date().default(sql`CURRENT_DATE`),
    notes: text(),
    expense_number: text().notNull(),
    status: text().default("pending").notNull(),
    user_id: uuid().notNull(),
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

export const purchases = pgTable(
  "purchases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    enterprise_id: uuid().notNull(),
    description: text(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    incurred_at: date().default(sql`CURRENT_DATE`),
    created_by: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    category: text().notNull(),
    due_date: date(),
    issue_date: date().default(sql`CURRENT_DATE`),
    notes: text(),
    purchase_number: text().notNull(),
    status: text().default("pending").notNull(),
    user_id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [profiles.id],
      name: "purchases_created_by_fkey",
    }),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "purchases_enterprise_id_fkey",
    }).onDelete("cascade"),
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
    index("idx_vendors_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    deductions: jsonb().default([]),
    start_date: date().notNull(),
    payment_date: date(),
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
    status: common_status().default("active"),
    start_date: date(),
    end_date: date(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    responsibilities: text(),
    benefits: text(),
  },
  (table) => [
    index("idx_jobs_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    manager: uuid(),
    city: text(),
    region: text(),
    country: text(),
    zip_code: text(),
    capacity: numeric({ precision: 10, scale: 2 }),
    status: common_status().default("active"),
    notes: text(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    phone: text(),
  },
  (table) => [
    index("idx_warehouses_enterprise_id").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    unique("warehouses_code_key").on(table.code),
    index("idx_warehouses_manager").using("btree", table.manager.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.manager],
      foreignColumns: [employees.id],
      name: "fk_warehouse_manager",
    }).onDelete("set null"),
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
    role: text().default("user").notNull(),
    username: text(),
    enterprise_id: uuid(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    stripe_customer_id: text(),
    subscribed_to: text(),
    price_id: text(),
  },
  (table) => [
    index("profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("profiles_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("profiles_user_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
    index("profiles_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profiles_id_fkey",
    }).onDelete("cascade"),
    unique("profiles_email_key").on(table.email),
    pgPolicy("Users can view own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can insert own profile", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text(),
    is_system: boolean().default(false),
    enterprise_id: uuid(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "roles_enterprise_id_fkey",
    }).onDelete("cascade"),
    unique("roles_name_enterprise_id_key").on(table.name, table.enterprise_id),
    pgPolicy("Users can view roles in their enterprise", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`((enterprise_id IN ( SELECT user_enterprises.enterprise_id
   FROM user_enterprises
  WHERE (user_enterprises.user_id = auth.uid()))) OR (is_system = true))`,
    }),
    pgPolicy("Users can create roles in their enterprise", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update roles in their enterprise", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can delete roles in their enterprise", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    role_id: uuid(),
    permission: app_permission().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
      name: "permissions_role_id_fkey",
    }).onDelete("cascade"),
    unique("permissions_role_id_permission_key").on(table.role_id, table.permission),
    pgPolicy("Users can view permissions in their enterprise", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(role_id IN ( SELECT roles.id
   FROM roles
  WHERE ((roles.enterprise_id IN ( SELECT user_enterprises.enterprise_id
           FROM user_enterprises
          WHERE (user_enterprises.user_id = auth.uid()))) OR (roles.is_system = true))))`,
    }),
    pgPolicy("Users can manage permissions in their enterprise", {
      as: "permissive",
      for: "all",
      to: ["public"],
    }),
  ],
);

export const job_listings = pgTable(
  "job_listings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: common_status().default("active"),
    slug: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    is_public: boolean().default(false).notNull(),
    currency: text(),
    locations: jsonb().default([]),
    departments: jsonb().default([]),
    enable_search_filtering: boolean().default(true),
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

export const domains = pgTable(
  "domains",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    domain_name: text().notNull(),
    registrar: text(),
    monthly_cost: numeric({ precision: 10, scale: 2 }),
    annual_cost: numeric({ precision: 10, scale: 2 }),
    payment_cycle: payment_cycle(),
    status: common_status().default("active"),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    notes: text(),
  },
  (table) => [
    index("domains_domain_name_idx").using(
      "btree",
      table.domain_name.asc().nullsLast().op("text_ops"),
    ),
    index("domains_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("domains_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "domains_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "domains_user_id_users_id_fk",
    }),
    unique("domains_enterprise_id_domain_name_unique").on(table.domain_name, table.enterprise_id),
  ],
);
export const websites = pgTable(
  "websites",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    domain_name: text().notNull(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    status: common_status().default("active"),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    notes: text(),
  },
  (table) => [
    index("websites_domain_name_idx").using(
      "btree",
      table.domain_name.asc().nullsLast().op("text_ops"),
    ),
    index("websites_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("websites_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "websites_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "websites_user_id_users_id_fk",
    }),
    unique("websites_enterprise_id_domain_name_unique").on(table.domain_name, table.enterprise_id),
  ],
);

export const online_stores = pgTable(
  "online_stores",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    domain_name: text().notNull(),
    platform: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    status: common_status().default("active"),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
    notes: text(),
  },
  (table) => [
    index("online_stores_domain_name_idx").using(
      "btree",
      table.domain_name.asc().nullsLast().op("text_ops"),
    ),
    index("online_stores_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("online_stores_user_id_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "online_stores_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "online_stores_user_id_users_id_fk",
    }),
    unique("online_stores_enterprise_id_domain_name_unique").on(
      table.domain_name,
      table.enterprise_id,
    ),
  ],
);

export const servers = pgTable(
  "servers",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    ip_address: inet(),
    location: text(),
    provider: text(),
    os: text(),
    status: common_status().default("active"),
    tags: jsonb().default([]),
    monthly_cost: numeric({ precision: 10, scale: 2 }),
    annual_cost: numeric({ precision: 10, scale: 2 }),
    payment_cycle: payment_cycle(),
    notes: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("servers_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("servers_ip_address_idx").using(
      "btree",
      table.ip_address.asc().nullsLast().op("inet_ops"),
    ),
    index("servers_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("servers_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("servers_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "servers_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "servers_user_id_users_id_fk",
    }),
  ],
);

export const cars = pgTable(
  "cars",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    make: text().notNull(),
    model: text().notNull(),
    year: text().notNull(),
    color: text(),
    vin: text(),
    code: text(),
    license_country: text(),
    license_plate: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    notes: text(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("cars_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("cars_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("cars_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "cars_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "cars_user_id_users_id_fk",
    }),
  ],
);

export const trucks = pgTable(
  "trucks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    make: text().notNull(),
    model: text().notNull(),
    year: text().notNull(),
    color: text(),
    vin: text(),
    code: text(),
    license_country: text(),
    license_plate: text(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    notes: text(),
    updated_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    user_id: uuid().notNull(),
    enterprise_id: uuid().notNull(),
  },
  (table) => [
    index("trucks_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("trucks_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("trucks_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "trucks_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "trucks_user_id_users_id_fk",
    }),
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

export const activity_logs = pgTable(
  "activity_logs",
  {
    id: uuid().defaultRandom().notNull(),
    enterprise_id: uuid().notNull(),
    user_id: uuid().notNull(),
    action_type: activity_log_action_type().notNull(),
    target_type: activity_target_type().notNull(),
    target_id: uuid().notNull(),
    target_name: text(),
    details: jsonb(),
    created_at: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    index("activity_logs_enterprise_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("activity_logs_target_idx").using(
      "btree",
      table.target_type.asc().nullsLast().op("enum_ops"),
      table.target_id.asc().nullsLast().op("enum_ops"),
    ),
    index("activity_logs_user_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "activity_logs_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [usersInAuth.id],
      name: "activity_logs_user_id_users_id_fk",
    }).onDelete("set null"),
    primaryKey({ columns: [table.id, table.created_at], name: "activity_logs_id_created_at_pk" }),
  ],
);
export const user_permissions_view = pgView("user_permissions_view", {
  user_id: uuid(),
  permission_id: uuid(),
  permission_name: text(),
  role_id: uuid(),
  role_name: text(),
  enterprise_id: uuid(),
  is_system: boolean(),
}).as(
  sql`SELECT DISTINCT m.profile_id AS user_id, p.id AS permission_id, p.permission::text AS permission_name, m.role_id, r.name AS role_name, m.enterprise_id, r.is_system FROM memberships m JOIN roles r ON m.role_id = r.id JOIN permissions p ON r.id = p.role_id`,
);

export const user_enterprises = pgView("user_enterprises", {
  user_id: uuid(),
  enterprise_id: uuid(),
}).as(sql`SELECT DISTINCT p.id AS user_id, p.enterprise_id FROM profiles p`);

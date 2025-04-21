import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  foreignKey,
  unique,
  check,
  uuid,
  text,
  jsonb,
  timestamp,
  varchar,
  boolean,
  numeric,
  date,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define enums first
export const appRole = pgEnum("app_role", ["superadmin", "admin", "accounting", "hr"]);
export const appPermission = pgEnum("app_permission", [
  "profiles.create",
  "profiles.read",
  "profiles.update",
  "profiles.delete",
  "profiles.export",
  "enterprises.create",
  "enterprises.read",
  "enterprises.update",
  "enterprises.delete",
  "enterprises.export",
  "invoices.create",
  "invoices.read",
  "invoices.update",
  "invoices.delete",
  "invoices.export",
  "invoices.duplicate",
  "products.create",
  "products.read",
  "products.update",
  "products.delete",
  "products.export",
  "quotes.create",
  "quotes.read",
  "quotes.update",
  "quotes.delete",
  "quotes.export",
  "quotes.duplicate",
  "employees.create",
  "employees.read",
  "employees.update",
  "employees.delete",
  "employees.export",
  "salaries.create",
  "salaries.read",
  "salaries.update",
  "salaries.delete",
  "salaries.export",
  "documents.create",
  "documents.read",
  "documents.update",
  "documents.delete",
  "documents.export",
  "templates.create",
  "templates.read",
  "templates.update",
  "templates.delete",
  "templates.export",
  "templates.duplicate",
  "employee_requests.create",
  "employee_requests.read",
  "employee_requests.update",
  "employee_requests.delete",
  "employee_requests.export",
  "job_listings.create",
  "job_listings.read",
  "job_listings.update",
  "job_listings.delete",
  "job_listings.export",
  "offices.create",
  "offices.read",
  "offices.update",
  "offices.delete",
  "offices.export",
  "expenses.create",
  "expenses.read",
  "expenses.update",
  "expenses.delete",
  "expenses.export",
  "expenses.duplicate",
  "departments.create",
  "departments.read",
  "departments.update",
  "departments.delete",
  "departments.export",
  "warehouses.create",
  "warehouses.read",
  "warehouses.update",
  "warehouses.delete",
  "warehouses.export",
  "vendors.create",
  "vendors.read",
  "vendors.update",
  "vendors.delete",
  "vendors.export",
  "clients.create",
  "clients.read",
  "clients.update",
  "clients.delete",
  "clients.export",
  "companies.create",
  "companies.read",
  "companies.update",
  "companies.delete",
  "companies.export",
  "branches.create",
  "branches.read",
  "branches.update",
  "branches.delete",
  "branches.export"
]);

// Define enterprises first since it's referenced by other tables
export const enterprises = pgTable(
  "enterprises",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    website: text(),
    address: text(),
    city: text(),
    state: text(),
    zip_code: text("zip_code"),
    industry: text(),
    size: text(),
    notes: text(),
    is_active: boolean().default(true).notNull(),
  },
  (table) => [
    index("enterprises_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("enterprises_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
  ],
).enableRLS();

// Define user_roles and role_permissions next
export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    role: appRole("role").notNull(),
    enterprise_id: uuid("enterprise_id").references(() => enterprises.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("user_roles_user_id_role_enterprise_id_key").on(
      table.user_id,
      table.role,
      table.enterprise_id,
    ),
  ],
).enableRLS();

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    role: appRole("role").notNull(),
    permission: appPermission("permission").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("role_permissions_role_permission_key").on(table.role, table.permission),
  ],
).enableRLS();

// Define profiles table
export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zip_code: text("zip_code"),
    country: text("country"),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("profiles_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
  ],
).enableRLS();

// Define companies table
export const companies = pgTable(
  "companies",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    website: text(),
    address: text(),
    city: text(),
    state: text(),
    zip_code: text("zip_code"),
    industry: text(),
    size: text(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").references(() => enterprises.id, { onDelete: "cascade" }).notNull(),
  },
  (table) => [
    index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
  ],
).enableRLS();

// Define products table
export const products = pgTable(
  "products",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    description: text(),
    sku: text(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
    unit: text(),
    is_active: boolean().default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("products_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("products_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
  ],
).enableRLS();

// Define clients table
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text("name").notNull(),
    email: text("email"),
    phone: text().notNull(),
    company: uuid("company"),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("clients_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.company],
      foreignColumns: [companies.id],
      name: "clients_company_fkey",
    }),
  ],
).enableRLS();

// Define invoices table
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    invoice_number: text("invoice_number").notNull(),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    status: text("status").$type<"paid" | "pending" | "overdue">().notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    tax_amount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric("total", { precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text("notes"),
    client_id: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("invoices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("invoices_client_id_idx").using(
      "btree",
      table.client_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.client_id],
      foreignColumns: [clients.id],
      name: "invoices_client_id_fkey",
    }).onDelete("cascade"),
    check(
      "invoices_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])`,
    ),
  ],
).enableRLS();

// Define invoice items table
export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    invoice_id: uuid("invoice_id").notNull(),
    product_id: uuid("product_id"),
  },
  (table) => [
    index("invoice_items_invoice_id_idx").using(
      "btree",
      table.invoice_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.invoice_id],
      foreignColumns: [invoices.id],
      name: "invoice_items_invoice_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [products.id],
      name: "invoice_items_product_id_fkey",
    }),
  ],
).enableRLS();

// Define quotes table
export const quotes = pgTable(
  "quotes",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    quote_number: text("quote_number").notNull(),
    issue_date: date("issue_date").notNull(),
    expiry_date: date("expiry_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    tax_amount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric("total", { precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text(),
    client_id: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
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
).enableRLS();

// Define quote items table
export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    quote_id: uuid("quote_id").notNull(),
    product_id: uuid("product_id"),
  },
  (table) => [
    index("quote_items_quote_id_idx").using(
      "btree",
      table.quote_id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.quote_id],
      foreignColumns: [quotes.id],
      name: "quote_items_quote_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [products.id],
      name: "quote_items_product_id_fkey",
    }),
  ],
).enableRLS();

// Define employees table
export const employees = pgTable(
  "employees",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zip_code: text("zip_code"),
    country: text("country"),
    hire_date: date("hire_date"),
    termination_date: date("termination_date"),
    is_active: boolean().default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("employees_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("employees_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
  ],
).enableRLS();

// Define salaries table
export const salaries = pgTable(
  "salaries",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    employee_id: uuid("employee_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    payment_frequency: text("payment_frequency").default("monthly").notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date"),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
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
).enableRLS();

// Define expenses table
export const expenses = pgTable(
  "expenses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    expense_number: text("expense_number").notNull(),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    status: text().default("pending").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    notes: text(),
    client_id: uuid("client_id"),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("expenses_client_id_idx").using(
      "btree",
      table.client_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("expenses_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("expenses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.client_id],
      foreignColumns: [clients.id],
      name: "expenses_client_id_fkey",
    }).onDelete("cascade"),
    check(
      "expenses_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])`,
    ),
  ],
).enableRLS();

// Define vendors table
export const vendors = pgTable(
  "vendors",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    company: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

// Define warehouses table
export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    code: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    capacity: numeric({ precision: 10, scale: 2 }),
    is_active: boolean("is_active").default(true).notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    unique("warehouses_code_key").on(table.code),
  ],
).enableRLS();

// Define branches table
export const branches = pgTable(
  "branches",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    code: text(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    manager: text(),
    is_active: boolean("is_active").default(true).notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    unique("branches_code_key").on(table.code),
  ],
).enableRLS();

// Define jobs table
export const jobs = pgTable(
  "jobs",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    requirements: text("requirements"),
    location: varchar("location", { length: 255 }),
    department: varchar("department", { length: 255 }),
    type: varchar("type", { length: 50 }).notNull(), // Full-time, Part-time, Contract, etc.
    salary: numeric("salary", { precision: 10, scale: 2 }),
    is_active: boolean("is_active").default(true).notNull(),
    start_date: date("start_date"),
    end_date: date("end_date"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

// Define templates table
export const templates = pgTable(
  "templates",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    type: text("type").$type<"invoice" | "quote">().notNull(),
    content: jsonb("content").notNull(), // Store the template content as JSON
    is_default: boolean("is_default").default(false).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("templates_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    check("templates_type_check", sql`type = ANY (ARRAY['invoice'::text, 'quote'::text])`),
  ],
).enableRLS();

// Define employee requests table
export const employeeRequests = pgTable(
  "employee_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    type: text("type", { enum: ["leave", "expense", "document", "other"] }).notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    title: text("title").notNull(),
    description: text("description"),
    start_date: date("start_date"),
    end_date: date("end_date"),
    amount: numeric("amount", { precision: 10, scale: 2 }),
    attachments: jsonb("attachments").default([]),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("employee_requests_user_id_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("employee_requests_employee_id_idx").on(table.employee_id),
    index("employee_requests_type_idx").on(table.type),
    index("employee_requests_status_idx").on(table.status),
    index("employee_requests_created_at_idx").on(table.created_at),
  ],
).enableRLS();

// Define job listings table
export const jobListings = pgTable(
  "job_listings",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    is_active: boolean("is_active").default(true).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("job_listings_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("job_listings_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("job_listings_user_id_idx").using(
      "btree",
      table.user_id.asc().nullsLast().op("uuid_ops"),
    ),
  ],
).enableRLS();

// Define job listing jobs table
export const jobListingJobs = pgTable(
  "job_listing_jobs",
  {
    id: uuid().primaryKey().defaultRandom(),
    job_listing_id: uuid("job_listing_id")
      .notNull()
      .references(() => jobListings.id, { onDelete: "cascade" }),
    job_id: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("job_listing_jobs_job_listing_id_idx").using(
      "btree",
      table.job_listing_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("job_listing_jobs_job_id_idx").using(
      "btree",
      table.job_id.asc().nullsLast().op("uuid_ops"),
    ),
  ],
).enableRLS();

// Define offices table
export const offices = pgTable(
  "offices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    is_active: boolean().default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("offices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

// Define departments table
export const departments = pgTable(
  "departments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    description: text(),
    is_active: boolean("is_active").default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
    index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("departments_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

// Define department locations table
export const departmentLocations = pgTable(
  "department_locations",
  {
    id: uuid().defaultRandom().primaryKey(),
    department_id: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
    location_type: text("location_type", {
      enum: ["office", "branch", "warehouse"],
    }).notNull(),
    location_id: uuid("location_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
  },
  (table) => [
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
).enableRLS();

// Define documents table
export const documents = pgTable(
  "documents",
  {
    id: uuid()
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text("name").notNull(),
    url: text("url").notNull(),
    file_path: text("file_path").notNull(),
    entity_id: uuid("entity_id").notNull(),
    entity_type: text("entity_type")
      .$type<
        | "company"
        | "expense"
        | "salary"
        | "employee"
        | "invoice"
        | "quote"
        | "vendor"
        | "warehouse"
        | "branch"
        | "office"
        | "department"
      >()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id")
      .references(() => enterprises.id)
      .notNull(),
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
      sql`entity_type = ANY (ARRAY[
        'company'::text,
        'expense'::text,
        'salary'::text,
        'employee'::text,
        'invoice'::text,
        'quote'::text,
        'vendor'::text,
        'warehouse'::text,
        'branch'::text,
        'office'::text,
        'department'::text
      ])`,
    ),
  ],
).enableRLS();

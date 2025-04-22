import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  foreignKey,
  check,
  uuid,
  timestamp,
  text,
  jsonb,
  boolean,
  numeric,
  unique,
  date,
  varchar,
  pgPolicy,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

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
  "branches.export",
]);

export const templates = pgTable(
  "templates",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    type: text().notNull(),
    content: jsonb().notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("templates_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "templates_enterprise_id_enterprises_id_fk",
    }),
    check("templates_type_check", sql`type = ANY (ARRAY['invoice'::text, 'quote'::text])`),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    url: text().notNull(),
    filePath: text("file_path").notNull(),
    entityId: uuid("entity_id").notNull(),
    entityType: text("entity_type").notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("documents_entity_id_idx").using(
      "btree",
      table.entityId.asc().nullsLast().op("uuid_ops"),
    ),
    index("documents_entity_type_idx").using(
      "btree",
      table.entityType.asc().nullsLast().op("text_ops"),
    ),
    index("documents_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "documents_enterprise_id_enterprises_id_fk",
    }),
    check(
      "documents_entity_type_check",
      sql`entity_type = ANY (ARRAY['company'::text, 'expense'::text])`,
    ),
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
    cost: numeric({ precision: 10, scale: 2 }),
    quantity: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    unit: text(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("products_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
    index("products_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "products_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    role: text("role").notNull(),
    permission: appPermission().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("role_permissions_role_permission_key").on(table.role, table.permission)],
);

export const employeeRequests = pgTable(
  "employee_requests",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    employeeId: uuid("employee_id").notNull(),
    type: text().notNull(),
    status: text().default("pending").notNull(),
    title: text().notNull(),
    description: text(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    amount: numeric({ precision: 10, scale: 2 }),
    attachments: jsonb().default([]),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("employee_requests_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("employee_requests_employee_id_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("uuid_ops"),
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
      columns: [table.employeeId],
      foreignColumns: [employees.id],
      name: "employee_requests_employee_id_employees_id_fk",
    }),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "employee_requests_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const jobListingJobs = pgTable(
  "job_listing_jobs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    jobListingId: uuid("job_listing_id").notNull(),
    jobId: uuid("job_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("job_listing_jobs_job_id_idx").using(
      "btree",
      table.jobId.asc().nullsLast().op("uuid_ops"),
    ),
    index("job_listing_jobs_job_listing_id_idx").using(
      "btree",
      table.jobListingId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "job_listing_jobs_enterprise_id_enterprises_id_fk",
    }),
    foreignKey({
      columns: [table.jobId],
      foreignColumns: [jobs.id],
      name: "job_listing_jobs_job_id_jobs_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.jobListingId],
      foreignColumns: [jobListings.id],
      name: "job_listing_jobs_job_listing_id_job_listings_id_fk",
    }).onDelete("cascade"),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text().notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    notes: text(),
    clientId: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("invoices_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("invoices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "invoices_client_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "invoices_enterprise_id_enterprises_id_fk",
    }),
    check(
      "invoices_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])`,
    ),
  ],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    invoiceId: uuid("invoice_id").notNull(),
    productId: uuid("product_id"),
  },
  (table) => [
    index("invoice_items_invoice_id_idx").using(
      "btree",
      table.invoiceId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoices.id],
      name: "invoice_items_invoice_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "invoice_items_product_id_fkey",
    }),
  ],
);

export const jobListings = pgTable(
  "job_listings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
  },
  (table) => [
    index("job_listings_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("job_listings_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("job_listings_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "job_listings_enterprise_id_enterprises_id_fk",
    }),
    unique("job_listings_slug_unique").on(table.slug),
  ],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    fullName: text("full_name"),
    email: text().notNull(),
    userSettings: jsonb("user_settings"),
    enterprise_id: uuid("enterprise_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    stripeCustomerId: text("stripe_customer_id"),
    avatarUrl: text("avatar_url"),
    username: text(),
    subscribedTo: text("subscribed_to"),
    priceId: text("price_id"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text(),
    address: text(),
    city: text(),
    state: text(),
    zipCode: text("zip_code"),
    country: text(),
    user_id: uuid("user_id").notNull(),
    role: text("role").notNull().default("user"),
  },
  (table) => [
    index("profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("profiles_enterprise_id_idx").using(
      "btree",
      table.enterprise_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("profiles_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    index("profiles_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "profiles_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const offices = pgTable(
  "offices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    isActive: boolean("is_active").default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("offices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "offices_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const departmentLocations = pgTable(
  "department_locations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    departmentId: uuid("department_id").notNull(),
    locationType: text("location_type").notNull(),
    locationId: uuid("location_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departments.id],
      name: "department_locations_department_id_departments_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "department_locations_enterprise_id_enterprises_id_fk",
    }),
    unique("unique_department_location").on(
      table.departmentId,
      table.locationType,
      table.locationId,
    ),
    check(
      "location_type_check",
      sql`location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text])`,
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
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text().notNull(),
    phone: text(),
    hireDate: date("hire_date"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
    address: text(),
    city: text(),
    state: text(),
    zipCode: text("zip_code"),
    country: text(),
    terminationDate: date("termination_date"),
    isActive: boolean("is_active").default(true).notNull(),
    departmentId: uuid("department_id"),
  },
  (table) => [
    index("employees_department_id_idx").using(
      "btree",
      table.departmentId.asc().nullsLast().op("uuid_ops"),
    ),
    index("employees_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("employees_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departments.id],
      name: "employees_department_id_departments_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "employees_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    expenseNumber: text("expense_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text().default("pending").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    category: text().notNull(),
    notes: text(),
    clientId: uuid("client_id"),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("expenses_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("expenses_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("expenses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "expenses_client_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "expenses_enterprise_id_enterprises_id_fk",
    }),
    check(
      "expenses_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])`,
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    quoteNumber: text("quote_number").notNull(),
    issueDate: date("issue_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    notes: text(),
    clientId: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("quotes_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("quotes_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("quotes_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "quotes_client_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "quotes_enterprise_id_enterprises_id_fk",
    }),
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
    employeeId: uuid("employee_id").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: text().default("USD").notNull(),
    paymentFrequency: text("payment_frequency").default("monthly").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
  },
  (table) => [
    index("salaries_employee_id_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("uuid_ops"),
    ),
    index("salaries_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id],
      name: "salaries_employee_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "salaries_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const vendors = pgTable(
  "vendors",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    company: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "vendors_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const departments = pgTable(
  "departments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    description: text(),
    user_id: uuid("user_id").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    isActive: boolean("is_active").default(true).notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("departments_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "departments_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    code: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    capacity: numeric({ precision: 10, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "warehouses_enterprise_id_enterprises_id_fk",
    }),
    unique("warehouses_code_key").on(table.code),
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
    isActive: boolean("is_active").default(true).notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "jobs_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const branches = pgTable(
  "branches",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    code: text(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    manager: text(),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "branches_enterprise_id_enterprises_id_fk",
    }),
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    website: text(),
    address: text(),
    city: text(),
    state: text(),
    zipCode: text("zip_code"),
    industry: text(),
    size: text(),
    notes: text(),
    isActive: boolean("is_active").default(true).notNull(),
    user_id: uuid("user_id").notNull(),
    enterprise_id: uuid("enterprise_id").notNull(),
  },
  (table) => [
    index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("companies_is_active_idx").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops"),
    ),
    index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "companies_enterprise_id_enterprises_id_fk",
    }).onDelete("cascade"),
  ],
);

export const enterprises = pgTable(
  "enterprises",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    address: text(),
    city: text(),
    state: text(),
    zipCode: text("zip_code"),
    isActive: boolean("is_active").default(true).notNull(),
    website: text(),
    industry: text(),
    size: text(),
    notes: text(),
  },
  (table) => [
    index("enterprises_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("enterprises_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    pgPolicy("Enable delete for owners", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
      using: sql`true`,
    }),
    pgPolicy("Enable insert for signup", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("Enable read for users", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("Enable update for owners", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
  ],
);

export const clients = pgTable(
  "clients",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    name: text().notNull(),
    email: text(),
    phone: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
    company: uuid(),
    enterprise_id: uuid("enterprise_id").notNull(),
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
    foreignKey({
      columns: [table.enterprise_id],
      foreignColumns: [enterprises.id],
      name: "clients_enterprise_id_enterprises_id_fk",
    }),
  ],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(
      sql`timezone('utc'::text, now())`,
    ),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    quoteId: uuid("quote_id").notNull(),
    productId: uuid("product_id"),
  },
  (table) => [
    index("quote_items_quote_id_idx").using(
      "btree",
      table.quoteId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "quote_items_product_id_fkey",
    }),
    foreignKey({
      columns: [table.quoteId],
      foreignColumns: [quotes.id],
      name: "quote_items_quote_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    enterprise_id: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.role, table.enterprise_id] }),
    user_idIdx: index("user_roles_user_id_idx").on(table.user_id),
    roleIdx: index("user_roles_role_idx").on(table.role),
    enterprise_idIdx: index("user_roles_enterprise_id_idx").on(table.enterprise_id),
  }),
);

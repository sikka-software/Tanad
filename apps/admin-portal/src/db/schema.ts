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
} from "drizzle-orm/pg-core";

export const companies = pgTable(
  "companies",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
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
    zipCode: text("zip_code"),
    industry: text(),
    size: text(),
    notes: text(),
    isActive: boolean().default(true).notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("companies_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", {
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
    zipCode: text("zip_code").notNull(),
    notes: text(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("clients_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.company],
      foreignColumns: [companies.id],
      name: "clients_company_fkey",
    }),
  ],
).enableRLS();

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text("status").$type<"paid" | "pending" | "overdue">().notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric("total", { precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text("notes"),
    clientId: uuid("client_id").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("invoices_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("invoices_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "invoices_client_id_fkey",
    }).onDelete("cascade"),

    check(
      "invoices_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])`,
    ),
  ],
).enableRLS();

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
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
  ],
).enableRLS();

export const quotes = pgTable(
  "quotes",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    quoteNumber: text("quote_number").notNull(),
    issueDate: date("issue_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric("total", { precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text(),
    clientId: uuid("client_id").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("quotes_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("quotes_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("quotes_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "quotes_client_id_fkey",
    }).onDelete("cascade"),

    check(
      "quotes_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])`,
    ),
  ],
).enableRLS();

export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
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
      columns: [table.quoteId],
      foreignColumns: [quotes.id],
      name: "quote_items_quote_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "quote_items_product_id_fkey",
    }),
  ],
).enableRLS();

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    fullName: text("full_name"),
    stripeCustomerId: text("stripe_customer_id"),
    avatarUrl: text("avatar_url"),
    address: text(),
    email: varchar({ length: 255 }),
    userSettings: jsonb("user_settings"),
    username: text(),
    subscribedTo: text("subscribed_to"),
    priceId: text("price_id"),
  },
  (table) => [unique("profiles_username_key").on(table.username)],
).enableRLS();

export const products = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    sku: varchar({ length: 50 }),
    stockQuantity: integer("stock_quantity").default(0),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("products_sku_key").on(table.sku),
    index("products_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const employees = pgTable("employees", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 255 }).notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  hireDate: date("hire_date").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

export const expenses = pgTable(
  "expenses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    expenseNumber: text("expense_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text().default("pending").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    notes: text(),
    clientId: uuid("client_id").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("expenses_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
    index("expenses_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("expenses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "expenses_client_id_fkey",
    }).onDelete("cascade"),

    check(
      "expenses_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])`,
    ),
  ],
).enableRLS();

export const vendors = pgTable(
  "vendors",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
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
    zipCode: text("zip_code").notNull(),
    notes: text(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const salaries = pgTable(
  "salaries",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    payPeriodStart: date("pay_period_start").notNull(),
    payPeriodEnd: date("pay_period_end").notNull(),
    paymentDate: date("payment_date").notNull(),
    grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
    netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
    deductions: jsonb("deductions"),
    notes: text(),
    employeeName: text("employee_name").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("salaries_payment_date_idx").using("btree", table.paymentDate.asc().nullsLast()),
    index("salaries_employee_name_idx").using(
      "btree",
      table.employeeName.asc().nullsLast().op("text_ops"),
    ),
    index("salaries_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    code: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    capacity: numeric({ precision: 10, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    unique("warehouses_code_key").on(table.code),
  ],
).enableRLS();

export const branches = pgTable(
  "branches",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    code: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    manager: text(),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    unique("branches_code_key").on(table.code),
  ],
).enableRLS();

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
    isActive: boolean("is_active").default(true).notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const templates = pgTable(
  "templates",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    type: text("type").$type<"invoice" | "quote">().notNull(),
    content: jsonb("content").notNull(), // Store the template content as JSON
    isDefault: boolean("is_default").default(false).notNull(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("templates_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
    check("templates_type_check", sql`type = ANY (ARRAY['invoice'::text, 'quote'::text])`),
  ],
).enableRLS();

export const employeeRequests = pgTable(
  "employee_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    employeeName: text("employee_name").notNull(),
    type: text("type", { enum: ["leave", "expense", "document", "other"] }).notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    title: text("title").notNull(),
    description: text("description"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    amount: numeric("amount", { precision: 10, scale: 2 }),
    attachments: jsonb("attachments").default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    employeeIdIdx: index("employee_requests_employee_id_idx").on(table.employeeId),
    typeIdx: index("employee_requests_type_idx").on(table.type),
    statusIdx: index("employee_requests_status_idx").on(table.status),
    createdAtIdx: index("employee_requests_created_at_idx").on(table.createdAt),
  }),
).enableRLS();

export const jobListings = pgTable(
  "job_listings",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("job_listings_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("job_listings_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
    index("job_listings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const jobListingJobs = pgTable(
  "job_listing_jobs",
  {
    id: uuid().primaryKey().defaultRandom(),
    jobListingId: uuid("job_listing_id")
      .notNull()
      .references(() => jobListings.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("job_listing_jobs_job_listing_id_idx").using(
      "btree",
      table.jobListingId.asc().nullsLast().op("uuid_ops"),
    ),
    index("job_listing_jobs_job_id_idx").using(
      "btree",
      table.jobId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
).enableRLS();

export const offices = pgTable(
  "offices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zipCode: text("zip_code").notNull(),
    phone: text(),
    email: text(),
    isActive: boolean().default(true).notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("offices_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const departments = pgTable(
  "departments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    name: text().notNull(),
    description: text(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("departments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const departmentLocations = pgTable(
  "department_locations",
  {
    id: uuid().defaultRandom().primaryKey(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
    locationType: text("location_type").$type<"office" | "branch" | "warehouse">().notNull(),
    locationId: uuid("location_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("department_locations_department_id_idx").using(
      "btree",
      table.departmentId.asc().nullsLast().op("uuid_ops"),
    ),
    index("department_locations_location_id_idx").using(
      "btree",
      table.locationId.asc().nullsLast().op("uuid_ops"),
    ),
    check(
      "department_locations_type_check",
      sql`location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text])`,
    ),
  ],
).enableRLS();

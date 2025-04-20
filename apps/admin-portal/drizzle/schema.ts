import { sql } from "drizzle-orm";
import {
  pgTable,
  pgPolicy,
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

export const clients = pgTable(
  "clients",
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
    phone: text().notNull(),
    company: text(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip_code: text("zip_code").notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("clients_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const invoices = pgTable(
  "invoices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    invoice_number: text("invoice_number").notNull(),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text(),
    client_id: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("invoices_client_id_idx").using(
      "btree",
      table.client_id.asc().nullsLast().op("uuid_ops"),
    ),
    index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("invoices_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
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
  ],
).enableRLS();

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
    quoteNumber: text("quote_number").notNull(),
    issue_date: date("issue_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text(),
    client_id: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
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
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
    quoteId: uuid("quote_id").notNull(),
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
  ],
).enableRLS();

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    full_name: text("full_name"),
    stripe_customer_id: text("stripe_customer_id"),
    avatar_url: text("avatar_url"),
    address: text(),
    email: varchar({ length: 255 }),
    user_settings: jsonb("user_settings"),
    username: text(),
    subscribed_to: text("subscribed_to"),
    price_id: text("price_id"),
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
    user_id: uuid("user_id").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [
    unique("products_sku_key").on(table.sku),
    index("products_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

export const employees = pgTable("employees", {
  id: uuid().primaryKey().defaultRandom(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  hire_date: date("hire_date").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  is_active: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

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
    expenseNumber: text("expense_number").notNull(),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    status: text().default("pending").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    notes: text(),
    client_id: uuid("client_id").notNull(),
    user_id: uuid("user_id").notNull(),
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
      sql`status = ANY (ARRAY[\'pending\'::text, \'paid\'::text, \'overdue\'::text])`,
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
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone(\'utc\'::text, now())`),
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
  },
  (table) => [
    index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("vendors_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

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
    }).default(sql`timezone(\'utc\'::text, now())`),
    payPeriodStart: date("pay_period_start").notNull(),
    payPeriodEnd: date("pay_period_end").notNull(),
    paymentDate: date("payment_date").notNull(),
    grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
    netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
    deductions: jsonb("deductions"),
    notes: text(),
    employeeName: text("employee_name").notNull(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("salaries_payment_date_idx").using("btree", table.paymentDate.asc().nullsLast()),
    index("salaries_employee_name_idx").using(
      "btree",
      table.employeeName.asc().nullsLast().op("text_ops"),
    ),
    index("salaries_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

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
  },
  (table) => [
    index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("warehouses_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    phone: text(),
    email: text(),
    manager: text(),
    is_active: boolean("is_active").default(true).notNull(),
    notes: text(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
    index("branches_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
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
    is_active: boolean("is_active").default(true).notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    user_id: uuid("user_id").notNull(),
  },
  (table) => [
    index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
    index("jobs_user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
  ],
).enableRLS();

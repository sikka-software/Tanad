import { relations } from "drizzle-orm";

import {
  clients,
  invoices,
  invoiceItems,
  quotes,
  quoteItems,
  profiles,
  products,
  employees,
  expenses,
  vendors,
  salaries,
  warehouses,
  branches,
  jobs,
} from "./schema";

export const clientsRelations = relations(clients, ({ many, one }) => ({
  invoices: many(invoices),
  quotes: many(quotes),
  expenses: many(expenses),
  profile: one(profiles, {
    fields: [clients.user_id],
    references: [profiles.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  client: one(clients, {
    fields: [invoices.client_id],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  profile: one(profiles, {
    fields: [invoices.user_id],
    references: [profiles.id],
  }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoice_id],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.product_id],
    references: [products.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ many, one }) => ({
  client: one(clients, {
    fields: [quotes.client_id],
    references: [clients.id],
  }),
  items: many(quoteItems),
  profile: one(profiles, {
    fields: [quotes.user_id],
    references: [profiles.id],
  }),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quote_id],
    references: [quotes.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  clients: many(clients),
  invoices: many(invoices),
  quotes: many(quotes),
  products: many(products),
  expenses: many(expenses),
  vendors: many(vendors),
  salaries: many(salaries),
  warehouses: many(warehouses),
  branches: many(branches),
  jobs: many(jobs),
}));

export const productsRelations = relations(products, ({ one }) => ({
  profile: one(profiles, {
    fields: [products.user_id],
    references: [profiles.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  client: one(clients, {
    fields: [expenses.client_id],
    references: [clients.id],
  }),
  profile: one(profiles, {
    fields: [expenses.user_id],
    references: [profiles.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  profile: one(profiles, {
    fields: [vendors.user_id],
    references: [profiles.id],
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  profile: one(profiles, {
    fields: [salaries.user_id],
    references: [profiles.id],
  }),
}));

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  profile: one(profiles, {
    fields: [warehouses.user_id],
    references: [profiles.id],
  }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  profile: one(profiles, {
    fields: [branches.user_id],
    references: [profiles.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  profile: one(profiles, {
    fields: [jobs.user_id],
    references: [profiles.id],
  }),
}));

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
  companies,
  departments,
  departmentLocations,
  offices,
} from "./schema";

export const clientsRelations = relations(clients, ({ many, one }) => ({
  invoices: many(invoices),
  quotes: many(quotes),
  expenses: many(expenses),
  profile: one(profiles, {
    fields: [clients.userId],
    references: [profiles.id],
  }),
  company: one(companies, {
    fields: [clients.company],
    references: [companies.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  profile: one(profiles, {
    fields: [invoices.userId],
    references: [profiles.id],
  }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ many, one }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  items: many(quoteItems),
  profile: one(profiles, {
    fields: [quotes.userId],
    references: [profiles.id],
  }),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
  product: one(products, {
    fields: [quoteItems.productId],
    references: [products.id],
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
    fields: [products.userId],
    references: [profiles.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  client: one(clients, {
    fields: [expenses.clientId],
    references: [clients.id],
  }),
  profile: one(profiles, {
    fields: [expenses.userId],
    references: [profiles.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  profile: one(profiles, {
    fields: [vendors.userId],
    references: [profiles.id],
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  profile: one(profiles, {
    fields: [salaries.userId],
    references: [profiles.id],
  }),
}));

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  profile: one(profiles, {
    fields: [warehouses.userId],
    references: [profiles.id],
  }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  profile: one(profiles, {
    fields: [branches.userId],
    references: [profiles.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  profile: one(profiles, {
    fields: [jobs.userId],
    references: [profiles.id],
  }),
}));

export const departmentsRelations = relations(departments, ({ many, one }) => ({
  employees: many(employees),
  locations: many(departmentLocations),
  profile: one(profiles, {
    fields: [departments.userId],
    references: [profiles.id],
  }),
}));

export const departmentLocationsRelations = relations(departmentLocations, ({ one }) => ({
  department: one(departments, {
    fields: [departmentLocations.departmentId],
    references: [departments.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
}));

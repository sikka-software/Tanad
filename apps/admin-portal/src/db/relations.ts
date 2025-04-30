import { relations } from "drizzle-orm/relations";

import {
  jobs,
  job_listing_jobs,
  job_listings,
  employees,
  employee_requests,
  sso_providersInAuth,
  saml_providersInAuth,
  flow_stateInAuth,
  saml_relay_statesInAuth,
  products,
  invoice_items,
  usersInAuth,
  identitiesInAuth,
  sessionsInAuth,
  refresh_tokensInAuth,
  mfa_factorsInAuth,
  one_time_tokensInAuth,
  mfa_amr_claimsInAuth,
  mfa_challengesInAuth,
  sso_domainsInAuth,
  departments,
  department_locations,
  clients,
  quotes,
  salaries,
  quote_items,
  companies,
  user_enterprise_roles,
  profiles,
  roles,
  permissions,
  enterprises,
  memberships,
  invoices,
  expenses,
  user_roles,
} from "./schema";

export const job_listing_jobsRelations = relations(job_listing_jobs, ({ one }) => ({
  job: one(jobs, {
    fields: [job_listing_jobs.job_id],
    references: [jobs.id],
  }),
  job_listing: one(job_listings, {
    fields: [job_listing_jobs.job_listing_id],
    references: [job_listings.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  job_listing_jobs: many(job_listing_jobs),
}));

export const job_listingsRelations = relations(job_listings, ({ many }) => ({
  job_listing_jobs: many(job_listing_jobs),
}));

export const employee_requestsRelations = relations(employee_requests, ({ one }) => ({
  employee: one(employees, {
    fields: [employee_requests.employee_id],
    references: [employees.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  employee_requests: many(employee_requests),
  department: one(departments, {
    fields: [employees.department_id],
    references: [departments.id],
  }),
  salaries: many(salaries),
}));

export const saml_providersInAuthRelations = relations(saml_providersInAuth, ({ one }) => ({
  sso_providersInAuth: one(sso_providersInAuth, {
    fields: [saml_providersInAuth.sso_provider_id],
    references: [sso_providersInAuth.id],
  }),
}));

export const sso_providersInAuthRelations = relations(sso_providersInAuth, ({ many }) => ({
  saml_providersInAuths: many(saml_providersInAuth),
  saml_relay_statesInAuths: many(saml_relay_statesInAuth),
  sso_domainsInAuths: many(sso_domainsInAuth),
}));

export const saml_relay_statesInAuthRelations = relations(saml_relay_statesInAuth, ({ one }) => ({
  flow_stateInAuth: one(flow_stateInAuth, {
    fields: [saml_relay_statesInAuth.flow_state_id],
    references: [flow_stateInAuth.id],
  }),
  sso_providersInAuth: one(sso_providersInAuth, {
    fields: [saml_relay_statesInAuth.sso_provider_id],
    references: [sso_providersInAuth.id],
  }),
}));

export const flow_stateInAuthRelations = relations(flow_stateInAuth, ({ many }) => ({
  saml_relay_statesInAuths: many(saml_relay_statesInAuth),
}));

export const invoice_itemsRelations = relations(invoice_items, ({ one }) => ({
  product: one(products, {
    fields: [invoice_items.product_id],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  invoice_items: many(invoice_items),
  quote_items: many(quote_items),
}));

export const identitiesInAuthRelations = relations(identitiesInAuth, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [identitiesInAuth.user_id],
    references: [usersInAuth.id],
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  identitiesInAuths: many(identitiesInAuth),
  sessionsInAuths: many(sessionsInAuth),
  mfa_factorsInAuths: many(mfa_factorsInAuth),
  one_time_tokensInAuths: many(one_time_tokensInAuth),
  user_enterprise_roles: many(user_enterprise_roles),
  profiles: many(profiles),
  user_roles: many(user_roles),
}));

export const sessionsInAuthRelations = relations(sessionsInAuth, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [sessionsInAuth.user_id],
    references: [usersInAuth.id],
  }),
  refresh_tokensInAuths: many(refresh_tokensInAuth),
  mfa_amr_claimsInAuths: many(mfa_amr_claimsInAuth),
}));

export const refresh_tokensInAuthRelations = relations(refresh_tokensInAuth, ({ one }) => ({
  sessionsInAuth: one(sessionsInAuth, {
    fields: [refresh_tokensInAuth.session_id],
    references: [sessionsInAuth.id],
  }),
}));

export const mfa_factorsInAuthRelations = relations(mfa_factorsInAuth, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [mfa_factorsInAuth.user_id],
    references: [usersInAuth.id],
  }),
  mfa_challengesInAuths: many(mfa_challengesInAuth),
}));

export const one_time_tokensInAuthRelations = relations(one_time_tokensInAuth, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [one_time_tokensInAuth.user_id],
    references: [usersInAuth.id],
  }),
}));

export const mfa_amr_claimsInAuthRelations = relations(mfa_amr_claimsInAuth, ({ one }) => ({
  sessionsInAuth: one(sessionsInAuth, {
    fields: [mfa_amr_claimsInAuth.session_id],
    references: [sessionsInAuth.id],
  }),
}));

export const mfa_challengesInAuthRelations = relations(mfa_challengesInAuth, ({ one }) => ({
  mfa_factorsInAuth: one(mfa_factorsInAuth, {
    fields: [mfa_challengesInAuth.factor_id],
    references: [mfa_factorsInAuth.id],
  }),
}));

export const sso_domainsInAuthRelations = relations(sso_domainsInAuth, ({ one }) => ({
  sso_providersInAuth: one(sso_providersInAuth, {
    fields: [sso_domainsInAuth.sso_provider_id],
    references: [sso_providersInAuth.id],
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
  department_locations: many(department_locations),
}));

export const department_locationsRelations = relations(department_locations, ({ one }) => ({
  department: one(departments, {
    fields: [department_locations.department_id],
    references: [departments.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotes.client_id],
    references: [clients.id],
  }),
  quote_items: many(quote_items),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  quotes: many(quotes),
  company: one(companies, {
    fields: [clients.company],
    references: [companies.id],
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, {
    fields: [salaries.employee_id],
    references: [employees.id],
  }),
}));

export const quote_itemsRelations = relations(quote_items, ({ one }) => ({
  product: one(products, {
    fields: [quote_items.product_id],
    references: [products.id],
  }),
  quote: one(quotes, {
    fields: [quote_items.quote_id],
    references: [quotes.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  clients: many(clients),
}));

export const user_enterprise_rolesRelations = relations(user_enterprise_roles, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user_enterprise_roles.user_id],
    references: [usersInAuth.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [profiles.id],
    references: [usersInAuth.id],
  }),
  memberships: many(memberships),
  invoices: many(invoices),
  expenses: many(expenses),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  role: one(roles, {
    fields: [permissions.role_id],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(permissions),
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [memberships.enterprise_id],
    references: [enterprises.id],
  }),
  profile: one(profiles, {
    fields: [memberships.profile_id],
    references: [profiles.id],
  }),
  role: one(roles, {
    fields: [memberships.role_id],
    references: [roles.id],
  }),
}));

export const enterprisesRelations = relations(enterprises, ({ many }) => ({
  memberships: many(memberships),
  invoices: many(invoices),
  expenses: many(expenses),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  profile: one(profiles, {
    fields: [invoices.created_by],
    references: [profiles.id],
  }),
  enterprise: one(enterprises, {
    fields: [invoices.enterprise_id],
    references: [enterprises.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  profile: one(profiles, {
    fields: [expenses.created_by],
    references: [profiles.id],
  }),
  enterprise: one(enterprises, {
    fields: [expenses.enterprise_id],
    references: [enterprises.id],
  }),
}));

export const user_rolesRelations = relations(user_roles, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user_roles.user_id],
    references: [usersInAuth.id],
  }),
}));

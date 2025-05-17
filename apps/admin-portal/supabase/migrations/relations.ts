import { relations } from "drizzle-orm/relations";

import {
  companies,
  clients,
  employees,
  branches,
  enterprises,
  memberships,
  profiles,
  roles,
  products,
  invoice_items,
  usersInAuth,
  one_time_tokensInAuth,
  sessionsInAuth,
  refresh_tokensInAuth,
  identitiesInAuth,
  mfa_amr_claimsInAuth,
  mfa_factorsInAuth,
  mfa_challengesInAuth,
  sso_providersInAuth,
  saml_providersInAuth,
  flow_stateInAuth,
  saml_relay_statesInAuth,
  sso_domainsInAuth,
  user_enterprise_roles,
  departments,
  department_locations,
  jobs,
  job_listing_jobs,
  job_listings,
  employee_requests,
  quote_items,
  quotes,
  permissions,
  expenses,
  cars,
  domains,
  invoices,
  offices,
  online_stores,
  purchases,
  salaries,
  servers,
  trucks,
  warehouses,
  websites,
  subscription_reactivations,
  user_roles,
  activity_logs,
} from "./schema";

export const clientsRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.company],
    references: [companies.id],
  }),
  invoices: many(invoices),
  quotes: many(quotes),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  clients: many(clients),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  employee: one(employees, {
    fields: [branches.manager],
    references: [employees.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  branches: many(branches),
  employee_requests: many(employee_requests),
  job: one(jobs, {
    fields: [employees.job_id],
    references: [jobs.id],
  }),
  offices: many(offices),
  salaries: many(salaries),
  warehouses: many(warehouses),
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
  roles: many(roles),
  expenses: many(expenses),
  cars: many(cars),
  domains: many(domains),
  invoices: many(invoices),
  online_stores: many(online_stores),
  purchases: many(purchases),
  servers: many(servers),
  trucks: many(trucks),
  websites: many(websites),
  activity_logs: many(activity_logs),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  memberships: many(memberships),
  usersInAuth: one(usersInAuth, {
    fields: [profiles.id],
    references: [usersInAuth.id],
  }),
  expenses: many(expenses),
  invoices: many(invoices),
  quotes: many(quotes),
  purchases: many(purchases),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  memberships: many(memberships),
  enterprise: one(enterprises, {
    fields: [roles.enterprise_id],
    references: [enterprises.id],
  }),
  permissions: many(permissions),
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

export const one_time_tokensInAuthRelations = relations(one_time_tokensInAuth, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [one_time_tokensInAuth.user_id],
    references: [usersInAuth.id],
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  one_time_tokensInAuths: many(one_time_tokensInAuth),
  identitiesInAuths: many(identitiesInAuth),
  mfa_factorsInAuths: many(mfa_factorsInAuth),
  sessionsInAuths: many(sessionsInAuth),
  user_enterprise_roles: many(user_enterprise_roles),
  profiles: many(profiles),
  cars: many(cars),
  domains: many(domains),
  online_stores: many(online_stores),
  servers: many(servers),
  trucks: many(trucks),
  websites: many(websites),
  subscription_reactivations: many(subscription_reactivations),
  user_roles: many(user_roles),
  activity_logs: many(activity_logs),
}));

export const refresh_tokensInAuthRelations = relations(refresh_tokensInAuth, ({ one }) => ({
  sessionsInAuth: one(sessionsInAuth, {
    fields: [refresh_tokensInAuth.session_id],
    references: [sessionsInAuth.id],
  }),
}));

export const sessionsInAuthRelations = relations(sessionsInAuth, ({ one, many }) => ({
  refresh_tokensInAuths: many(refresh_tokensInAuth),
  mfa_amr_claimsInAuths: many(mfa_amr_claimsInAuth),
  usersInAuth: one(usersInAuth, {
    fields: [sessionsInAuth.user_id],
    references: [usersInAuth.id],
  }),
}));

export const identitiesInAuthRelations = relations(identitiesInAuth, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [identitiesInAuth.user_id],
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

export const mfa_factorsInAuthRelations = relations(mfa_factorsInAuth, ({ one, many }) => ({
  mfa_challengesInAuths: many(mfa_challengesInAuth),
  usersInAuth: one(usersInAuth, {
    fields: [mfa_factorsInAuth.user_id],
    references: [usersInAuth.id],
  }),
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

export const sso_domainsInAuthRelations = relations(sso_domainsInAuth, ({ one }) => ({
  sso_providersInAuth: one(sso_providersInAuth, {
    fields: [sso_domainsInAuth.sso_provider_id],
    references: [sso_providersInAuth.id],
  }),
}));

export const user_enterprise_rolesRelations = relations(user_enterprise_roles, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user_enterprise_roles.user_id],
    references: [usersInAuth.id],
  }),
}));

export const department_locationsRelations = relations(department_locations, ({ one }) => ({
  department: one(departments, {
    fields: [department_locations.department_id],
    references: [departments.id],
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  department_locations: many(department_locations),
}));

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
  employees: many(employees),
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

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  quote_items: many(quote_items),
  client: one(clients, {
    fields: [quotes.client_id],
    references: [clients.id],
  }),
  profile: one(profiles, {
    fields: [quotes.created_by],
    references: [profiles.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  role: one(roles, {
    fields: [permissions.role_id],
    references: [roles.id],
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

export const carsRelations = relations(cars, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [cars.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [cars.user_id],
    references: [usersInAuth.id],
  }),
}));

export const domainsRelations = relations(domains, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [domains.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [domains.user_id],
    references: [usersInAuth.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, {
    fields: [invoices.client_id],
    references: [clients.id],
  }),
  profile: one(profiles, {
    fields: [invoices.created_by],
    references: [profiles.id],
  }),
  enterprise: one(enterprises, {
    fields: [invoices.enterprise_id],
    references: [enterprises.id],
  }),
}));

export const officesRelations = relations(offices, ({ one }) => ({
  employee: one(employees, {
    fields: [offices.manager],
    references: [employees.id],
  }),
}));

export const online_storesRelations = relations(online_stores, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [online_stores.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [online_stores.user_id],
    references: [usersInAuth.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  profile: one(profiles, {
    fields: [purchases.created_by],
    references: [profiles.id],
  }),
  enterprise: one(enterprises, {
    fields: [purchases.enterprise_id],
    references: [enterprises.id],
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  employee: one(employees, {
    fields: [salaries.employee_id],
    references: [employees.id],
  }),
}));

export const serversRelations = relations(servers, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [servers.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [servers.user_id],
    references: [usersInAuth.id],
  }),
}));

export const trucksRelations = relations(trucks, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [trucks.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [trucks.user_id],
    references: [usersInAuth.id],
  }),
}));

export const warehousesRelations = relations(warehouses, ({ one }) => ({
  employee: one(employees, {
    fields: [warehouses.manager],
    references: [employees.id],
  }),
}));

export const websitesRelations = relations(websites, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [websites.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [websites.user_id],
    references: [usersInAuth.id],
  }),
}));

export const subscription_reactivationsRelations = relations(
  subscription_reactivations,
  ({ one }) => ({
    usersInAuth: one(usersInAuth, {
      fields: [subscription_reactivations.user_id],
      references: [usersInAuth.id],
    }),
  }),
);

export const user_rolesRelations = relations(user_roles, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user_roles.user_id],
    references: [usersInAuth.id],
  }),
}));

export const activity_logsRelations = relations(activity_logs, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [activity_logs.enterprise_id],
    references: [enterprises.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [activity_logs.user_id],
    references: [usersInAuth.id],
  }),
}));

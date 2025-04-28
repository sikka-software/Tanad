import { relations } from "drizzle-orm/relations";
import { enterprises, products, templates, documents, job_listing_jobs, jobs, job_listings, employees, employee_requests, profiles, invoices, invoice_items, clients, offices, departments, department_locations, expenses, quotes, salaries, vendors, warehouses, branches, companies, quote_items, user_roles } from "./schema";

export const productsRelations = relations(products, ({one, many}) => ({
	enterprise: one(enterprises, {
		fields: [products.enterprise_id],
		references: [enterprises.id]
	}),
	invoice_items: many(invoice_items),
	quote_items: many(quote_items),
}));

export const enterprisesRelations = relations(enterprises, ({many}) => ({
	products: many(products),
	templates: many(templates),
	documents: many(documents),
	job_listing_jobs: many(job_listing_jobs),
	employee_requests: many(employee_requests),
	profiles: many(profiles),
	invoices: many(invoices),
	job_listings: many(job_listings),
	offices: many(offices),
	department_locations: many(department_locations),
	employees: many(employees),
	expenses: many(expenses),
	quotes: many(quotes),
	salaries: many(salaries),
	departments: many(departments),
	jobs: many(jobs),
	vendors: many(vendors),
	warehouses: many(warehouses),
	branches: many(branches),
	companies: many(companies),
	clients: many(clients),
	user_roles: many(user_roles),
}));

export const templatesRelations = relations(templates, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [templates.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [documents.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const job_listing_jobsRelations = relations(job_listing_jobs, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [job_listing_jobs.enterprise_id],
		references: [enterprises.id]
	}),
	job: one(jobs, {
		fields: [job_listing_jobs.job_id],
		references: [jobs.id]
	}),
	job_listing: one(job_listings, {
		fields: [job_listing_jobs.job_listing_id],
		references: [job_listings.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	job_listing_jobs: many(job_listing_jobs),
	enterprise: one(enterprises, {
		fields: [jobs.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const job_listingsRelations = relations(job_listings, ({one, many}) => ({
	job_listing_jobs: many(job_listing_jobs),
	enterprise: one(enterprises, {
		fields: [job_listings.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const employee_requestsRelations = relations(employee_requests, ({one}) => ({
	employee: one(employees, {
		fields: [employee_requests.employee_id],
		references: [employees.id]
	}),
	enterprise: one(enterprises, {
		fields: [employee_requests.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	employee_requests: many(employee_requests),
	department: one(departments, {
		fields: [employees.department_id],
		references: [departments.id]
	}),
	enterprise: one(enterprises, {
		fields: [employees.enterprise_id],
		references: [enterprises.id]
	}),
	salaries: many(salaries),
}));

export const profilesRelations = relations(profiles, ({one, many}) => ({
	enterprise: one(enterprises, {
		fields: [profiles.enterprise_id],
		references: [enterprises.id]
	}),
	user_roles: many(user_roles),
}));

export const invoice_itemsRelations = relations(invoice_items, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoice_items.invoice_id],
		references: [invoices.id]
	}),
	product: one(products, {
		fields: [invoice_items.product_id],
		references: [products.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	invoice_items: many(invoice_items),
	client: one(clients, {
		fields: [invoices.client_id],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [invoices.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const clientsRelations = relations(clients, ({one, many}) => ({
	invoices: many(invoices),
	expenses: many(expenses),
	quotes: many(quotes),
	company: one(companies, {
		fields: [clients.company],
		references: [companies.id]
	}),
	enterprise: one(enterprises, {
		fields: [clients.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const officesRelations = relations(offices, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [offices.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const department_locationsRelations = relations(department_locations, ({one}) => ({
	department: one(departments, {
		fields: [department_locations.department_id],
		references: [departments.id]
	}),
	enterprise: one(enterprises, {
		fields: [department_locations.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const departmentsRelations = relations(departments, ({one, many}) => ({
	department_locations: many(department_locations),
	employees: many(employees),
	enterprise: one(enterprises, {
		fields: [departments.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	client: one(clients, {
		fields: [expenses.client_id],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [expenses.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	client: one(clients, {
		fields: [quotes.client_id],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [quotes.enterprise_id],
		references: [enterprises.id]
	}),
	quote_items: many(quote_items),
}));

export const salariesRelations = relations(salaries, ({one}) => ({
	employee: one(employees, {
		fields: [salaries.employee_id],
		references: [employees.id]
	}),
	enterprise: one(enterprises, {
		fields: [salaries.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const vendorsRelations = relations(vendors, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [vendors.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const warehousesRelations = relations(warehouses, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [warehouses.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const branchesRelations = relations(branches, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [branches.enterprise_id],
		references: [enterprises.id]
	}),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	enterprise: one(enterprises, {
		fields: [companies.enterprise_id],
		references: [enterprises.id]
	}),
	clients: many(clients),
}));

export const quote_itemsRelations = relations(quote_items, ({one}) => ({
	product: one(products, {
		fields: [quote_items.product_id],
		references: [products.id]
	}),
	quote: one(quotes, {
		fields: [quote_items.quote_id],
		references: [quotes.id]
	}),
}));

export const user_rolesRelations = relations(user_roles, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [user_roles.enterprise_id],
		references: [enterprises.id]
	}),
	profile: one(profiles, {
		fields: [user_roles.user_id],
		references: [profiles.id]
	}),
}));
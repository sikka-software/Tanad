import { relations } from "drizzle-orm/relations";
import { enterprises, templates, documents, products, userRoles, usersInAuth, employees, employeeRequests, jobListingJobs, jobs, jobListings, clients, invoices, invoiceItems, profiles, offices, departments, departmentLocations, expenses, quotes, salaries, vendors, warehouses, branches, companies, quoteItems } from "./schema";

export const templatesRelations = relations(templates, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [templates.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const enterprisesRelations = relations(enterprises, ({many}) => ({
	templates: many(templates),
	documents: many(documents),
	products: many(products),
	userRoles: many(userRoles),
	employeeRequests: many(employeeRequests),
	jobListingJobs: many(jobListingJobs),
	invoices: many(invoices),
	jobListings: many(jobListings),
	profiles: many(profiles),
	offices: many(offices),
	departmentLocations: many(departmentLocations),
	employees: many(employees),
	expenses: many(expenses),
	quotes: many(quotes),
	salaries: many(salaries),
	vendors: many(vendors),
	departments: many(departments),
	warehouses: many(warehouses),
	jobs: many(jobs),
	branches: many(branches),
	companies: many(companies),
	clients: many(clients),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [documents.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	enterprise: one(enterprises, {
		fields: [products.enterpriseId],
		references: [enterprises.id]
	}),
	invoiceItems: many(invoiceItems),
	quoteItems: many(quoteItems),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [userRoles.enterpriseId],
		references: [enterprises.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [userRoles.user_id],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	userRoles: many(userRoles),
}));

export const employeeRequestsRelations = relations(employeeRequests, ({one}) => ({
	employee: one(employees, {
		fields: [employeeRequests.employeeId],
		references: [employees.id]
	}),
	enterprise: one(enterprises, {
		fields: [employeeRequests.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	employeeRequests: many(employeeRequests),
	department: one(departments, {
		fields: [employees.departmentId],
		references: [departments.id]
	}),
	enterprise: one(enterprises, {
		fields: [employees.enterpriseId],
		references: [enterprises.id]
	}),
	salaries: many(salaries),
}));

export const jobListingJobsRelations = relations(jobListingJobs, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [jobListingJobs.enterpriseId],
		references: [enterprises.id]
	}),
	job: one(jobs, {
		fields: [jobListingJobs.jobId],
		references: [jobs.id]
	}),
	jobListing: one(jobListings, {
		fields: [jobListingJobs.jobListingId],
		references: [jobListings.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	jobListingJobs: many(jobListingJobs),
	enterprise: one(enterprises, {
		fields: [jobs.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const jobListingsRelations = relations(jobListings, ({one, many}) => ({
	jobListingJobs: many(jobListingJobs),
	enterprise: one(enterprises, {
		fields: [jobListings.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [invoices.enterpriseId],
		references: [enterprises.id]
	}),
	invoiceItems: many(invoiceItems),
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
		fields: [clients.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
	product: one(products, {
		fields: [invoiceItems.productId],
		references: [products.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [profiles.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const officesRelations = relations(offices, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [offices.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const departmentLocationsRelations = relations(departmentLocations, ({one}) => ({
	department: one(departments, {
		fields: [departmentLocations.departmentId],
		references: [departments.id]
	}),
	enterprise: one(enterprises, {
		fields: [departmentLocations.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const departmentsRelations = relations(departments, ({one, many}) => ({
	departmentLocations: many(departmentLocations),
	employees: many(employees),
	enterprise: one(enterprises, {
		fields: [departments.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	client: one(clients, {
		fields: [expenses.clientId],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [expenses.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	client: one(clients, {
		fields: [quotes.clientId],
		references: [clients.id]
	}),
	enterprise: one(enterprises, {
		fields: [quotes.enterpriseId],
		references: [enterprises.id]
	}),
	quoteItems: many(quoteItems),
}));

export const salariesRelations = relations(salaries, ({one}) => ({
	employee: one(employees, {
		fields: [salaries.employeeId],
		references: [employees.id]
	}),
	enterprise: one(enterprises, {
		fields: [salaries.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const vendorsRelations = relations(vendors, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [vendors.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const warehousesRelations = relations(warehouses, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [warehouses.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const branchesRelations = relations(branches, ({one}) => ({
	enterprise: one(enterprises, {
		fields: [branches.enterpriseId],
		references: [enterprises.id]
	}),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	enterprise: one(enterprises, {
		fields: [companies.enterpriseId],
		references: [enterprises.id]
	}),
	clients: many(clients),
}));

export const quoteItemsRelations = relations(quoteItems, ({one}) => ({
	product: one(products, {
		fields: [quoteItems.productId],
		references: [products.id]
	}),
	quote: one(quotes, {
		fields: [quoteItems.quoteId],
		references: [quotes.id]
	}),
}));
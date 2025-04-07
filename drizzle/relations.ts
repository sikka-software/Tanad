import { relations } from "drizzle-orm/relations";
import { clients, invoices, usersInAuth, profiles, invoiceItems } from "./schema";

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	invoiceItems: many(invoiceItems),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	invoices: many(invoices),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profiles: many(profiles),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
}));
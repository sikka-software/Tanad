import { pgTable, index, foreignKey, check, uuid, timestamp, text, jsonb, boolean, numeric, unique, date, pgSchema, uniqueIndex, pgPolicy, varchar, smallint, json, inet, bigserial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");
export const aalLevelInAuth = auth.enum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", ['s256', 'plain'])
export const factorStatusInAuth = auth.enum("factor_status", ['unverified', 'verified'])
export const factorTypeInAuth = auth.enum("factor_type", ['totp', 'webauthn', 'phone'])
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const appPermission = pgEnum("app_permission", ['profiles.create', 'profiles.read', 'profiles.update', 'profiles.delete', 'profiles.export', 'enterprises.create', 'enterprises.read', 'enterprises.update', 'enterprises.delete', 'enterprises.export', 'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete', 'invoices.export', 'invoices.duplicate', 'products.create', 'products.read', 'products.update', 'products.delete', 'products.export', 'quotes.create', 'quotes.read', 'quotes.update', 'quotes.delete', 'quotes.export', 'quotes.duplicate', 'employees.create', 'employees.read', 'employees.update', 'employees.delete', 'employees.export', 'salaries.create', 'salaries.read', 'salaries.update', 'salaries.delete', 'salaries.export', 'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.export', 'templates.create', 'templates.read', 'templates.update', 'templates.delete', 'templates.export', 'templates.duplicate', 'employee_requests.create', 'employee_requests.read', 'employee_requests.update', 'employee_requests.delete', 'employee_requests.export', 'job_listings.create', 'job_listings.read', 'job_listings.update', 'job_listings.delete', 'job_listings.export', 'offices.create', 'offices.read', 'offices.update', 'offices.delete', 'offices.export', 'expenses.create', 'expenses.read', 'expenses.update', 'expenses.delete', 'expenses.export', 'expenses.duplicate', 'departments.create', 'departments.read', 'departments.update', 'departments.delete', 'departments.export', 'warehouses.create', 'warehouses.read', 'warehouses.update', 'warehouses.delete', 'warehouses.export', 'vendors.create', 'vendors.read', 'vendors.update', 'vendors.delete', 'vendors.export', 'clients.create', 'clients.read', 'clients.update', 'clients.delete', 'clients.export', 'companies.create', 'companies.read', 'companies.update', 'companies.delete', 'companies.export', 'branches.create', 'branches.read', 'branches.update', 'branches.delete', 'branches.export'])
export const appRole = pgEnum("app_role", ['superadmin', 'admin', 'accounting', 'hr'])


export const templates = pgTable("templates", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	type: text().notNull(),
	content: jsonb().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("templates_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "templates_enterprise_id_enterprises_id_fk"
		}),
	check("templates_type_check", sql`type = ANY (ARRAY['invoice'::text, 'quote'::text])`),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	url: text().notNull(),
	filePath: text("file_path").notNull(),
	entityId: uuid("entity_id").notNull(),
	entityType: text("entity_type").notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("documents_entity_id_idx").using("btree", table.entityId.asc().nullsLast().op("uuid_ops")),
	index("documents_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("documents_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "documents_enterprise_id_enterprises_id_fk"
		}),
	check("documents_entity_type_check", sql`entity_type = ANY (ARRAY['company'::text, 'expense'::text])`),
]);

export const products = pgTable("products", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	sku: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	cost: numeric({ precision: 10, scale:  2 }),
	quantity: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	unit: text(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("products_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	index("products_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "products_enterprise_id_enterprises_id_fk"
		}),
]);

export const userRoles = pgTable("user_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	role: appRole().notNull(),
	enterpriseId: uuid("enterprise_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "user_roles_enterprise_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_roles_user_id_role_enterprise_id_key").on(table.userId, table.role, table.enterpriseId),
]);

export const rolePermissions = pgTable("role_permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	role: appRole().notNull(),
	permission: appPermission().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("role_permissions_role_permission_key").on(table.role, table.permission),
]);

export const employeeRequests = pgTable("employee_requests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	type: text().notNull(),
	status: text().default('pending').notNull(),
	title: text().notNull(),
	description: text(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	amount: numeric({ precision: 10, scale:  2 }),
	attachments: jsonb().default([]),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("employee_requests_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("employee_requests_employee_id_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	index("employee_requests_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("employee_requests_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("employee_requests_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "employee_requests_employee_id_employees_id_fk"
		}),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "employee_requests_enterprise_id_enterprises_id_fk"
		}),
]);

export const jobListingJobs = pgTable("job_listing_jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobListingId: uuid("job_listing_id").notNull(),
	jobId: uuid("job_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("job_listing_jobs_job_id_idx").using("btree", table.jobId.asc().nullsLast().op("uuid_ops")),
	index("job_listing_jobs_job_listing_id_idx").using("btree", table.jobListingId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "job_listing_jobs_enterprise_id_enterprises_id_fk"
		}),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "job_listing_jobs_job_id_jobs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.jobListingId],
			foreignColumns: [jobListings.id],
			name: "job_listing_jobs_job_listing_id_job_listings_id_fk"
		}).onDelete("cascade"),
]);

export const samlProvidersInAuth = auth.table("saml_providers", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	entityId: text("entity_id").notNull(),
	metadataXml: text("metadata_xml").notNull(),
	metadataUrl: text("metadata_url"),
	attributeMapping: jsonb("attribute_mapping"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	nameIdFormat: text("name_id_format"),
}, (table) => [
	index("saml_providers_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_providers_sso_provider_id_fkey"
		}).onDelete("cascade"),
	unique("saml_providers_entity_id_key").on(table.entityId),
	check("entity_id not empty", sql`char_length(entity_id) > 0`),
	check("metadata_url not empty", sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`),
	check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
]);

export const samlRelayStatesInAuth = auth.table("saml_relay_states", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	requestId: text("request_id").notNull(),
	forEmail: text("for_email"),
	redirectTo: text("redirect_to"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	flowStateId: uuid("flow_state_id"),
}, (table) => [
	index("saml_relay_states_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("saml_relay_states_for_email_idx").using("btree", table.forEmail.asc().nullsLast().op("text_ops")),
	index("saml_relay_states_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.flowStateId],
			foreignColumns: [flowStateInAuth.id],
			name: "saml_relay_states_flow_state_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_relay_states_sso_provider_id_fkey"
		}).onDelete("cascade"),
	check("request_id not empty", sql`char_length(request_id) > 0`),
]);

export const invoices = pgTable("invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	invoiceNumber: text("invoice_number").notNull(),
	issueDate: date("issue_date").notNull(),
	dueDate: date("due_date").notNull(),
	status: text().notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  2 }).default('0'),
	notes: text(),
	clientId: uuid("client_id").notNull(),
	userId: uuid("user_id").notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
	total: numeric({ precision: 10, scale:  2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("invoices_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("invoices_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "invoices_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "invoices_enterprise_id_enterprises_id_fk"
		}),
	check("invoices_status_check", sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])`),
]);

export const usersInAuth = auth.table("users", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey().notNull(),
	aud: varchar({ length: 255 }),
	role: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	encryptedPassword: varchar("encrypted_password", { length: 255 }),
	emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true, mode: 'string' }),
	invitedAt: timestamp("invited_at", { withTimezone: true, mode: 'string' }),
	confirmationToken: varchar("confirmation_token", { length: 255 }),
	confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true, mode: 'string' }),
	recoveryToken: varchar("recovery_token", { length: 255 }),
	recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true, mode: 'string' }),
	emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
	emailChange: varchar("email_change", { length: 255 }),
	emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true, mode: 'string' }),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: 'string' }),
	rawAppMetaData: jsonb("raw_app_meta_data"),
	rawUserMetaData: jsonb("raw_user_meta_data"),
	isSuperAdmin: boolean("is_super_admin"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	phone: text().default(sql`NULL`),
	phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true, mode: 'string' }),
	phoneChange: text("phone_change").default(sql`NULL`),
	phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(sql`NULL`),
	phoneChangeSentAt: timestamp("phone_change_sent_at", { withTimezone: true, mode: 'string' }).default(sql`NULL`),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: 'string' }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
	emailChangeTokenCurrent: varchar("email_change_token_current", { length: 255 }).default(''),
	emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
	bannedUntil: timestamp("banned_until", { withTimezone: true, mode: 'string' }),
	reauthenticationToken: varchar("reauthentication_token", { length: 255 }).default(''),
	reauthenticationSentAt: timestamp("reauthentication_sent_at", { withTimezone: true, mode: 'string' }),
	isSsoUser: boolean("is_sso_user").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
}, (table) => [
	uniqueIndex("confirmation_token_idx").using("btree", table.confirmationToken.asc().nullsLast().op("text_ops")).where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("email_change_token_current_idx").using("btree", table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops")).where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("email_change_token_new_idx").using("btree", table.emailChangeTokenNew.asc().nullsLast().op("text_ops")).where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("reauthentication_token_idx").using("btree", table.reauthenticationToken.asc().nullsLast().op("text_ops")).where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("recovery_token_idx").using("btree", table.recoveryToken.asc().nullsLast().op("text_ops")).where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("users_email_partial_key").using("btree", table.email.asc().nullsLast().op("text_ops")).where(sql`(is_sso_user = false)`),
	index("users_instance_id_email_idx").using("btree", sql`instance_id`, sql`lower((email)::text)`),
	index("users_instance_id_idx").using("btree", table.instanceId.asc().nullsLast().op("uuid_ops")),
	index("users_is_anonymous_idx").using("btree", table.isAnonymous.asc().nullsLast().op("bool_ops")),
	unique("users_phone_key").on(table.phone),
	pgPolicy("Users can view their own user data", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(auth.uid() = id)` }),
	check("users_email_change_confirm_status_check", sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`),
]);

export const ssoProvidersInAuth = auth.table("sso_providers", {
	id: uuid().primaryKey().notNull(),
	resourceId: text("resource_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
	check("resource_id not empty", sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`),
]);

export const invoiceItems = pgTable("invoice_items", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	description: text().notNull(),
	quantity: numeric({ precision: 10, scale:  2 }).default('1').notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
	invoiceId: uuid("invoice_id").notNull(),
	productId: uuid("product_id"),
}, (table) => [
	index("invoice_items_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "invoice_items_invoice_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "invoice_items_product_id_fkey"
		}),
]);

export const jobListings = pgTable("job_listings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
}, (table) => [
	index("job_listings_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("job_listings_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
	index("job_listings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "job_listings_enterprise_id_enterprises_id_fk"
		}),
	unique("job_listings_slug_unique").on(table.slug),
]);

export const profiles = pgTable("profiles", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	fullName: text("full_name"),
	email: text().notNull(),
	userSettings: jsonb("user_settings"),
	enterpriseId: uuid("enterprise_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
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
	userId: uuid("user_id").notNull(),
}, (table) => [
	index("profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("profiles_enterprise_id_idx").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	index("profiles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("profiles_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "profiles_enterprise_id_enterprises_id_fk"
		}),
]);

export const offices = pgTable("offices", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	phone: text(),
	email: text(),
	isActive: boolean("is_active").default(true).notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("offices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("offices_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "offices_enterprise_id_enterprises_id_fk"
		}),
]);

export const flowStateInAuth = auth.table("flow_state", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id"),
	authCode: text("auth_code").notNull(),
	codeChallengeMethod: codeChallengeMethodInAuth("code_challenge_method").notNull(),
	codeChallenge: text("code_challenge").notNull(),
	providerType: text("provider_type").notNull(),
	providerAccessToken: text("provider_access_token"),
	providerRefreshToken: text("provider_refresh_token"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	authenticationMethod: text("authentication_method").notNull(),
	authCodeIssuedAt: timestamp("auth_code_issued_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("flow_state_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_auth_code").using("btree", table.authCode.asc().nullsLast().op("text_ops")),
	index("idx_user_id_auth_method").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.authenticationMethod.asc().nullsLast().op("text_ops")),
]);

export const identitiesInAuth = auth.table("identities", {
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	identityData: jsonb("identity_data").notNull(),
	provider: text().notNull(),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	index("identities_email_idx").using("btree", table.email.asc().nullsLast().op("text_pattern_ops")),
	index("identities_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "identities_user_id_fkey"
		}).onDelete("cascade"),
	unique("identities_provider_id_provider_unique").on(table.providerId, table.provider),
]);

export const auditLogEntriesInAuth = auth.table("audit_log_entries", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey().notNull(),
	payload: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	ipAddress: varchar("ip_address", { length: 64 }).default('').notNull(),
}, (table) => [
	index("audit_logs_instance_id_idx").using("btree", table.instanceId.asc().nullsLast().op("uuid_ops")),
]);

export const instancesInAuth = auth.table("instances", {
	id: uuid().primaryKey().notNull(),
	uuid: uuid(),
	rawBaseConfig: text("raw_base_config"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const schemaMigrationsInAuth = auth.table("schema_migrations", {
	version: varchar({ length: 255 }).primaryKey().notNull(),
});

export const sessionsInAuth = auth.table("sessions", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	factorId: uuid("factor_id"),
	aal: aalLevelInAuth(),
	notAfter: timestamp("not_after", { withTimezone: true, mode: 'string' }),
	refreshedAt: timestamp("refreshed_at", { mode: 'string' }),
	userAgent: text("user_agent"),
	ip: inet(),
	tag: text(),
}, (table) => [
	index("sessions_not_after_idx").using("btree", table.notAfter.desc().nullsFirst().op("timestamptz_ops")),
	index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("user_id_created_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const refreshTokensInAuth = auth.table("refresh_tokens", {
	instanceId: uuid("instance_id"),
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	token: varchar({ length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	revoked: boolean(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	parent: varchar({ length: 255 }),
	sessionId: uuid("session_id"),
}, (table) => [
	index("refresh_tokens_instance_id_idx").using("btree", table.instanceId.asc().nullsLast().op("uuid_ops")),
	index("refresh_tokens_instance_id_user_id_idx").using("btree", table.instanceId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("uuid_ops")),
	index("refresh_tokens_parent_idx").using("btree", table.parent.asc().nullsLast().op("text_ops")),
	index("refresh_tokens_session_id_revoked_idx").using("btree", table.sessionId.asc().nullsLast().op("bool_ops"), table.revoked.asc().nullsLast().op("bool_ops")),
	index("refresh_tokens_updated_at_idx").using("btree", table.updatedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "refresh_tokens_session_id_fkey"
		}).onDelete("cascade"),
	unique("refresh_tokens_token_unique").on(table.token),
]);

export const mfaFactorsInAuth = auth.table("mfa_factors", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	friendlyName: text("friendly_name"),
	factorType: factorTypeInAuth("factor_type").notNull(),
	status: factorStatusInAuth().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	secret: text(),
	phone: text(),
	lastChallengedAt: timestamp("last_challenged_at", { withTimezone: true, mode: 'string' }),
	webAuthnCredential: jsonb("web_authn_credential"),
	webAuthnAaguid: uuid("web_authn_aaguid"),
}, (table) => [
	index("factor_id_created_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("mfa_factors_user_friendly_name_unique").using("btree", table.friendlyName.asc().nullsLast().op("uuid_ops"), table.userId.asc().nullsLast().op("text_ops")).where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
	index("mfa_factors_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("unique_phone_factor_per_user").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.phone.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "mfa_factors_user_id_fkey"
		}).onDelete("cascade"),
	unique("mfa_factors_last_challenged_at_key").on(table.lastChallengedAt),
]);

export const oneTimeTokensInAuth = auth.table("one_time_tokens", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
	tokenHash: text("token_hash").notNull(),
	relatesTo: text("relates_to").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("one_time_tokens_relates_to_hash_idx").using("hash", table.relatesTo.asc().nullsLast().op("text_ops")),
	index("one_time_tokens_token_hash_hash_idx").using("hash", table.tokenHash.asc().nullsLast().op("text_ops")),
	uniqueIndex("one_time_tokens_user_id_token_type_key").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.tokenType.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "one_time_tokens_user_id_fkey"
		}).onDelete("cascade"),
	check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
]);

export const mfaAmrClaimsInAuth = auth.table("mfa_amr_claims", {
	sessionId: uuid("session_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	authenticationMethod: text("authentication_method").notNull(),
	id: uuid().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "mfa_amr_claims_session_id_fkey"
		}).onDelete("cascade"),
	unique("mfa_amr_claims_session_id_authentication_method_pkey").on(table.sessionId, table.authenticationMethod),
]);

export const mfaChallengesInAuth = auth.table("mfa_challenges", {
	id: uuid().primaryKey().notNull(),
	factorId: uuid("factor_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	ipAddress: inet("ip_address").notNull(),
	otpCode: text("otp_code"),
	webAuthnSessionData: jsonb("web_authn_session_data"),
}, (table) => [
	index("mfa_challenge_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.factorId],
			foreignColumns: [mfaFactorsInAuth.id],
			name: "mfa_challenges_auth_factor_id_fkey"
		}).onDelete("cascade"),
]);

export const ssoDomainsInAuth = auth.table("sso_domains", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	domain: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
	index("sso_domains_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "sso_domains_sso_provider_id_fkey"
		}).onDelete("cascade"),
	check("domain not empty", sql`char_length(domain) > 0`),
]);

export const departmentLocations = pgTable("department_locations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	departmentId: uuid("department_id").notNull(),
	locationType: text("location_type").notNull(),
	locationId: uuid("location_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "department_locations_department_id_departments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "department_locations_enterprise_id_enterprises_id_fk"
		}),
	unique("unique_department_location").on(table.departmentId, table.locationType, table.locationId),
	check("location_type_check", sql`location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text])`),
]);

export const employees = pgTable("employees", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	phone: text(),
	hireDate: date("hire_date"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	address: text(),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
	country: text(),
	terminationDate: date("termination_date"),
	isActive: boolean("is_active").default(true).notNull(),
	departmentId: uuid("department_id"),
}, (table) => [
	index("employees_department_id_idx").using("btree", table.departmentId.asc().nullsLast().op("uuid_ops")),
	index("employees_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("employees_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "employees_department_id_departments_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "employees_enterprise_id_enterprises_id_fk"
		}),
]);

export const expenses = pgTable("expenses", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	expenseNumber: text("expense_number").notNull(),
	issueDate: date("issue_date").notNull(),
	dueDate: date("due_date").notNull(),
	status: text().default('pending').notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	category: text().notNull(),
	notes: text(),
	clientId: uuid("client_id"),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("expenses_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("expenses_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("expenses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "expenses_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "expenses_enterprise_id_enterprises_id_fk"
		}),
	check("expenses_status_check", sql`status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])`),
]);

export const quotes = pgTable("quotes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	quoteNumber: text("quote_number").notNull(),
	issueDate: date("issue_date").notNull(),
	expiryDate: date("expiry_date").notNull(),
	status: text().default('draft').notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  2 }).default('0'),
	notes: text(),
	clientId: uuid("client_id").notNull(),
	userId: uuid("user_id").notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END`),
	total: numeric({ precision: 10, scale:  2 }).generatedAlwaysAs(sql`
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END`),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("quotes_client_id_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("quotes_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("quotes_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "quotes_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "quotes_enterprise_id_enterprises_id_fk"
		}),
	check("quotes_status_check", sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])`),
]);

export const salaries = pgTable("salaries", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	notes: text(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	employeeId: uuid("employee_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('USD').notNull(),
	paymentFrequency: text("payment_frequency").default('monthly').notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
}, (table) => [
	index("salaries_employee_id_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	index("salaries_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "salaries_employee_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "salaries_enterprise_id_enterprises_id_fk"
		}),
]);

export const vendors = pgTable("vendors", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
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
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("vendors_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("vendors_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("vendors_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "vendors_enterprise_id_enterprises_id_fk"
		}),
]);

export const departments = pgTable("departments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	description: text(),
	userId: uuid("user_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	isActive: boolean("is_active").default(true).notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("departments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "departments_enterprise_id_enterprises_id_fk"
		}),
]);

export const warehouses = pgTable("warehouses", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	code: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	capacity: numeric({ precision: 10, scale:  2 }),
	isActive: boolean("is_active").default(true).notNull(),
	notes: text(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("warehouses_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("warehouses_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("warehouses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "warehouses_enterprise_id_enterprises_id_fk"
		}),
	unique("warehouses_code_key").on(table.code),
]);

export const jobs = pgTable("jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	requirements: text(),
	location: varchar({ length: 255 }),
	department: varchar({ length: 255 }),
	type: varchar({ length: 50 }).notNull(),
	salary: numeric({ precision: 10, scale:  2 }),
	isActive: boolean("is_active").default(true).notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("jobs_department_idx").using("btree", table.department.asc().nullsLast().op("text_ops")),
	index("jobs_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
	index("jobs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "jobs_enterprise_id_enterprises_id_fk"
		}),
]);

export const branches = pgTable("branches", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
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
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("branches_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("branches_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("branches_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "branches_enterprise_id_enterprises_id_fk"
		}),
	unique("branches_code_key").on(table.code),
]);

export const companies = pgTable("companies", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
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
	userId: uuid("user_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("companies_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("companies_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("companies_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "companies_enterprise_id_enterprises_id_fk"
		}).onDelete("cascade"),
]);

export const enterprises = pgTable("enterprises", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
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
}, (table) => [
	index("enterprises_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("enterprises_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	pgPolicy("Enable delete for owners", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`true` }),
	pgPolicy("Enable insert for signup", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read for users", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("Enable update for owners", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	name: text().notNull(),
	email: text(),
	phone: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	notes: text(),
	userId: uuid("user_id").notNull(),
	company: uuid(),
	enterpriseId: uuid("enterprise_id").notNull(),
}, (table) => [
	index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("clients_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.company],
			foreignColumns: [companies.id],
			name: "clients_company_fkey"
		}),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprises.id],
			name: "clients_enterprise_id_enterprises_id_fk"
		}),
]);

export const quoteItems = pgTable("quote_items", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	description: text().notNull(),
	quantity: numeric({ precision: 10, scale:  2 }).default('1').notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).generatedAlwaysAs(sql`(quantity * unit_price)`),
	quoteId: uuid("quote_id").notNull(),
	productId: uuid("product_id"),
}, (table) => [
	index("quote_items_quote_id_idx").using("btree", table.quoteId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "quote_items_product_id_fkey"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "quote_items_quote_id_fkey"
		}).onDelete("cascade"),
]);

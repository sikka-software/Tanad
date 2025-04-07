import { sql } from "drizzle-orm";
import {
  pgTable,
  pgSchema,
  index,
  foreignKey,
  unique,
  check,
  uuid,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
  smallint,
  pgPolicy,
  numeric,
  date,
  inet,
  bigserial,
  json,
  integer,
} from "drizzle-orm/pg-core";

export const auth = pgSchema("auth");
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", ["s256", "plain"]);
export const factorStatusInAuth = auth.enum("factor_status", ["unverified", "verified"]);
export const factorTypeInAuth = auth.enum("factor_type", ["totp", "webauthn", "phone"]);
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", [
  "confirmation_token",
  "reauthentication_token",
  "recovery_token",
  "email_change_token_new",
  "email_change_token_current",
  "phone_change_token",
]);

export const samlProvidersInAuth = auth.table(
  "saml_providers",
  {
    id: uuid().primaryKey().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    entityId: text("entity_id").notNull(),
    metadataXml: text("metadata_xml").notNull(),
    metadataUrl: text("metadata_url"),
    attributeMapping: jsonb("attribute_mapping"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    nameIdFormat: text("name_id_format"),
  },
  (table) => [
    index("saml_providers_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "saml_providers_sso_provider_id_fkey",
    }).onDelete("cascade"),
    unique("saml_providers_entity_id_key").on(table.entityId),
    check("entity_id not empty", sql`char_length(entity_id) > 0`),
    check(
      "metadata_url not empty",
      sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`,
    ),
    check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
  ],
);

export const samlRelayStatesInAuth = auth.table(
  "saml_relay_states",
  {
    id: uuid().primaryKey().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    requestId: text("request_id").notNull(),
    forEmail: text("for_email"),
    redirectTo: text("redirect_to"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    flowStateId: uuid("flow_state_id"),
  },
  (table) => [
    index("saml_relay_states_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("saml_relay_states_for_email_idx").using(
      "btree",
      table.forEmail.asc().nullsLast().op("text_ops"),
    ),
    index("saml_relay_states_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.flowStateId],
      foreignColumns: [flowStateInAuth.id],
      name: "saml_relay_states_flow_state_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "saml_relay_states_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("request_id not empty", sql`char_length(request_id) > 0`),
  ],
);

export const ssoProvidersInAuth = auth.table(
  "sso_providers",
  {
    id: uuid().primaryKey().notNull(),
    resourceId: text("resource_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
    check(
      "resource_id not empty",
      sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`,
    ),
  ],
);

export const usersInAuth = auth.table(
  "users",
  {
    instanceId: uuid("instance_id"),
    id: uuid().primaryKey().notNull(),
    aud: varchar({ length: 255 }),
    role: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    encryptedPassword: varchar("encrypted_password", { length: 255 }),
    emailConfirmedAt: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    invitedAt: timestamp("invited_at", { withTimezone: true, mode: "string" }),
    confirmationToken: varchar("confirmation_token", { length: 255 }),
    confirmationSentAt: timestamp("confirmation_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    recoveryToken: varchar("recovery_token", { length: 255 }),
    recoverySentAt: timestamp("recovery_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
    emailChange: varchar("email_change", { length: 255 }),
    emailChangeSentAt: timestamp("email_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    rawAppMetaData: jsonb("raw_app_meta_data"),
    rawUserMetaData: jsonb("raw_user_meta_data"),
    isSuperAdmin: boolean("is_super_admin"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    phone: text().default(sql`NULL`),
    phoneConfirmedAt: timestamp("phone_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    phoneChange: text("phone_change").default(""),
    phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(""),
    phoneChangeSentAt: timestamp("phone_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "string",
    }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
    emailChangeTokenCurrent: varchar("email_change_token_current", {
      length: 255,
    }).default(""),
    emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
    bannedUntil: timestamp("banned_until", {
      withTimezone: true,
      mode: "string",
    }),
    reauthenticationToken: varchar("reauthentication_token", {
      length: 255,
    }).default(""),
    reauthenticationSentAt: timestamp("reauthentication_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    isSsoUser: boolean("is_sso_user").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("confirmation_token_idx")
      .using("btree", table.confirmationToken.asc().nullsLast().op("text_ops"))
      .where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_current_idx")
      .using("btree", table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops"))
      .where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_new_idx")
      .using("btree", table.emailChangeTokenNew.asc().nullsLast().op("text_ops"))
      .where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("reauthentication_token_idx")
      .using("btree", table.reauthenticationToken.asc().nullsLast().op("text_ops"))
      .where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("recovery_token_idx")
      .using("btree", table.recoveryToken.asc().nullsLast().op("text_ops"))
      .where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("users_email_partial_key")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`(is_sso_user = false)`),
    index("users_instance_id_email_idx").using("btree", sql`instance_id`, sql`null`),
    index("users_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
    index("users_is_anonymous_idx").using(
      "btree",
      table.isAnonymous.asc().nullsLast().op("bool_ops"),
    ),
    unique("users_phone_key").on(table.phone),
    check(
      "users_email_change_confirm_status_check",
      sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
    ),
  ],
);

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
    pgPolicy("Users can update invoice items through invoices", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
     FROM invoices
    WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid()))))`,
    }),
    pgPolicy("Users can read invoice items through invoices", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can insert invoice items through invoices", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete invoice items through invoices", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: text().default("draft").notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(
      sql`(subtotal + ((subtotal * tax_rate) / (100)::numeric))`,
    ),
    notes: text(),
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
    pgPolicy("Users can update their own invoices", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can read their own invoices", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can insert their own invoices", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete their own invoices", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    check(
      "invoices_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])`,
    ),
  ],
);

export const clients = pgTable(
  "clients",
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
    index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("clients_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
    index("clients_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    pgPolicy("Users can update their own clients", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can read their own clients", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can insert their own clients", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete their own clients", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

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
    subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: numeric("tax_amount", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`((subtotal * tax_rate) / (100)::numeric)`),
    total: numeric({ precision: 10, scale: 2 }).generatedAlwaysAs(
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
    pgPolicy("Users can update their own quotes", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can read their own quotes", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can insert their own quotes", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete their own quotes", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    check(
      "quotes_status_check",
      sql`status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])`,
    ),
  ],
);

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
    pgPolicy("Users can update quote items through quotes", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
     FROM quotes
    WHERE ((quotes.id = quote_items.quote_id) AND (quotes.user_id = auth.uid()))))`,
    }),
    pgPolicy("Users can read quote items through quotes", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can insert quote items through quotes", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete quote items through quotes", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const sessionsInAuth = auth.table(
  "sessions",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    factorId: uuid("factor_id"),
    aal: aalLevelInAuth(),
    notAfter: timestamp("not_after", { withTimezone: true, mode: "string" }),
    refreshedAt: timestamp("refreshed_at", { mode: "string" }),
    userAgent: text("user_agent"),
    ip: inet(),
    tag: text(),
  },
  (table) => [
    index("sessions_not_after_idx").using(
      "btree",
      table.notAfter.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    index("user_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "sessions_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const refreshTokensInAuth = auth.table(
  "refresh_tokens",
  {
    instanceId: uuid("instance_id"),
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    token: varchar({ length: 255 }),
    userId: varchar("user_id", { length: 255 }),
    revoked: boolean(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    parent: varchar({ length: 255 }),
    sessionId: uuid("session_id"),
  },
  (table) => [
    index("refresh_tokens_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
    index("refresh_tokens_instance_id_user_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("refresh_tokens_parent_idx").using(
      "btree",
      table.parent.asc().nullsLast().op("text_ops"),
    ),
    index("refresh_tokens_session_id_revoked_idx").using(
      "btree",
      table.sessionId.asc().nullsLast().op("bool_ops"),
      table.revoked.asc().nullsLast().op("bool_ops"),
    ),
    index("refresh_tokens_updated_at_idx").using(
      "btree",
      table.updatedAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [sessionsInAuth.id],
      name: "refresh_tokens_session_id_fkey",
    }).onDelete("cascade"),
    unique("refresh_tokens_token_unique").on(table.token),
  ],
);

export const mfaChallengesInAuth = auth.table(
  "mfa_challenges",
  {
    id: uuid().primaryKey().notNull(),
    factorId: uuid("factor_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    ipAddress: inet("ip_address").notNull(),
    otpCode: text("otp_code"),
    webAuthnSessionData: jsonb("web_authn_session_data"),
  },
  (table) => [
    index("mfa_challenge_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.factorId],
      foreignColumns: [mfaFactorsInAuth.id],
      name: "mfa_challenges_auth_factor_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const ssoDomainsInAuth = auth.table(
  "sso_domains",
  {
    id: uuid().primaryKey().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    domain: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
    index("sso_domains_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "sso_domains_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("domain not empty", sql`char_length(domain) > 0`),
  ],
);

export const schemaMigrationsInAuth = auth.table("schema_migrations", {
  version: varchar({ length: 255 }).primaryKey().notNull(),
});

export const flowStateInAuth = auth.table(
  "flow_state",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id"),
    authCode: text("auth_code").notNull(),
    codeChallengeMethod: codeChallengeMethodInAuth("code_challenge_method").notNull(),
    codeChallenge: text("code_challenge").notNull(),
    providerType: text("provider_type").notNull(),
    providerAccessToken: text("provider_access_token"),
    providerRefreshToken: text("provider_refresh_token"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    authenticationMethod: text("authentication_method").notNull(),
    authCodeIssuedAt: timestamp("auth_code_issued_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("flow_state_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("idx_auth_code").using("btree", table.authCode.asc().nullsLast().op("text_ops")),
    index("idx_user_id_auth_method").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.authenticationMethod.asc().nullsLast().op("text_ops"),
    ),
  ],
);

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
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profiles_id_fkey",
    }).onDelete("cascade"),
    unique("profiles_username_key").on(table.username),
    pgPolicy("Admin full access", {
      as: "permissive",
      for: "all",
      to: ["service_role"],
      using: sql`true`,
    }),
    pgPolicy("Users can delete their own profile", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can update their own profile", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can create their own profile", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Public profiles are viewable", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can view their own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const mfaFactorsInAuth = auth.table(
  "mfa_factors",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    friendlyName: text("friendly_name"),
    factorType: factorTypeInAuth("factor_type").notNull(),
    status: factorStatusInAuth().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    secret: text(),
    phone: text(),
    lastChallengedAt: timestamp("last_challenged_at", {
      withTimezone: true,
      mode: "string",
    }),
    webAuthnCredential: jsonb("web_authn_credential"),
    webAuthnAaguid: uuid("web_authn_aaguid"),
  },
  (table) => [
    index("factor_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    uniqueIndex("mfa_factors_user_friendly_name_unique")
      .using(
        "btree",
        table.friendlyName.asc().nullsLast().op("uuid_ops"),
        table.userId.asc().nullsLast().op("text_ops"),
      )
      .where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
    index("mfa_factors_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    uniqueIndex("unique_phone_factor_per_user").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.phone.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "mfa_factors_user_id_fkey",
    }).onDelete("cascade"),
    unique("mfa_factors_last_challenged_at_key").on(table.lastChallengedAt),
  ],
);

export const oneTimeTokensInAuth = auth.table(
  "one_time_tokens",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
    tokenHash: text("token_hash").notNull(),
    relatesTo: text("relates_to").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("one_time_tokens_relates_to_hash_idx").using(
      "hash",
      table.relatesTo.asc().nullsLast().op("text_ops"),
    ),
    index("one_time_tokens_token_hash_hash_idx").using(
      "hash",
      table.tokenHash.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("one_time_tokens_user_id_token_type_key").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.tokenType.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "one_time_tokens_user_id_fkey",
    }).onDelete("cascade"),
    check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
  ],
);

export const mfaAmrClaimsInAuth = auth.table(
  "mfa_amr_claims",
  {
    sessionId: uuid("session_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    authenticationMethod: text("authentication_method").notNull(),
    id: uuid().primaryKey().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [sessionsInAuth.id],
      name: "mfa_amr_claims_session_id_fkey",
    }).onDelete("cascade"),
    unique("mfa_amr_claims_session_id_authentication_method_pkey").on(
      table.sessionId,
      table.authenticationMethod,
    ),
  ],
);

export const auditLogEntriesInAuth = auth.table(
  "audit_log_entries",
  {
    instanceId: uuid("instance_id"),
    id: uuid().primaryKey().notNull(),
    payload: json(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    ipAddress: varchar("ip_address", { length: 64 }).default("").notNull(),
  },
  (table) => [
    index("audit_logs_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

export const identitiesInAuth = auth.table(
  "identities",
  {
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull(),
    identityData: jsonb("identity_data").notNull(),
    provider: text().notNull(),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
    id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [
    index("identities_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_pattern_ops"),
    ),
    index("identities_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "identities_user_id_fkey",
    }).onDelete("cascade"),
    unique("identities_provider_id_provider_unique").on(table.providerId, table.provider),
  ],
);

export const instancesInAuth = auth.table("instances", {
  id: uuid().primaryKey().notNull(),
  uuid: uuid(),
  rawBaseConfig: text("raw_base_config"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const products = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    sku: varchar({ length: 50 }),
    stockQuantity: integer("stock_quantity").default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => [unique("products_sku_key").on(table.sku)],
);

export const employees = pgTable("employees", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  hireDate: date("hire_date").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

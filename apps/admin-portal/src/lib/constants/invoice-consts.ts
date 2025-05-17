export const INVOICE_STATUSES = [
  "completed",
  "pending",
  "failed",
  "open",
  "active",
  "paid",
  "paused",
  "cancelled",
  "abandoned",
  "expired",
] as const;

export const INVOICE_RECURRENCE = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "semiyearly",
  "yearly",
];

export const INVOICE_CYCLES = ["1_day", "1_week", "1_month", "3_months", "6_months", "1_year"];

ALTER TABLE "expenses" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "issue_date" date DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "expense_number" text NOT NULL;
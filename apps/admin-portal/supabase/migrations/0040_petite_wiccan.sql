CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"incurred_at" date DEFAULT CURRENT_DATE,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"category" text NOT NULL,
	"due_date" date,
	"issue_date" date DEFAULT CURRENT_DATE,
	"notes" text,
	"purchase_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;
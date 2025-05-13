ALTER TABLE "employees" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."employee_status";--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'onboarding', 'probation', 'on_leave', 'terminated', 'retired', 'suspended');--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."employee_status";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DATA TYPE "public"."employee_status" USING "status"::"public"."employee_status";
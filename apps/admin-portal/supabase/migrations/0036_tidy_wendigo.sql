CREATE TYPE "public"."common_status" AS ENUM('active', 'inactive', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive', 'terminated', 'on_leave', 'resigned');--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."employee_status";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DATA TYPE "public"."employee_status" USING "status"::"public"."employee_status";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "job_listings" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "job_listings" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "job_listings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "servers" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "servers" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."common_status";--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "status" SET DATA TYPE "public"."common_status" USING "status"::"public"."common_status";--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "monthly_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "annual_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "payment_cycle" "payment_cycle";
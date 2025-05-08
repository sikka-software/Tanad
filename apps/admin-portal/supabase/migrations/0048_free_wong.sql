ALTER TYPE "public"."activity_target_type" ADD VALUE 'CAR';--> statement-breakpoint
ALTER TYPE "public"."activity_target_type" ADD VALUE 'TRUCK';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.create';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.delete';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.update';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.export';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'cars.duplicate';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.create';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.delete';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.update';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.export';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'trucks.duplicate';--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" text NOT NULL,
	"color" text,
	"vin" text,
	"code" text,
	"liscese_country" text,
	"license_plate" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trucks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" text NOT NULL,
	"color" text,
	"vin" text,
	"code" text,
	"liscese_country" text,
	"license_plate" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

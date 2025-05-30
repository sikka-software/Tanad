ALTER TYPE "public"."activity_target_type" ADD VALUE 'VEHICLE';--> statement-breakpoint
ALTER TYPE "public"."activity_target_type" ADD VALUE 'DRIVER';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.read' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.create' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.delete' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.update' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.export' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'vehicles.duplicate' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.read' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.create' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.delete' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.update' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.export' BEFORE 'cars.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'drivers.duplicate' BEFORE 'cars.read';
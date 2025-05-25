ALTER TYPE "public"."activity_target_type" ADD VALUE 'INDIVIDUAL';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.create';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.delete';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.update';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.export';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'individuals.duplicate';
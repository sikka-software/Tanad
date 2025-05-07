ALTER TYPE "public"."activity_target_type" ADD VALUE 'ONLINE_STORE';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.create';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.delete';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.update';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.export';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'online_stores.duplicate';
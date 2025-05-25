ALTER TYPE "public"."app_permission" ADD VALUE 'documents.read';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'documents.create';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'documents.delete';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'documents.update';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'documents.export';--> statement-breakpoint
ALTER TYPE "public"."app_permission" ADD VALUE 'documents.duplicate';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "updated_at" SET NOT NULL;
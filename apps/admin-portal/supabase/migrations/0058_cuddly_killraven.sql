ALTER TABLE "employees" DROP CONSTRAINT "employees_department_id_departments_id_fk";
--> statement-breakpoint
DROP INDEX "employees_department_id_idx";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "department_id";
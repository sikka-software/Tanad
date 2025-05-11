ALTER TABLE "cars" ALTER COLUMN "year" SET DATA TYPE smallint USING year::smallint;--> statement-breakpoint
ALTER TABLE "trucks" ALTER COLUMN "year" SET DATA TYPE smallint USING year::smallint;
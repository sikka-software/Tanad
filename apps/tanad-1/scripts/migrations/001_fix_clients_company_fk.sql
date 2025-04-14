-- Drop generated columns first
ALTER TABLE "quotes" DROP COLUMN IF EXISTS "tax_amount";
ALTER TABLE "quotes" DROP COLUMN IF EXISTS "total";
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "tax_amount";
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "total";

-- Drop foreign key constraint
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_company_fkey";

-- Update company column to UUID
UPDATE "clients" SET company = NULL WHERE company IS NOT NULL;
ALTER TABLE "clients" ALTER COLUMN company TYPE uuid USING NULL;

-- Re-add foreign key constraint
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_fkey" 
    FOREIGN KEY (company) REFERENCES companies(id);

-- Re-add generated columns
ALTER TABLE "quotes" ADD COLUMN "tax_amount" numeric GENERATED ALWAYS AS (
    CASE 
        WHEN tax_rate IS NULL THEN 0
        ELSE ROUND((subtotal * tax_rate), 2)
    END
) STORED;

ALTER TABLE "quotes" ADD COLUMN "total" numeric GENERATED ALWAYS AS (
    CASE 
        WHEN tax_rate IS NULL THEN subtotal
        ELSE ROUND((subtotal * (1 + tax_rate)), 2)
    END
) STORED;

ALTER TABLE "invoices" ADD COLUMN "tax_amount" numeric GENERATED ALWAYS AS (
    CASE 
        WHEN tax_rate IS NULL THEN 0
        ELSE ROUND((subtotal * tax_rate), 2)
    END
) STORED;

ALTER TABLE "invoices" ADD COLUMN "total" numeric GENERATED ALWAYS AS (
    CASE 
        WHEN tax_rate IS NULL THEN subtotal
        ELSE ROUND((subtotal * (1 + tax_rate)), 2)
    END
) STORED; 
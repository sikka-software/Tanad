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

-- Enable RLS
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Users can view their own quotes"
    ON "quotes"
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quotes"
    ON "quotes"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quotes"
    ON "quotes"
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quotes"
    ON "quotes"
    FOR DELETE
    USING (user_id = auth.uid());

-- Create policies for quote items
CREATE POLICY "Users can view their own quote items"
    ON "quote_items"
    FOR SELECT
    USING (
        quote_id IN (
            SELECT id FROM quotes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own quote items"
    ON "quote_items"
    FOR INSERT
    WITH CHECK (
        quote_id IN (
            SELECT id FROM quotes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own quote items"
    ON "quote_items"
    FOR UPDATE
    USING (
        quote_id IN (
            SELECT id FROM quotes WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        quote_id IN (
            SELECT id FROM quotes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own quote items"
    ON "quote_items"
    FOR DELETE
    USING (
        quote_id IN (
            SELECT id FROM quotes WHERE user_id = auth.uid()
        )
    );

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices"
    ON "invoices"
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own invoices"
    ON "invoices"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own invoices"
    ON "invoices"
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own invoices"
    ON "invoices"
    FOR DELETE
    USING (user_id = auth.uid());

-- Create policies for invoice items
CREATE POLICY "Users can view their own invoice items"
    ON "invoice_items"
    FOR SELECT
    USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own invoice items"
    ON "invoice_items"
    FOR INSERT
    WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own invoice items"
    ON "invoice_items"
    FOR UPDATE
    USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own invoice items"
    ON "invoice_items"
    FOR DELETE
    USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE user_id = auth.uid()
        )
    ); 
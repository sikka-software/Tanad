-- Add ZATCA Phase 1 compliance fields to the invoices table
ALTER TABLE IF EXISTS public.invoices
ADD COLUMN IF NOT EXISTS zatca_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15, 2);

-- Add comment for ZATCA fields
COMMENT ON COLUMN public.invoices.zatca_enabled IS 'Whether ZATCA compliance is enabled for this invoice';
COMMENT ON COLUMN public.invoices.seller_name IS 'ZATCA: Seller name as registered with ZATCA';
COMMENT ON COLUMN public.invoices.vat_number IS 'ZATCA: VAT registration number';
COMMENT ON COLUMN public.invoices.tax_amount IS 'ZATCA: Calculated tax amount based on subtotal and tax_rate'; 
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_number text NOT NULL,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS subtotal numeric(10, 2) NOT NULL DEFAULT '0',
ADD COLUMN IF NOT EXISTS tax_rate numeric(5, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS client_id uuid NOT NULL;

-- Rename issued_at to issue_date only if issued_at exists and issue_date doesn't
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='invoices' AND column_name='issued_at') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='invoices' AND column_name='issue_date') THEN
        ALTER TABLE public.invoices RENAME COLUMN issued_at TO issue_date;
    END IF;
END $$;

ALTER TABLE public.invoices
DROP COLUMN IF EXISTS issued_to,
DROP COLUMN IF EXISTS amount;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS tax_amount numeric(10, 2) GENERATED ALWAYS AS (
  CASE
      WHEN (tax_rate IS NULL) THEN (0)::numeric
      ELSE round((subtotal * tax_rate), 2)
  END
) STORED;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS total numeric(10, 2) GENERATED ALWAYS AS (
  CASE
      WHEN (tax_rate IS NULL) THEN subtotal
      ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
  END
) STORED;

-- Add foreign key constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'invoices_client_id_fkey'
          AND conrelid = 'public.invoices'::regclass
    ) THEN
        ALTER TABLE public.invoices
        ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'invoices_status_check'
          AND conrelid = 'public.invoices'::regclass
    ) THEN
        ALTER TABLE public.invoices
        ADD CONSTRAINT invoices_status_check CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'partially_paid'::text, 'overdue'::text, 'void'::text]));
    END IF;
END $$;

-- Add index for client_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'invoices_client_id_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX invoices_client_id_idx ON public.invoices USING btree (client_id);
    END IF;
END$$;

-- Add index for status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'invoices_status_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);
    END IF;
END$$;

-- Add index for invoice_number if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'invoices_invoice_number_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX invoices_invoice_number_idx ON public.invoices USING btree (invoice_number text_ops ASC NULLS LAST);
    END IF;
END$$;

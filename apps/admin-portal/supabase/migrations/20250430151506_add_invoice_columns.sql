ALTER TABLE public.invoices
ADD COLUMN invoice_number text NOT NULL,
ADD COLUMN due_date date,
ADD COLUMN status text NOT NULL DEFAULT 'draft',
ADD COLUMN subtotal numeric(10, 2) NOT NULL DEFAULT '0',
ADD COLUMN tax_rate numeric(5, 2) DEFAULT '0',
ADD COLUMN notes text,
ADD COLUMN client_id uuid NOT NULL;

ALTER TABLE public.invoices
RENAME COLUMN issued_at TO issue_date;

ALTER TABLE public.invoices
DROP COLUMN issued_to,
DROP COLUMN amount;

ALTER TABLE public.invoices
ADD COLUMN tax_amount numeric(10, 2) GENERATED ALWAYS AS (
  CASE
      WHEN (tax_rate IS NULL) THEN (0)::numeric
      ELSE round((subtotal * tax_rate), 2)
  END
) STORED;

ALTER TABLE public.invoices
ADD COLUMN total numeric(10, 2) GENERATED ALWAYS AS (
  CASE
      WHEN (tax_rate IS NULL) THEN subtotal
      ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
  END
) STORED;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_status_check CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'partially_paid'::text, 'overdue'::text, 'void'::text]));

CREATE INDEX invoices_client_id_idx ON public.invoices USING btree (client_id uuid_ops ASC NULLS LAST);
CREATE INDEX invoices_status_idx ON public.invoices USING btree (status text_ops ASC NULLS LAST);
CREATE INDEX invoices_invoice_number_idx ON public.invoices USING btree (invoice_number text_ops ASC NULLS LAST);

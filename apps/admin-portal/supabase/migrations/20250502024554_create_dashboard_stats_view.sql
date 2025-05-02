-- Define the view to calculate dashboard statistics per enterprise
CREATE OR REPLACE VIEW enterprise_dashboard_stats AS
SELECT
    e.id AS enterprise_id,
    -- Invoices
    COUNT(DISTINCT i.id) AS total_invoices,
    COALESCE(SUM(i.total), 0) AS total_revenue,
    COUNT(DISTINCT CASE WHEN lower(i.status) = 'pending' THEN i.id END) AS pending_invoices,
    -- Products
    COUNT(DISTINCT p.id) AS total_products,
    -- Employees
    COUNT(DISTINCT emp.id) AS total_employees,
    -- Departments
    COUNT(DISTINCT d.id) AS total_departments,
    -- Jobs
    COUNT(DISTINCT j.id) AS total_jobs,
    -- Clients
    COUNT(DISTINCT cl.id) AS total_clients,
    -- Companies
    COUNT(DISTINCT co.id) AS total_companies,
    -- Vendors
    COUNT(DISTINCT v.id) AS total_vendors,
    -- Offices
    COUNT(DISTINCT o.id) AS total_offices,
    -- Warehouses
    COUNT(DISTINCT w.id) AS total_warehouses,
    -- Branches
    COUNT(DISTINCT b.id) AS total_branches
FROM
    enterprises e
LEFT JOIN invoices i ON i.enterprise_id = e.id
LEFT JOIN products p ON p.enterprise_id = e.id
LEFT JOIN employees emp ON emp.enterprise_id = e.id
LEFT JOIN departments d ON d.enterprise_id = e.id
LEFT JOIN jobs j ON j.enterprise_id = e.id
LEFT JOIN clients cl ON cl.enterprise_id = e.id
LEFT JOIN companies co ON co.enterprise_id = e.id
LEFT JOIN vendors v ON v.enterprise_id = e.id
LEFT JOIN offices o ON o.enterprise_id = e.id
LEFT JOIN warehouses w ON w.enterprise_id = e.id
LEFT JOIN branches b ON b.enterprise_id = e.id
GROUP BY
    e.id;

-- Ensure appropriate RLS policies are in place if needed.
-- Example RLS policy (adjust as necessary):
--
-- Drop existing policy if it exists
-- DROP POLICY IF EXISTS "Allow authenticated users to read their enterprise stats" ON public.enterprise_dashboard_stats;
--
-- Create policy to allow users to select stats for their own enterprise
-- CREATE POLICY "Allow authenticated users to read their enterprise stats"
-- ON public.enterprise_dashboard_stats
-- FOR SELECT
-- TO authenticated
-- USING (
--  enterprise_id = ( SELECT profiles.enterprise_id
--                    FROM public.profiles
--                   WHERE profiles.user_id = auth.uid() )
-- );
--
-- Enable RLS on the view
-- ALTER TABLE public.enterprise_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Modify the view to use COUNT(id) instead of COUNT(DISTINCT id) for primary keys
CREATE OR REPLACE VIEW enterprise_dashboard_stats AS
SELECT
    e.id AS enterprise_id,
    -- Invoices
    COUNT(i.id) AS total_invoices, -- Changed from DISTINCT
    COALESCE(SUM(i.total), 0) AS total_revenue,
    COUNT(CASE WHEN lower(i.status) = 'pending' THEN i.id END) AS pending_invoices, -- Kept CASE logic, COUNT(id) is fine here too
    -- Products
    COUNT(p.id) AS total_products, -- Changed from DISTINCT
    -- Employees
    COUNT(emp.id) AS total_employees, -- Changed from DISTINCT
    -- Departments
    COUNT(d.id) AS total_departments, -- Changed from DISTINCT
    -- Jobs
    COUNT(j.id) AS total_jobs, -- Changed from DISTINCT
    -- Clients
    COUNT(cl.id) AS total_clients, -- Changed from DISTINCT
    -- Companies
    COUNT(co.id) AS total_companies, -- Changed from DISTINCT
    -- Vendors
    COUNT(v.id) AS total_vendors, -- Changed from DISTINCT
    -- Offices
    COUNT(o.id) AS total_offices, -- Changed from DISTINCT
    -- Warehouses
    COUNT(w.id) AS total_warehouses, -- Changed from DISTINCT
    -- Branches
    COUNT(b.id) AS total_branches -- Changed from DISTINCT
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

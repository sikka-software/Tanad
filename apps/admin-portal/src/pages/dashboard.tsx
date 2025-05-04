import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { StatCard } from "@/ui/stat-card";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ActivityCalendar from "@/components/ui/activity-calendar";

import useUserStore from "@/stores/use-user-store";

// Interface for the data returned by the view
interface DashboardStatsViewData {
  total_invoices: number;
  total_products: number;
  total_revenue: number;
  pending_invoices: number;
  total_employees: number;
  total_departments: number;
  total_jobs: number;
  total_clients: number;
  total_companies: number;
  total_vendors: number;
  total_offices: number;
  total_warehouses: number;
  total_branches: number;
}

// Update state interface to match view column names (or map later)
interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalEmployees: number;
  totalDepartments: number;
  totalJobs: number;
  totalClients: number;
  totalCompanies: number;
  totalVendors: number;
  totalOffices: number;
  totalWarehouses: number;
  totalBranches: number;
}

export default function Dashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalEmployees: 0,
    totalDepartments: 0,
    totalJobs: 0,
    totalClients: 0,
    totalCompanies: 0,
    totalVendors: 0,
    totalOffices: 0,
    totalWarehouses: 0,
    totalBranches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();
  const { user, profile, enterprise } = useUserStore();

  const createOptions = [
    {
      label: t("Dashboard.add_product"),
      value: "product",
      path: "/products/add",
    },
    {
      label: t("Dashboard.add_invoice"),
      value: "invoice",
      path: "/invoices/add",
    },
    { label: t("Dashboard.add_client"), value: "client", path: "/clients/add" },
    {
      label: t("Dashboard.add_employee"),
      value: "employee",
      path: "/employees/add",
    },
    {
      label: t("Dashboard.add_warehouse"),
      value: "warehouse",
      path: "/warehouses/add",
    },
  ];

  const handleCreateOption = (value: string) => {
    const option = createOptions.find((opt) => opt.value === value);
    if (option) {
      router.push(option.path);
    }
  };

  // Fetch dashboard stats using the view
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardStats() {
      if (!isMounted || !user?.id || !enterprise?.id) {
        if (isMounted && !enterprise?.id && user?.id) {
          setLoading(false);
        } else if (isMounted) {
          setLoading(true);
        }
        return;
      }

      const enterpriseId = enterprise.id; // Cache enterprise ID

      try {
        setLoading(true);
        setError(null); // Reset error state

        // Helper function to perform count queries
        const fetchCount = async (
          tableName: string,
          additionalFilter?: object,
        ): Promise<number> => {
          const query = supabase
            .from(tableName)
            .select("id", { count: "exact", head: true })
            .eq("enterprise_id", enterpriseId);

          if (additionalFilter) {
            Object.entries(additionalFilter).forEach(([key, value]) => {
              query.eq(key, value);
            });
          }

          const { count, error } = await query;
          if (error) throw error;
          return count ?? 0;
        };

        // Helper function to perform sum queries (example for revenue)
        const fetchSum = async (tableName: string, columnName: string): Promise<number> => {
          const { data, error } = await supabase
            .from(tableName)
            .select(columnName)
            .eq("enterprise_id", enterpriseId);

          if (error) throw error;
          return data?.reduce((sum, row) => sum + ((row as any)[columnName] || 0), 0) ?? 0;
        };

        // Fetch all stats concurrently
        const [
          totalInvoices,
          pendingInvoicesCount,
          totalRevenue, // Example: Assuming 'total' column in 'invoices'
          totalProducts,
          totalEmployees,
          totalDepartments,
          totalJobs,
          totalClients,
          totalCompanies,
          totalVendors,
          totalOffices,
          totalWarehouses,
          totalBranches,
        ] = await Promise.all([
          fetchCount("invoices"),
          fetchCount("invoices", { status: "pending" }), // Filter for pending invoices
          fetchSum("invoices", "total"), // Example sum query
          fetchCount("products"),
          fetchCount("employees"),
          fetchCount("departments"),
          fetchCount("jobs"),
          fetchCount("clients"),
          fetchCount("companies"),
          fetchCount("vendors"),
          fetchCount("offices"),
          fetchCount("warehouses"),
          fetchCount("branches"),
        ]);

        if (!isMounted) return;

        setStats({
          totalInvoices,
          pendingInvoices: pendingInvoicesCount,
          totalRevenue,
          totalProducts,
          totalEmployees,
          totalDepartments,
          totalJobs,
          totalClients,
          totalCompanies,
          totalVendors,
          totalOffices,
          totalWarehouses,
          totalBranches,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats individually:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "An error occurred while fetching dashboard stats",
          );
          // Optionally set stats to 0 on error or keep previous state
          setStats({
            // Reset stats on error
            totalInvoices: 0,
            totalProducts: 0,
            totalRevenue: 0,
            pendingInvoices: 0,
            totalEmployees: 0,
            totalDepartments: 0,
            totalJobs: 0,
            totalClients: 0,
            totalCompanies: 0,
            totalVendors: 0,
            totalOffices: 0,
            totalWarehouses: 0,
            totalBranches: 0,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [user?.id, enterprise?.id, supabase]); // Add supabase as dependency

  // Show error state
  if (error) {
    return (
      <DataPageLayout>
        <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold">{t("Dashboard.error_loading")}</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DataPageLayout>
    );
  }

  return (
    <div>
      <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
      {profile?.stripe_customer_id && (
        <div className="bg-green-500/20 p-1 text-center text-xs text-green-700 dark:text-green-300">
          ✓ Premium Account
        </div>
      )}
      {/* <PageTitle
        texts={{
          title: t("Dashboard.title"),
          submit_form: t("Dashboard.title"),
          cancel: t("General.cancel"),
        }}
      /> */}
      <div className="space-y-8 p-4">
        {/* Contacts Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Contacts.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Clients.title")}
              value={stats.totalClients}
              loading={loading}
              link="/clients"
            />
            <StatCard
              title={t("Companies.title")}
              value={stats.totalCompanies}
              loading={loading}
              link="/companies"
            />
            <StatCard
              title={t("Vendors.title")}
              value={stats.totalVendors}
              loading={loading}
              link="/vendors"
            />
          </div>
        </div>

        {/* Locations Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Locations.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Offices.title")}
              value={stats.totalOffices}
              loading={loading}
              link="/offices"
            />
            <StatCard
              title={t("Warehouses.title")}
              value={stats.totalWarehouses}
              loading={loading}
              link="/warehouses"
            />
            <StatCard
              title={t("Branches.title")}
              value={stats.totalBranches}
              loading={loading}
              link="/branches"
            />
          </div>
        </div>

        {/* Sales & Revenue Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Sales.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Invoices.title")}
              value={stats.totalInvoices}
              loading={loading}
              link="/invoices"
              additionalText={`${stats.pendingInvoices} ${t("Dashboard.pending")}`}
            />
            <StatCard
              title={t("Products.title")}
              value={stats.totalProducts}
              loading={loading}
              link="/products"
            />

            <StatCard
              title={t("Invoices.title")}
              value={stats.pendingInvoices}
              loading={loading}
              additionalText={
                stats.totalInvoices > 0
                  ? `${((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)}% ${t(
                      "Dashboard.of_total",
                    )}`
                  : `0% ${t("Dashboard.of_total")}`
              }
            />
          </div>
        </div>

        {/* Human Resources Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("HumanResources.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Employees.title")}
              value={stats.totalEmployees}
              loading={loading}
              link="/employees"
            />
            <StatCard
              title={t("Departments.title")}
              value={stats.totalDepartments}
              loading={loading}
              link="/departments"
            />
            <StatCard
              title={t("Jobs.title")}
              value={stats.totalJobs}
              loading={loading}
              link="/jobs"
            />
          </div>

          <ActivityCalendar />
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};

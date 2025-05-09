import { pick } from "lodash";
import { Terminal } from "lucide-react";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { StatCard } from "@/ui/stat-card";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ActivityCalendar from "@/components/ui/activity-calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { getActivityCountsByDate } from "@/modules/activity/activity.service";
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

// New interface for activity count data
interface ActivityCountData {
  date: string; // YYYY-MM-DD
  count: number;
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
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // State for activity calendar
  const [activityCounts, setActivityCounts] = useState<ActivityCountData[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

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

  // Fetch dashboard stats and activity data
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted || !user?.id || !enterprise?.id) {
        if (isMounted) {
          setLoadingStats(false);
          setLoadingActivity(false);
        }
        return;
      }

      const enterpriseId = enterprise.id; // Cache enterprise ID

      // Reset states on new fetch
      setLoadingStats(true);
      setLoadingActivity(true);
      setStatsError(null);
      setActivityError(null);

      // --- Fetch Stats --- (extracted logic)
      const fetchStats = async () => {
        try {
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

          const fetchSum = async (tableName: string, columnName: string): Promise<number> => {
            const { data, error } = await supabase
              .from(tableName)
              .select(columnName)
              .eq("enterprise_id", enterpriseId);

            if (error) throw error;
            return data?.reduce((sum, row) => sum + ((row as any)[columnName] || 0), 0) ?? 0;
          };

          const [
            totalInvoices,
            pendingInvoicesCount,
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
          ] = await Promise.all([
            fetchCount("invoices"),
            fetchCount("invoices", { status: "pending" }),
            fetchSum("invoices", "total"),
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

          if (isMounted) {
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
          }
        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
          if (isMounted) {
            setStatsError(
              err instanceof Error
                ? err.message
                : "An error occurred while fetching dashboard stats",
            );
            // Reset stats on error
            setStats({
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
            setLoadingStats(false);
          }
        }
      };

      // --- Fetch Activity Counts ---
      const fetchActivity = async () => {
        try {
          const endDate = new Date(); // Today
          const startDate = new Date();
          startDate.setFullYear(endDate.getFullYear() - 1);
          startDate.setDate(startDate.getDate() + 1); // Start from the day *after* one year ago

          const counts = await getActivityCountsByDate(startDate, endDate);
          if (isMounted) {
            setActivityCounts(counts);
          }
        } catch (err) {
          console.error("Error fetching activity counts:", err);
          if (isMounted) {
            setActivityError(
              err instanceof Error ? err.message : "An error occurred while fetching activity data",
            );
            setActivityCounts([]); // Clear data on error
          }
        } finally {
          if (isMounted) {
            setLoadingActivity(false);
          }
        }
      };

      // Run fetches concurrently
      await Promise.all([fetchStats(), fetchActivity()]);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, enterprise?.id, supabase]); // Add supabase as dependency

  // Show error state for stats (kept separate for now)
  if (statsError) {
    return (
      <DataPageLayout>
        <CustomPageMeta
          title={t("Pages.Dashboard.title")}
          description={t("Pages.Dashboard.title")}
        />
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold">{t("Pages.Dashboard.title")}</h2>
          <p className="text-muted-foreground">{statsError}</p>
        </div>
      </DataPageLayout>
    );
  }

  return (
    <div>
      <CustomPageMeta title={t("Pages.Dashboard.title")} description={t("Pages.Dashboard.title")} />
      {profile?.stripe_customer_id && (
        <div className="bg-green-500/20 p-1 text-center text-xs text-green-700 dark:text-green-300">
          ✓ Premium Account
        </div>
      )}
      <div className="space-y-8 p-4">
        {/* Contacts Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Pages.Contacts.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Pages.Clients.title")}
              value={stats.totalClients}
              loading={loadingStats}
              link="/clients"
            />
            <StatCard
              title={t("Pages.Companies.title")}
              value={stats.totalCompanies}
              loading={loadingStats}
              link="/companies"
            />
            <StatCard
              title={t("Pages.Vendors.title")}
              value={stats.totalVendors}
              loading={loadingStats}
              link="/vendors"
            />
          </div>
        </div>

        {/* Locations Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Pages.Locations.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Pages.Offices.title")}
              value={stats.totalOffices}
              loading={loadingStats}
              link="/offices"
            />
            <StatCard
              title={t("Pages.Warehouses.title")}
              value={stats.totalWarehouses}
              loading={loadingStats}
              link="/warehouses"
            />
            <StatCard
              title={t("Pages.Branches.title")}
              value={stats.totalBranches}
              loading={loadingStats}
              link="/branches"
            />
          </div>
        </div>

        {/* Sales & Revenue Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Pages.Sales.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Pages.Invoices.title")}
              value={stats.totalInvoices}
              loading={loadingStats}
              link="/invoices"
              // additionalText={`${stats.pendingInvoices} ${t("Pages.Invoices.pending")}`}
            />
            <StatCard
              title={t("Pages.Products.title")}
              value={stats.totalProducts}
              loading={loadingStats}
              link="/products"
            />
          </div>
        </div>

        {/* Human Resources Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Pages.HumanResources.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title={t("Pages.Employees.title")}
              value={stats.totalEmployees}
              loading={loadingStats}
              link="/employees"
            />
            <StatCard
              title={t("Pages.Departments.title")}
              value={stats.totalDepartments}
              loading={loadingStats}
              link="/departments"
            />
            <StatCard
              title={t("Pages.Jobs.title")}
              value={stats.totalJobs}
              loading={loadingStats}
              link="/jobs"
            />
          </div>

          {/* <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">{t("ActivityLogs.title")}</h3>
            {activityError && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Activity</AlertTitle>
                <AlertDescription>{activityError}</AlertDescription>
              </Alert>
            )}
            {loadingActivity ? (
              <Skeleton className="h-[180px] w-full rounded-md" />
            ) : (
              <ActivityCalendar data={activityCounts} />
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}

Dashboard.messages = ["Pages", "General", "Dashboard"];

// export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
//   return {
//     props: {
//       messages: pick((await import(`../../locales/${locale}.json`)).default, Dashboard.messages),
//     },
//   };
// };

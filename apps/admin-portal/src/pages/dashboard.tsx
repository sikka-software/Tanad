import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import useDashboardStore from "@/stores/dashboard.store";
import useUserStore from "@/stores/use-user-store";

import DashboardCards from "../components/app/DashboardStatsCards";
import DashboardStatsVertical from "../components/app/DashboardStatsVertical";
import { DashboardStats } from "../types/dashboard.types";

export default function Dashboard() {
  const viewMode = useDashboardStore((state) => state.viewMode);
  const setViewMode = useDashboardStore((state) => state.setViewMode);

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
    totalSalaries: 0,
    totalOffices: 0,
    totalWarehouses: 0,
    totalBranches: 0,
    totalCars: 0,
    totalTrucks: 0,
    totalExpenses: 0,
    totalPurchases: 0,
    totalQuotes: 0,
    totalRoles: 0,
    totalJobListings: 0,
    totalEmployeeRequests: 0,
    // totalApplicants: 0,
    totalUsers: 0,
    totalDomains: 0,
    totalWebsites: 0,
    totalServers: 0,
    totalOnlineStores: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const t = useTranslations();
  const { user, profile, enterprise } = useUserStore();
  const hasPermission = useUserStore((state) => state.hasPermission);

  // Fetch dashboard stats and activity data
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted || !user?.id || !enterprise?.id) {
        if (isMounted) {
          setLoadingStats(false);
        }
        return;
      }

      const enterpriseId = enterprise.id; // Cache enterprise ID

      // Reset states on new fetch
      setLoadingStats(true);
      setStatsError(null);

      // --- Fetch Stats --- (extracted logic)
      const fetchStats = async () => {
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

        const fetchUserCount = async (): Promise<number> => {
          // Count distinct profile_id in memberships for this enterprise
          const { count, error } = await supabase
            .from("memberships")
            .select("profile_id", { count: "exact", head: true })
            .eq("enterprise_id", enterpriseId);
          if (error) throw error;
          return count ?? 0;
        };

        // const invoices = await supabase
        //   .from("invoices")
        //   .select("id", { count: "exact", head: true })
        //   .eq("enterprise_id", enterpriseId);

        // const totalInvoices = await fetchCount("invoices");
        // console.log("invoices", totalInvoices);
        try {
          const [
            totalInvoices,
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
            totalCars,
            totalTrucks,
            totalExpenses,
            totalPurchases,
            totalSalaries,
            totalQuotes,
            totalRoles,
            totalJobListings,
            totalEmployeeRequests,
            // totalApplicants,
            totalUsers,
            totalDomains,
            totalWebsites,
            totalServers,
            totalOnlineStores,
          ] = await Promise.all([
            fetchCount("invoices"),
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
            fetchCount("cars"),
            fetchCount("trucks"),
            fetchCount("expenses"),
            fetchCount("purchases"),
            fetchCount("salaries"),
            fetchCount("quotes"),
            fetchCount("roles"),
            fetchCount("job_listings"),
            fetchCount("employee_requests"),
            // fetchCount("applicants"),
            fetchUserCount(),
            fetchCount("domains"),
            fetchCount("websites"),
            fetchCount("servers"),
            fetchCount("online_stores"),
          ]);

          setStats({
            totalInvoices,
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
            totalCars,
            totalTrucks,
            totalExpenses,
            totalPurchases,
            totalSalaries,
            totalQuotes,
            totalRoles,
            totalJobListings,
            totalEmployeeRequests,
            // totalApplicants,
            totalUsers,
            totalDomains,
            totalWebsites,
            totalServers,
            totalOnlineStores,
          });
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
              totalSalaries: 0,
              totalOffices: 0,
              totalWarehouses: 0,
              totalBranches: 0,
              totalCars: 0,
              totalTrucks: 0,
              totalExpenses: 0,
              totalPurchases: 0,
              totalQuotes: 0,
              totalRoles: 0,
              totalJobListings: 0,
              totalEmployeeRequests: 0,
              totalApplicants: 0,
              totalUsers: 0,
              totalDomains: 0,
              totalWebsites: 0,
              totalServers: 0,
              totalOnlineStores: 0,
            });
          }
        } finally {
          if (isMounted) {
            setLoadingStats(false);
          }
        }
      };

      // --- Fetch Activity Counts ---
      // const fetchActivity = async () => {
      //   try {
      //     const endDate = new Date(); // Today
      //     const startDate = new Date();
      //     startDate.setFullYear(endDate.getFullYear() - 1);
      //     startDate.setDate(startDate.getDate() + 1); // Start from the day *after* one year ago

      //     const counts = await getActivityCountsByDate(startDate, endDate);
      //     if (isMounted) {
      //       setActivityCounts(counts);
      //     }
      //   } catch (err) {
      //     console.error("Error fetching activity counts:", err);
      //     if (isMounted) {
      //       setActivityError(
      //         err instanceof Error ? err.message : "An error occurred while fetching activity data",
      //       );
      //       setActivityCounts([]); // Clear data on error
      //     }
      //   } finally {
      //     if (isMounted) {
      //       setLoadingActivity(false);
      //     }
      //   }
      // };

      // Run fetches concurrently
      await Promise.all([
        fetchStats(),
        //  fetchActivity()
      ]);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, enterprise?.id, supabase]);

  if (statsError) {
    return (
      <DataPageLayout>
        <CustomPageMeta
          title={t("Pages.Dashboard.title")}
          description={t("Pages.Dashboard.title")}
        />
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold">{t("Pages.Dashboard.title")}</h2>
          <p className="text-muted-foreground">ERROR:{statsError}</p>
        </div>
      </DataPageLayout>
    );
  }

  return (
    <div>
      <CustomPageMeta title={t("Pages.Dashboard.title")} description={t("Pages.Dashboard.title")} />

      {viewMode === "vertical" ? (
        <DashboardStatsVertical stats={stats} loadingStats={loadingStats} />
      ) : (
        <DashboardCards stats={stats} loadingStats={loadingStats} />
      )}
    </div>
  );
}

Dashboard.messages = ["Metadata", "Pages", "General", "Dashboard"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, Dashboard.messages),
    },
  };
};

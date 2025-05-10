import { ModulesOptions } from "@root/tanad.config";
import { pick } from "lodash";
import {
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  Package,
  Store,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { StatCard } from "@/ui/stat-card";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { getActivityCountsByDate } from "@/modules/activity/activity.service";
import useUserStore from "@/stores/use-user-store";

import { convertToPascalCase } from "../lib/utils";

// Update state interface to match view column names (or map later)
interface DashboardStats {
  totalSalaries: number;
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
  totalCars: number;
  totalTrucks: number;
  totalExpenses: number;
  totalPurchases: number;
  totalQuotes: number;
  totalRoles: number;
  totalJobListings: number;
  totalEmployeeRequests: number;
  totalApplicants: number;
  totalUsers: number;
  totalDomains: number;
  totalWebsites: number;
  totalServers: number;
  totalOnlineStores: number;
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
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // State for activity calendar
  const [activityCounts, setActivityCounts] = useState<ActivityCountData[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const t = useTranslations();
  const { user, profile, enterprise } = useUserStore();

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
            totalCars,
            totalTrucks,
            totalExpenses,
            totalPurchases,
            totalSalaries,
            totalQuotes,
            totalRoles,
            totalJobListings,
            totalEmployeeRequests,
            totalApplicants,
            totalUsers,
            totalDomains,
            totalWebsites,
            totalServers,
            totalOnlineStores,
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
            fetchCount("cars"),
            fetchCount("trucks"),
            fetchCount("expenses"),
            fetchCount("purchases"),
            fetchCount("salaries"),
            fetchCount("quotes"),
            fetchCount("roles"),
            fetchCount("job_listings"),
            fetchCount("employee_requests"),
            fetchCount("applicants"),
            fetchCount("users"),
            fetchCount("domains"),
            fetchCount("websites"),
            fetchCount("servers"),
            fetchCount("online_stores"),
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
              totalCars,
              totalTrucks,
              totalExpenses,
              totalPurchases,
              totalSalaries,
              totalQuotes,
              totalRoles,
              totalJobListings,
              totalEmployeeRequests,
              totalApplicants,
              totalUsers,
              totalDomains,
              totalWebsites,
              totalServers,
              totalOnlineStores,
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
        <div>
          {Object.entries(
            Object.entries(ModulesOptions).reduce(
              (acc, [key, module]) => {
                // Use a default category if somehow undefined, though type system should prevent this
                const category = module.category || "Uncategorized";
                if (!acc[category]) {
                  acc[category] = [];
                }
                // Add the original key to the module object for use in loops
                acc[category].push({ ...module, key });
                return acc;
              },
              {} as Record<string, Array<(typeof ModulesOptions)[string] & { key: string }>>,
            ),
          ).map(([categoryName, modulesInCategory]) => (
            <div key={categoryName} className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold capitalize">
                {/* You might want to translate category names too if they are dynamic */}
                {t(`Pages.${categoryName.replace(/\s+/g, "_")}.title`) || categoryName}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {modulesInCategory.map((module) => {
                  const skippedModules = [
                    "dashboard",
                    "activity_logs", // Still skipping these as per original logic
                    "analytics",
                    "sales",
                    "human_resources",
                    "internet",
                    "storage",
                    "recruitment",
                    "settings",
                  ];
                  if (skippedModules.includes(module.key)) return null;
                  const pascalKey = convertToPascalCase(module.key);
                  return (
                    <StatCard
                      key={module.key}
                      icon={<module.icon className="bg--500 m-0 size-4" />}
                      title={t(module.translationKey)}
                      value={stats[`total${pascalKey}` as keyof DashboardStats]}
                      loading={loadingStats}
                      link={module.url}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Dashboard.messages = ["Pages", "General", "Dashboard"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, Dashboard.messages),
    },
  };
};

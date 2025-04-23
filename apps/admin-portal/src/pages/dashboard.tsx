import { Plus, Users, Building2, Briefcase, Package, MapPin, Loader2 } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";

import { useBranches } from "@/modules/branch/branch.hooks";
import { useClients } from "@/modules/client/client.hooks";
import { useCompanies } from "@/modules/company/company.hooks";
import { useDepartments } from "@/modules/department/department.hooks";
import { useEmployees } from "@/modules/employee/employee.hooks";
import { useJobs } from "@/modules/job/job.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useVendors } from "@/modules/vendor/vendor.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

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
  const { user, profile, enterprise, initialized, loading: authLoading } = useUserStore();

  // Use our existing hooks
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: jobs } = useJobs();
  const { data: clients } = useClients();
  const { data: companies } = useCompanies();
  const { data: vendors } = useVendors();
  const { data: offices } = useOffices();
  const { data: warehouses } = useWarehouses();
  const { data: branches } = useBranches();

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

  // Check authentication first
  useEffect(() => {
    console.log("[Dashboard] Auth check - user:", !!user, "profile:", !!profile, "enterprise:", !!enterprise);
    console.log("[Dashboard] Auth state - initialized:", initialized, "authLoading:", authLoading);
    
    // Commented out for gradual build-up of authentication
    /*
    if (!authLoading && initialized) {
      if (!user || !profile || !enterprise) {
        router.replace("/auth");
      }
    }
    */
    
    // For our gradual build-up, we'll just log the auth state but allow access
    if (!authLoading && initialized) {
      if (!user) {
        console.log("[Dashboard] No user found, but allowing access for debugging");
      } else {
        console.log("[Dashboard] User authenticated:", user.email);
      }
    }
  }, [user, profile, enterprise, initialized, authLoading, router]);

  // Fetch dashboard stats
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardStats() {
      if (!isMounted || !user?.id || !enterprise?.id) {
        return;
      }

      try {
        // Fetch total invoices and revenue
        const { data: invoiceStats, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, total, status")
          .eq("enterprise_id", enterprise.id);

        if (invoiceError) throw invoiceError;

        // Fetch total products
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("enterprise_id", enterprise.id);

        if (productError) throw productError;

        if (!isMounted) return;

        const totalRevenue =
          invoiceStats?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        const pendingInvoices =
          invoiceStats?.filter((invoice) => invoice.status.toLowerCase() === "pending").length || 0;

        setStats({
          totalInvoices: invoiceStats?.length || 0,
          totalProducts: productCount || 0,
          totalRevenue,
          pendingInvoices,
          totalEmployees: employees?.length || 0,
          totalDepartments: departments?.length || 0,
          totalJobs: jobs?.length || 0,
          totalClients: clients?.length || 0,
          totalCompanies: companies?.length || 0,
          totalVendors: vendors?.length || 0,
          totalOffices: offices?.length || 0,
          totalWarehouses: warehouses?.length || 0,
          totalBranches: branches?.length || 0,
        });
      } catch (err) {
        console.error("[Dashboard] Error fetching stats:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "An error occurred while fetching dashboard stats",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (user?.id && enterprise?.id) {
      fetchDashboardStats();
    }

    return () => {
      isMounted = false;
    };
  }, [
    user?.id,
    enterprise?.id,
    employees,
    departments,
    jobs,
    clients,
    companies,
    vendors,
    offices,
    warehouses,
    branches,
  ]);

  // Show loading state while auth is initializing
  if (authLoading) {
    console.log("[Dashboard] Showing loading state - authLoading:", authLoading);
    return (
      <DataPageLayout>
        <div className="flex h-[50vh] items-center justify-center flex-col">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <div>Loading authentication state...</div>
        </div>
      </DataPageLayout>
    );
  }
  
  // For our gradual build-up, we'll show a warning if not initialized but still allow access
  if (!initialized) {
    console.log("[Dashboard] Not initialized yet, but allowing access");
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <DataPageLayout>
        <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
        <PageTitle texts={{ title: t("Dashboard.title") }} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </DataPageLayout>
    );
  }

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

  // Debug auth state
  console.log("[Dashboard] Render - user:", user);
  console.log("[Dashboard] Render - user ID:", user?.id);
  console.log("[Dashboard] Render - profile:", profile);
  console.log("[Dashboard] Render - enterprise:", enterprise);
  
  // Add auth debug banner
  const AuthDebugBanner = () => (
    <div className={`p-2 text-center text-xs ${user ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-yellow-500/80 text-black'}`}>
      {user 
        ? `✓ Authenticated as ${user.email}` 
        : '⚠️ Not authenticated - this would normally redirect to login'}
    </div>
  );
  return (
    <div>
      <AuthDebugBanner />
      <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
      <PageTitle
        texts={{
          title: t("Dashboard.title"),
          submit_form: t("Dashboard.title"),
          cancel: t("General.cancel"),
        }}
        customButton={
          <div className="flex items-center">
            <Combobox
              data={createOptions}
              onChange={handleCreateOption}
              texts={{
                placeholder: t("Dashboard.select_create_option"),
                noItems: t("General.no_results"),
                searchPlaceholder: t("General.search"),
              }}
              width="fit"
              inputProps={{
                className: "focus:ring-0",
              }}
              renderSelected={(item) => (
                <div className="flex items-center">
                  <Plus className="me-2 h-4 w-4" />
                  {item.label}
                </div>
              )}
            />
          </div>
        }
      />
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              title={t("Revenue.title")}
              value={`$${stats.totalRevenue.toFixed(2)}`}
              loading={loading}
            />
            <StatCard
              title={t("Invoices.title")}
              value={stats.pendingInvoices}
              loading={loading}
              additionalText={`${((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)}% ${t(
                "Dashboard.of_total",
              )}`}
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

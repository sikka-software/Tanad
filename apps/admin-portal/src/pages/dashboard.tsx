import { Plus, Users, Building2, Briefcase, Package, MapPin } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useUserStore();

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

  // Fetch dashboard stats
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardStats() {
      if (!isMounted || !user?.id) {
        console.log("[Dashboard] Skipping fetch - conditions not met:", {
          isMounted,
          hasUser: !!user?.id,
        });
        return;
      }

      console.log("[Dashboard] Starting stats fetch for user:", user.id);
      setLoading(true);
      setError(null);

      try {
        // Fetch total invoices and revenue
        const { data: invoiceStats, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, total, status")
          .eq("user_id", user.id);

        if (invoiceError) throw invoiceError;

        // Fetch total products
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

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

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [
    user?.id,
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

  if (error) {
    return (
      <div>
        <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
        <PageTitle
          texts={{
            title: t("Dashboard.title"),
            submit_form: t("Dashboard.title"),
            cancel: t("General.cancel"),
          }}
        />
        <div className="p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
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
